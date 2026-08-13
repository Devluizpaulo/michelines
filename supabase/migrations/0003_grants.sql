-- ============================================================================
-- GRANTs de tabela — o que faltava para o RLS sequer ser avaliado.
--
-- No Postgres existem duas camadas independentes:
--   1. GRANT   → o papel pode tocar na tabela?
--   2. RLS     → quais LINHAS ele enxerga?
-- Sem o passo 1 o banco recusa antes de olhar qualquer policy, e a resposta é
-- "permission denied for table", não "0 linhas". Tabelas criadas por SQL bruto
-- no editor não herdam esses grants automaticamente.
--
-- O padrão do Supabase é grant grosso + RLS fino: liberamos a operação e
-- deixamos as policies decidirem linha a linha.
-- ============================================================================

grant usage on schema public to anon, authenticated;

-- ─── Visitante anônimo: só o que alimenta o site público ────────────────────
grant select on
  public.campaigns,
  public.vehicles,
  public.vehicle_pricing,
  public.hero_slides,
  public.app_settings,
  public.testimonials,
  public.operational_features,
  public.simulator_scenarios
to anon;

-- Formulário público de captação e envio de depoimento
grant insert on public.leads, public.drivers, public.testimonials to anon;

-- ─── Usuário autenticado: acesso amplo, filtrado pelo RLS ───────────────────
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ─── Tabelas futuras já nascem com os grants corretos ───────────────────────
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

-- ─── Funções auxiliares chamadas pelo cliente ───────────────────────────────
grant execute on function public.registrar_metrica_campanha(text, text) to anon, authenticated;
grant execute on function public.e_admin() to authenticated;
grant execute on function public.e_super_admin() to authenticated;
grant execute on function public.meu_papel() to authenticated;
