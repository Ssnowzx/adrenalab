
-- 1. Tabela de Perfis de Usuário (Estende auth.users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  display_name text,
  level text default 'INICIANTE', -- INICIANTE, AMADOR, PRO
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Ativar RLS (Segurança) em Profiles
alter table public.profiles enable row level security;

-- Política: Usuários podem ver seus próprios perfis
create policy "Users can view own profile"
on public.profiles for select
using ( auth.uid() = id );

-- Política: Usuários podem atualizar seus próprios perfis
create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );

-- 2. Trigger para criar perfil automaticamente após cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Tabela de Pedidos (Orders)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  total_amount decimal(10,2) not null,
  status text not null default 'pending', -- pending, approved, rejected
  payment_id text, -- ID do Mercado Pago
  payment_method text, -- credit_card, pix, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS em Orders
alter table public.orders enable row level security;

-- Política: Usuários veem apenas seus pedidos
create policy "Users can view own orders"
on public.orders for select
using ( auth.uid() = user_id );

-- Política: Apenas sistema/admin pode inserir (ou usuário autenticado via API segura)
-- Para simplificar o fluxo Client-Side atual, permitiremos Insert para o dono (mas o ideal seria via Server Function)
create policy "Users can insert own orders"
on public.orders for insert
with check ( auth.uid() = user_id );

-- 4. Tabela de Itens do Pedido (Order Items)
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_title text not null,
  product_price decimal(10,2) not null,
  quantity int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS em Order Items
alter table public.order_items enable row level security;

-- Política: Usuários veem itens dos seus pedidos
create policy "Users can view own order items"
on public.order_items for select
using ( 
  exists ( select 1 from public.orders where id = order_items.order_id and user_id = auth.uid() )
);

-- Política: Insert permitido se o pedido pertencer ao usuário
create policy "Users can insert own order items"
on public.order_items for insert
with check (
  exists ( select 1 from public.orders where id = order_items.order_id and user_id = auth.uid() )
);
