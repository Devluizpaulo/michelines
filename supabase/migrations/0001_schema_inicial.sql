-- ============================================================================
-- Grupo Michelines — schema inicial (migração Firestore → Supabase)
--
-- Como aplicar: painel do Supabase → SQL Editor → cole este arquivo → Run.
-- É idempotente: pode ser reexecutado sem quebrar o que já existe.
--
-- Decisões de modelagem:
--   • Ids continuam TEXT, não UUID, para preservar os ids atuais do Firestore
--     e não invalidar links, protocolos e referências já espalhados.
--   • `interactions` e `attachedDocs`, hoje arrays dentro do documento do lead,
--     viram tabelas próprias: array em documento não dá para consultar,
--     ordenar nem auditar, e cresce sem limite dentro da linha.
--   • Campos de forma livre (specs, tags, utm) ficam em JSONB.
--   • Papéis vivem em admin_users; auth.users guarda apenas a credencial.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ─── Utilitário: mantém updated_at sempre coerente ──────────────────────────
create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- 1. ADMIN_USERS — perfil e papel de quem acessa o painel
-- ============================================================================
do $$ begin
  create type public.user_role as enum
    ('super_admin', 'supervisor', 'gerente', 'vendedor', 'marketing');
exception when duplicate_object then null;
end $$;

create table if not exists public.admin_users (
  -- Mesma chave de auth.users: o perfil morre junto com a credencial
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text not null default '',
  phone        text,
  role         public.user_role not null default 'vendedor',
  active       boolean not null default true,
  avatar_url   text,
  created_by   uuid references auth.users(id) on delete set null,
  last_login   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_admin_users_role on public.admin_users(role) where active;

drop trigger if exists trg_admin_users_updated on public.admin_users;
create trigger trg_admin_users_updated before update on public.admin_users
  for each row execute function public.tocar_updated_at();

-- Helpers de RLS. SECURITY DEFINER evita recursão: a policy de admin_users
-- precisa ler admin_users para decidir, o que sem isto entraria em laço.
create or replace function public.e_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and active
  );
$$;

create or replace function public.e_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and active and role = 'super_admin'
  );
$$;

create or replace function public.meu_papel()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_users where id = auth.uid() and active;
$$;

alter table public.admin_users enable row level security;

drop policy if exists admin_users_ler_proprio on public.admin_users;
create policy admin_users_ler_proprio on public.admin_users
  for select using (id = auth.uid() or public.e_admin());

drop policy if exists admin_users_criar on public.admin_users;
create policy admin_users_criar on public.admin_users
  for insert with check (public.e_super_admin());

-- Cada um edita os próprios dados de exibição; papel e status ativo são
-- exclusivos do super admin (impede autopromoção).
--
-- O papel vem de meu_papel(), que é SECURITY DEFINER: uma subconsulta direta a
-- admin_users aqui dentro reativaria o RLS desta mesma tabela e entraria em
-- recursão infinita, derrubando qualquer UPDATE.
drop policy if exists admin_users_editar on public.admin_users;
create policy admin_users_editar on public.admin_users
  for update using (public.e_super_admin() or id = auth.uid())
  with check (
    public.e_super_admin()
    or (id = auth.uid() and role = public.meu_papel() and active)
  );

drop policy if exists admin_users_excluir on public.admin_users;
create policy admin_users_excluir on public.admin_users
  for delete using (public.e_super_admin() and id <> auth.uid());

-- ============================================================================
-- 2. LEADS — o coração do CRM
-- ============================================================================
do $$ begin
  create type public.lead_status as enum
    ('new', 'contacted', 'negotiating', 'scheduled', 'converted', 'lost');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.credit_status as enum
    ('pending', 'approved', 'rejected', 'needs_authorization');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.registration_status as enum
    ('complete', 'incomplete', 'pending_contact');
exception when duplicate_object then null;
end $$;

