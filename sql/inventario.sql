-- Tabla de inventario por evento
-- Ejecutar en Supabase → SQL Editor (requiere que la tabla 'eventos' ya exista)

create table if not exists inventario (
  id                  uuid primary key default gen_random_uuid(),
  evento_id           uuid not null references eventos(id) on delete cascade,
  nombre_item         text not null,
  cantidad_solicitada integer not null check (cantidad_solicitada > 0),
  cantidad_entregada  integer not null default 0 check (cantidad_entregada >= 0),
  estado              text not null default 'pendiente'
                      check (estado in ('pendiente', 'parcial', 'completo')),
  notas               text,
  created_at          timestamptz default now()
);

-- Habilitar Row Level Security
alter table inventario enable row level security;

-- Política: usuarios autenticados pueden leer todos los ítems
create policy "Lectura autenticada" on inventario
  for select using (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden insertar ítems
create policy "Inserción autenticada" on inventario
  for insert with check (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden actualizar ítems
create policy "Actualización autenticada" on inventario
  for update using (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden eliminar ítems
create policy "Eliminación autenticada" on inventario
  for delete using (auth.role() = 'authenticated');

-- Índice para agilizar consultas por evento
create index if not exists inventario_evento_id_idx on inventario(evento_id);
