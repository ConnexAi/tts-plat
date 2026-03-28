-- Migración: agregar fecha_fin a la tabla eventos
-- Ejecutar en Supabase → SQL Editor

alter table eventos
  add column if not exists fecha_fin date;

-- Restricción: fecha_fin debe ser posterior o igual a fecha
alter table eventos
  add constraint eventos_fecha_fin_check
  check (fecha_fin is null or fecha_fin >= fecha);
