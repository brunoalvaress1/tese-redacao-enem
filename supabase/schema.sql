-- =====================================================================
-- Tese · Correção de Redação ENEM — esquema do banco (Supabase)
-- Como usar: Supabase → SQL Editor → New query → cole TUDO → Run.
-- Pode ser executado mais de uma vez com segurança (idempotente).
-- =====================================================================

-- ---------- Perfis (1 por usuário do Supabase Auth) ----------
create table if not exists public.perfis (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text,
  criado_em   timestamptz not null default now()
);

alter table public.perfis enable row level security;

drop policy if exists "perfil: ler o próprio" on public.perfis;
create policy "perfil: ler o próprio" on public.perfis
  for select using (auth.uid() = id);

drop policy if exists "perfil: atualizar o próprio" on public.perfis;
create policy "perfil: atualizar o próprio" on public.perfis
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------- Correções ----------
create table if not exists public.correcoes (
  id           text primary key,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tema_id      text,
  tema_titulo  text,
  texto        text not null check (char_length(texto) <= 20000),
  nota_total   smallint not null check (nota_total between 0 and 1000),
  c1           smallint not null check (c1 between 0 and 200),
  c2           smallint not null check (c2 between 0 and 200),
  c3           smallint not null check (c3 between 0 and 200),
  c4           smallint not null check (c4 between 0 and 200),
  c5           smallint not null check (c5 between 0 and 200),
  resultado    jsonb not null,
  criado_em    timestamptz not null default now()
);

create index if not exists correcoes_user_data_idx on public.correcoes (user_id, criado_em desc);

alter table public.correcoes enable row level security;

drop policy if exists "correções: ler as próprias" on public.correcoes;
create policy "correções: ler as próprias" on public.correcoes
  for select using (auth.uid() = user_id);

drop policy if exists "correções: inserir as próprias" on public.correcoes;
create policy "correções: inserir as próprias" on public.correcoes
  for insert with check (auth.uid() = user_id);

drop policy if exists "correções: atualizar as próprias" on public.correcoes;
create policy "correções: atualizar as próprias" on public.correcoes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "correções: excluir as próprias" on public.correcoes;
create policy "correções: excluir as próprias" on public.correcoes
  for delete using (auth.uid() = user_id);

-- ---------- Resumo de desempenho por usuário (usado em relatórios) ----------
create or replace view public.desempenho_usuario
with (security_invoker = true) as
select
  user_id,
  count(*)                       as total_correcoes,
  round(avg(nota_total))::int    as media_total,
  max(nota_total)                as melhor_nota,
  round(avg(c1))::int as media_c1,
  round(avg(c2))::int as media_c2,
  round(avg(c3))::int as media_c3,
  round(avg(c4))::int as media_c4,
  round(avg(c5))::int as media_c5,
  max(criado_em)                 as ultima_correcao
from public.correcoes
group by user_id;

grant select on public.desempenho_usuario to authenticated;

-- ---------- Uso de IA: leitura de foto e correção (controle de limite diário das Edge Functions) ----------
create table if not exists public.transcricoes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo       text not null default 'foto', -- 'foto' (leitura) ou 'correcao' (correção com IA)
  criado_em  timestamptz not null default now()
);
alter table public.transcricoes add column if not exists tipo text not null default 'foto';

create index if not exists transcricoes_user_data_idx on public.transcricoes (user_id, criado_em desc);

alter table public.transcricoes enable row level security;

drop policy if exists "transcrições: ler as próprias" on public.transcricoes;
create policy "transcrições: ler as próprias" on public.transcricoes
  for select using (auth.uid() = user_id);

drop policy if exists "transcrições: registrar as próprias" on public.transcricoes;
create policy "transcrições: registrar as próprias" on public.transcricoes
  for insert with check (auth.uid() = user_id);

-- ---------- Keep-alive: evita que o Supabase (plano grátis) pause o projeto por inatividade ----------
-- Chamado a cada 5 dias pelo GitHub Actions (.github/workflows/manter-supabase-ativo.yml).
create table if not exists public.keepalive (
  id         bigint generated always as identity primary key,
  origem     text not null default 'bot',
  criado_em  timestamptz not null default now()
);
alter table public.keepalive enable row level security; -- sem políticas: acesso só pela função abaixo

create or replace function public.ping(origem text default 'bot')
returns json
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.keepalive (origem) values (left(coalesce(origem, 'bot'), 40));
  delete from public.keepalive where criado_em < now() - interval '120 days';
  return json_build_object('ok', true, 'em', now());
end;
$$;

revoke all on function public.ping(text) from public;
grant execute on function public.ping(text) to anon, authenticated;
