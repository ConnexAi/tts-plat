-- Tabla de registros de asistencia por evento
-- Ejecutar en Supabase → SQL Editor (requiere que la tabla 'eventos' ya exista)

create table if not exists asistencia (
  id               uuid primary key default gen_random_uuid(),
  evento_id        uuid not null references eventos(id) on delete cascade,
  aforo_estimado   integer not null check (aforo_estimado > 0),
  asistencia_real  integer not null check (asistencia_real >= 0),
  observaciones    text,
  registrado_en    timestamptz default now()
);

-- Habilitar Row Level Security
alter table asistencia enable row level security;

-- Política: usuarios autenticados pueden leer todos los registros
create policy "Lectura autenticada" on asistencia
  for select using (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden insertar registros
create policy "Inserción autenticada" on asistencia
  for insert with check (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden actualizar registros
create policy "Actualización autenticada" on asistencia
  for update using (auth.role() = 'authenticated');

-- Política: usuarios autenticados pueden eliminar registros
create policy "Eliminación autenticada" on asistencia
  for delete using (auth.role() = 'authenticated');

-- Índice para consultas por evento
create index if not exists asistencia_evento_id_idx on asistencia(evento_id);
