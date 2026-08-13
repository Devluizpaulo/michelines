-- ============================================================================
-- Campos do lead que faltaram no schema inicial.
--
-- Separado em outra migração de propósito: se 0001 já rodou, um
-- `create table if not exists` não acrescentaria colunas novas. Aqui usamos
-- `add column if not exists`, que funciona nos dois casos.
-- ============================================================================

alter table public.leads
  -- Perfis de interesse comercial
  add column if not exists interest_airport   boolean not null default false,
  add column if not exists interest_executive boolean not null default false,
  add column if not exists is_taxi_driver     boolean not null default false,
  add column if not exists has_cnh_ear        boolean not null default false,

  -- Alvará / licença
  add column if not exists has_license     boolean not null default false,
  add column if not exists license_details text,

  -- Contatos de recado
  add column if not exists message_name_1  text,
  add column if not exists message_phone_1 text,
  add column if not exists message_name_2  text,
  add column if not exists message_phone_2 text,

  -- Contexto
  add column if not exists lead_reason       text,
  add column if not exists city_neighborhood text,

  -- Score de qualificação em cache (o cálculo vive em lib/lead-score.ts)
  add column if not exists lead_score integer,

  -- Anexos antigos vindos do site legado, no formato { chave: url }
  add column if not exists file_urls jsonb not null default '{}'::jsonb,

  -- Campos que saíram do formulário de captação, preservados para os leads
  -- já existentes que os possuem
  add column if not exists payment_preference text,
  add column if not exists contract_type      text;

comment on column public.leads.payment_preference is
  'Legado: removido do formulário público em 2026. Mantido para leads antigos.';
comment on column public.leads.contract_type is
  'Legado: removido do formulário público em 2026. Mantido para leads antigos.';