create table if not exists public.leads (
  id   text primary key default gen_random_uuid()::text,

  -- Identificação
  full_name text not null,
  phone     text not null,
  whatsapp  text,
  email     text,
  cpf       text,
  rg        text,
  protocol  text,

  -- Endereço
  cep                  text,
  address              text,
  address_street       text,
  address_number       text,
  address_complement   text,
  address_neighborhood text,
  address_city         text,
  address_state        text,
  address_notes        text,

  -- Origem e interesse
  source           text not null default 'Cadastro Site',
  vehicle_interest text,
  operation_interest text,
  situation        text,
  campaign_id      text,
  campaign_name    text,
  utm              jsonb not null default '{}'::jsonb,

  -- Funil
  status    public.lead_status not null default 'new',
  contacted boolean not null default false,
  whatsapp_sent boolean not null default false,
  archived  boolean not null default false,
  assigned_to uuid references public.admin_users(id) on delete set null,
  notes     text,

  -- Qualificação
  has_condutax     text,
  condutax_number  text,
  has_own_alvara   text,
  worked_in_fleet  text,
  fleet_name       text,
  fleet_duration   text,
  experience_years text,
  has_cnh          text,
  cnh_number       text,
  cnh_category     text,
  has_ear          text,
  condutax_process text,
  passenger_experience text,
  needs_help_with  text[] not null default '{}',
  preferred_contact_time text,
  interest_dtaxi   boolean not null default false,
  interest_hybrid  boolean not null default false,
  interest_gnv     boolean not null default false,
  score            integer,

  -- Avaliação e decisão
  registration_status   public.registration_status,
  needs_more_data       boolean not null default false,
  contacted_for_data    boolean not null default false,
  credit_analysis_status public.credit_status not null default 'pending',
  credit_check          jsonb,
  approval_status       public.approval_status not null default 'pending',
  approved_by           text,
  approval_date         timestamptz,
  authorized_by         text,
  authorization_date    timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status      on public.leads(status) where not archived;
create index if not exists idx_leads_created     on public.leads(created_at desc);
create index if not exists idx_leads_campaign    on public.leads(campaign_id) where campaign_id is not null;
create index if not exists idx_leads_phone_digits on public.leads(regexp_replace(phone, '\D', '', 'g'));
create index if not exists idx_leads_cpf         on public.leads(cpf) where cpf is not null;

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.tocar_updated_at();

alter table public.leads enable row level security;

-- O formulário público cria leads sem estar autenticado
drop policy if exists leads_criar_publico on public.leads;
create policy leads_criar_publico on public.leads for insert with check (true);

drop policy if exists leads_admin_le on public.leads;
create policy leads_admin_le on public.leads for select using (public.e_admin());

drop policy if exists leads_admin_edita on public.leads;
create policy leads_admin_edita on public.leads for update using (public.e_admin());

drop policy if exists leads_admin_exclui on public.leads;
create policy leads_admin_exclui on public.leads
  for delete using (public.meu_papel() in ('super_admin', 'gerente'));

-- ============================================================================
-- 3. LEAD_INTERACTIONS — histórico (era array dentro do documento)
-- ============================================================================
do $$ begin
  create type public.interaction_type as enum
    ('whatsapp', 'note', 'status_change', 'credit_check', 'authorization',
     'document_upload', 'appointment', 'decision', 'archive', 'score_update');
exception when duplicate_object then null;
end $$;

create table if not exists public.lead_interactions (
  id         uuid primary key default gen_random_uuid(),
  lead_id    text not null references public.leads(id) on delete cascade,
  type       public.interaction_type not null,
  agent_name text not null,
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_interactions_lead on public.lead_interactions(lead_id, created_at desc);

alter table public.lead_interactions enable row level security;

drop policy if exists interactions_admin on public.lead_interactions;
create policy interactions_admin on public.lead_interactions
  for all using (public.e_admin()) with check (public.e_admin());

-- ============================================================================
-- 4. LEAD_DOCUMENTS — anexos (era array dentro do documento)
-- ============================================================================
do $$ begin
  create type public.doc_category as enum
    ('cnh', 'condutax', 'residencia', 'foto', 'consulta_cpf', 'contrato', 'outros');
exception when duplicate_object then null;
end $$;

create table if not exists public.lead_documents (
  id          uuid primary key default gen_random_uuid(),
  lead_id     text not null references public.leads(id) on delete cascade,
  name        text not null,
  url         text not null,
  storage_path text,
  category    public.doc_category not null default 'outros',
  uploaded_by text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_documents_lead on public.lead_documents(lead_id, created_at desc);

alter table public.lead_documents enable row level security;

drop policy if exists documents_admin on public.lead_documents;
create policy documents_admin on public.lead_documents
  for all using (public.e_admin()) with check (public.e_admin());

-- ============================================================================
-- 5. CAMPAIGNS — campanhas com página pública /c/{slug}
-- ============================================================================
do $$ begin
  create type public.campaign_status as enum ('draft', 'active', 'paused', 'ended');
exception when duplicate_object then null;
end $$;

create table if not exists public.campaigns (
  id          text primary key default gen_random_uuid()::text,
  slug        text not null unique,
  name        text not null,
  status      public.campaign_status not null default 'draft',
  headline    text not null,
  subheadline text,
  description text,
  image_url   text,
  highlights  text[] not null default '{}',
  cta_text    text not null default 'Quero me cadastrar',
  vehicle_interest text,
  theme       text not null default 'navy',
  start_date  date,
  end_date    date,
  views       integer not null default 0,
  clicks      integer not null default 0,
  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_campaigns_slug   on public.campaigns(slug);
create index if not exists idx_campaigns_status on public.campaigns(status);

drop trigger if exists trg_campaigns_updated on public.campaigns;
create trigger trg_campaigns_updated before update on public.campaigns
  for each row execute function public.tocar_updated_at();

alter table public.campaigns enable row level security;

-- A landing precisa ser lida por visitante anônimo
drop policy if exists campaigns_ler_publico on public.campaigns;
create policy campaigns_ler_publico on public.campaigns for select using (true);

drop policy if exists campaigns_admin_escreve on public.campaigns;
create policy campaigns_admin_escreve on public.campaigns
  for all using (public.e_admin()) with check (public.e_admin());

-- Visitante anônimo não pode dar UPDATE na tabela; os contadores sobem por esta
-- função, que roda com privilégio e só mexe em views/clicks.
create or replace function public.registrar_metrica_campanha(
  p_campaign_id text,
  p_metrica text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_metrica = 'view' then
    update public.campaigns set views = views + 1 where id = p_campaign_id;
  elsif p_metrica = 'click' then
    update public.campaigns set clicks = clicks + 1 where id = p_campaign_id;
  else
    raise exception 'Métrica inválida: %', p_metrica;
  end if;
end;
$$;

grant execute on function public.registrar_metrica_campanha(text, text) to anon, authenticated;

-- ============================================================================
-- 6. VEHICLES e VEHICLE_PRICING
-- ============================================================================
create table if not exists public.vehicles (
  id   text primary key default gen_random_uuid()::text,
  name text not null,
  slug text,
  category text,
  brand text,
  year  text,
  transmission text,
  fuel_type text,

  is_hybrid    boolean not null default false,
  has_gnv      boolean not null default false,
  is_dtaxi_approved boolean not null default false,
  is_accessible boolean not null default false,
  is_atende_approved boolean not null default false,
  has_radio_association boolean not null default false,
  is_dtp_approved boolean not null default false,
  has_dtp_course_support boolean not null default false,

  short_description text,
  full_description  text,
  positive_points text[] not null default '{}',
  highlights      text[] not null default '{}',
  specs           text[] not null default '{}',
  tags            text[] not null default '{}',

  monthly_price numeric(10,2),
  weekly_price  numeric(10,2),
  daily_price   numeric(10,2),

  status    text not null default 'active',
  available boolean not null default true,
  featured  boolean not null default false,
  showroom_featured boolean not null default false,
  showroom_order integer,

  lead_count   integer not null default 0,
  views_count  integer not null default 0,
  clicks_count integer not null default 0,

  thumbnail text,
  images    text[] not null default '{}',
  seo_title text,
  seo_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vehicles_showroom on public.vehicles(showroom_order)
  where status = 'active' and available;

drop trigger if exists trg_vehicles_updated on public.vehicles;
create trigger trg_vehicles_updated before update on public.vehicles
  for each row execute function public.tocar_updated_at();

alter table public.vehicles enable row level security;

drop policy if exists vehicles_ler_publico on public.vehicles;
create policy vehicles_ler_publico on public.vehicles for select using (true);

drop policy if exists vehicles_admin_escreve on public.vehicles;
create policy vehicles_admin_escreve on public.vehicles
  for all using (public.e_admin()) with check (public.e_admin());

create table if not exists public.vehicle_pricing (
  id         text primary key default gen_random_uuid()::text,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  daily_rate   numeric(10,2) not null default 0,
  weekly_rate  numeric(10,2) not null default 0,
  monthly_rate numeric(10,2) not null default 0,
  weekend_exempt boolean not null default false,
  accepted_payments text[] not null default '{}',
  active     boolean not null default true,
  promo_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pricing_vehicle on public.vehicle_pricing(vehicle_id);

drop trigger if exists trg_pricing_updated on public.vehicle_pricing;
create trigger trg_pricing_updated before update on public.vehicle_pricing
  for each row execute function public.tocar_updated_at();

alter table public.vehicle_pricing enable row level security;

drop policy if exists pricing_ler_publico on public.vehicle_pricing;
create policy pricing_ler_publico on public.vehicle_pricing for select using (true);

drop policy if exists pricing_admin_escreve on public.vehicle_pricing;
create policy pricing_admin_escreve on public.vehicle_pricing
  for all using (public.e_admin()) with check (public.e_admin());

-- ============================================================================
-- 7. HERO_SLIDES — carrossel da home
-- ============================================================================
create table if not exists public.hero_slides (
  id text primary key default gen_random_uuid()::text,
  "order" integer not null default 0,
  active  boolean not null default true,
  title   text,
  glow_title text,
  subtitle text,
  cta_text text,
  cta_url  text,
  image    text,
  mobile_image text,
  video    text,
  badge    text,
  overlay  text,
  theme    text,
  config   jsonb not null default '{}'::jsonb,
  views    integer not null default 0,
  clicks   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_slides_ordem on public.hero_slides("order") where active;

drop trigger if exists trg_slides_updated on public.hero_slides;
create trigger trg_slides_updated before update on public.hero_slides
  for each row execute function public.tocar_updated_at();

alter table public.hero_slides enable row level security;

drop policy if exists slides_ler_publico on public.hero_slides;
create policy slides_ler_publico on public.hero_slides for select using (true);

drop policy if exists slides_admin_escreve on public.hero_slides;
create policy slides_admin_escreve on public.hero_slides
  for all using (public.e_admin()) with check (public.e_admin());

-- ============================================================================
-- 8. SINGLETONS — configurações em linha única (chave/valor JSONB)
--    Substitui landing/settings, role_permissions/config e settings/*
-- ============================================================================
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_settings_updated on public.app_settings;
create trigger trg_settings_updated before update on public.app_settings
  for each row execute function public.tocar_updated_at();

alter table public.app_settings enable row level security;

drop policy if exists settings_ler_publico on public.app_settings;
create policy settings_ler_publico on public.app_settings for select using (true);

-- Permissões de papéis só o super admin altera
drop policy if exists settings_escreve on public.app_settings;
create policy settings_escreve on public.app_settings
  for all using (
    case when key = 'role_permissions' then public.e_super_admin() else public.e_admin() end
  ) with check (
    case when key = 'role_permissions' then public.e_super_admin() else public.e_admin() end
  );

-- ============================================================================
-- 9. APPOINTMENTS — agenda comercial
-- ============================================================================
do $$ begin
  create type public.appointment_type as enum ('visit', 'pickup', 'docs', 'callback');
exception when duplicate_object then null;
end $$;

create table if not exists public.appointments (
  id         text primary key default gen_random_uuid()::text,
  lead_id    text references public.leads(id) on delete set null,
  lead_name  text not null,
  lead_phone text,
  type       public.appointment_type not null default 'visit',
  date       timestamptz not null,
  notes      text,
  completed  boolean not null default false,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_data on public.appointments(date);

drop trigger if exists trg_appointments_updated on public.appointments;
create trigger trg_appointments_updated before update on public.appointments
  for each row execute function public.tocar_updated_at();

alter table public.appointments enable row level security;

drop policy if exists appointments_admin on public.appointments;
create policy appointments_admin on public.appointments
  for all using (public.e_admin()) with check (public.e_admin());

-- ============================================================================
-- 10. TESTIMONIALS — depoimentos exibidos na home
-- ============================================================================
create table if not exists public.testimonials (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  -- "time" é palavra reservada em alguns contextos do Postgres: sempre entre aspas
  "time"    text,
  testimony text not null,
  rating    smallint not null default 5 check (rating between 1 and 5),
  approved  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice que faltava no Firestore e derrubava a seção na home
create index if not exists idx_testimonials_aprovados
  on public.testimonials(created_at desc) where approved;

drop trigger if exists trg_testimonials_updated on public.testimonials;
create trigger trg_testimonials_updated before update on public.testimonials
  for each row execute function public.tocar_updated_at();

alter table public.testimonials enable row level security;

-- Visitante lê só os aprovados; admin vê tudo, inclusive a fila de moderação
drop policy if exists testimonials_ler_aprovados on public.testimonials;
create policy testimonials_ler_aprovados on public.testimonials
  for select using (approved or public.e_admin());

drop policy if exists testimonials_criar_publico on public.testimonials;
create policy testimonials_criar_publico on public.testimonials
  for insert with check (true);

drop policy if exists testimonials_admin_modera on public.testimonials;
create policy testimonials_admin_modera on public.testimonials
  for update using (public.e_admin());

drop policy if exists testimonials_admin_exclui on public.testimonials;
create policy testimonials_admin_exclui on public.testimonials
  for delete using (public.e_admin());

-- ============================================================================
-- 11. Coleções auxiliares
-- ============================================================================
create table if not exists public.operational_features (
  id    text primary key default gen_random_uuid()::text,
  data  jsonb not null default '{}'::jsonb,
  "order" integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.operational_features enable row level security;
drop policy if exists features_ler_publico on public.operational_features;
create policy features_ler_publico on public.operational_features for select using (true);
drop policy if exists features_admin on public.operational_features;
create policy features_admin on public.operational_features
  for all using (public.e_admin()) with check (public.e_admin());

create table if not exists public.simulator_scenarios (
  id   text primary key default gen_random_uuid()::text,
  data jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.simulator_scenarios enable row level security;
drop policy if exists sim_ler_publico on public.simulator_scenarios;
create policy sim_ler_publico on public.simulator_scenarios for select using (true);
drop policy if exists sim_admin on public.simulator_scenarios;
create policy sim_admin on public.simulator_scenarios
  for all using (public.e_admin()) with check (public.e_admin());

-- Frota legada importada do site antigo
create table if not exists public.drivers (
  id         text primary key default gen_random_uuid()::text,
  full_name  text,
  phone      text,
  whatsapp   text,
  cpf        text,
  car_model  text,
  city_neighborhood text,
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.drivers enable row level security;
drop policy if exists drivers_criar_publico on public.drivers;
create policy drivers_criar_publico on public.drivers for insert with check (true);
drop policy if exists drivers_admin on public.drivers;
create policy drivers_admin on public.drivers
  for select using (public.e_admin());
drop policy if exists drivers_admin_edita on public.drivers;
create policy drivers_admin_edita on public.drivers
  for update using (public.e_admin());

-- ============================================================================
-- 12. Realtime — substitui os listeners onSnapshot do Firestore
-- ============================================================================
do $$
begin
  -- A publicação já existe num projeto Supabase novo; ignoramos duplicatas.
  begin execute 'alter publication supabase_realtime add table public.leads'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.testimonials'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.hero_slides'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.vehicles'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.app_settings'; exception when others then null; end;
end $$;

-- ============================================================================
-- 13. Semente mínima de configuração
-- ============================================================================
insert into public.app_settings (key, value)
values ('role_permissions', '{
  "super_admin": ["dashboard","leads","campanhas","landing","frota","analytics","configuracoes","usuarios","operacao","depoimentos","agenda"],
  "supervisor":  ["dashboard","leads","frota","analytics","operacao","depoimentos","agenda"],
  "gerente":     ["dashboard","leads","campanhas","landing","frota","analytics","operacao","depoimentos","agenda"],
  "vendedor":    ["dashboard","leads","agenda"],
  "marketing":   ["dashboard","campanhas","landing","depoimentos"]
}'::jsonb)
on conflict (key) do nothing;

insert into public.app_settings (key, value)
values ('landing', '{}'::jsonb)
on conflict (key) do nothing;
