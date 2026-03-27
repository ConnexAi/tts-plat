# TTS-PLAT — Plataforma de Gestión Logística de Eventos

## Empresa
TTS GROUP S.A.S.
Cali, Colombia
Contacto: info@magikenter.com

## Descripción
Plataforma web para gestión integral de eventos logísticos
de la Secretaría de Salud Distrital de Cali.

## Stack
- React + Vite
- Tailwind CSS v4
- Supabase (auth, database, storage)
- React Router DOM
- Vercel (hosting)

## Estructura
- src/lib/supabase.js → cliente de Supabase
- src/pages/ → módulos principales
- src/components/ → componentes reutilizables
- src/hooks/ → lógica reutilizable

## Módulos
1. Login seguro con roles (admin / operador)
2. Gestión de eventos
3. Inventario por evento
4. Control de asistencia (estimada vs real)
5. Evidencias fotográficas por evento con fecha
6. Generación de informes PDF consolidados

## Reglas de diseño
- Moderno, limpio, blanco, minimalista
- Siempre responsive (móvil y escritorio)
- Logo de MAGIK Producciones en el header

## Reglas de código
- Usar siempre variables de entorno para credenciales
- Comentar el código en español
- Validar datos antes de guardar en Supabase
- Componentes pequeños y con una sola responsabilidad
- Nombres de variables y funciones descriptivos en español