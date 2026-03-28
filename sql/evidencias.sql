-- ============================================================
-- PASO 1: Crear el bucket en Supabase Dashboard
-- Storage → New bucket → nombre: "evidencias" → Public: ON
-- ============================================================

-- PASO 2: Políticas de Storage (ejecutar en SQL Editor)

-- Lectura pública de archivos
create policy "Lectura pública de evidencias"
  on storage.objects for select
  using (bucket_id = 'evidencias');

-- Subida solo para usuarios autenticados
create policy "Subida autenticada de evidencias"
  on storage.objects for insert
  with check (bucket_id = 'evidencias' and auth.role() = 'authenticated');

-- Eliminación solo para usuarios autenticados
create policy "Eliminación autenticada de evidencias"
  on storage.objects for delete
  using (bucket_id = 'evidencias' and auth.role() = 'authenticated');

-- ============================================================
-- PASO 3: Tabla de metadatos de evidencias
-- ============================================================

create table if not exists evidencias (
  id              uuid primary key default gen_random_uuid(),
  evento_id       uuid not null references eventos(id) on delete cascade,
  url             text not null,
  nombre_archivo  text not null,   -- ruta en storage: {eventoId}/{timestamp}-{nombre}
  fecha_foto      date not null,
  descripcion     text,
  created_at      timestamptz default now()
);

-- Habilitar Row Level Security
alter table evidencias enable row level security;

create policy "Lectura autenticada" on evidencias
  for select using (auth.role() = 'authenticated');

create policy "Inserción autenticada" on evidencias
  for insert with check (auth.role() = 'authenticated');

create policy "Actualización autenticada" on evidencias
  for update using (auth.role() = 'authenticated');

create policy "Eliminación autenticada" on evidencias
  for delete using (auth.role() = 'authenticated');

-- Índice para consultas por evento, ordenadas por fecha
create index if not exists evidencias_evento_fecha_idx
  on evidencias(evento_id, fecha_foto desc);
