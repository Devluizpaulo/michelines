-- ============================================================================
-- 0005_campaign_sections.sql
-- Adiciona suporte a seções dinâmicas 4V e estatísticas de UTM na tabela campaigns
-- ============================================================================

alter table public.campaigns 
  add column if not exists sections jsonb not null default '[]'::jsonb,
  add column if not exists utm_stats jsonb not null default '{}'::jsonb;
