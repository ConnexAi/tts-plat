-- Tabla de eventos logísticos
-- Ejecutar en Supabase → SQL Editor

create table if not exists eventos (
  id             uuid primary key default gen_random_uuid(),
  nombre         text    not null,
  fecha          date    not null,
  lugar          text    not null,
  tipo_evento    text    not null
                         check (tipo_evento in ('corporativo', 'institucional', 'comunitario', 'masivo')),
  descripcion    text,
  aforo_estimado integer not null check (aforo_estimado > 0),
  estado         text    not null default 'activo'
                         check (estado in ('activo', 'cerrado')),
  created_at     timestamptz default now()
);

-- Habilitar Row Level Security
alter table eventos enable row level security;

-- Política: usuarios autenticados pueden leer todos los eventos
create policy "Lectura autenticada" on eventos
  for select using (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden insertar eventos
create policy "Inserción autenticada" on eventos
  for insert with check (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden actualizar eventos
create policy "Actualización autenticada" on eventos
  for update using (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden eliminar eventos
create policy "Eliminación autenticada" on eventos
  for delete using (auth.role() = 'authenticated');
