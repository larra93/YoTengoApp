# YoTengoApp

Marketplace comunitario de demanda inversa. Publica lo que necesitas, recibe ofertas de tus vecinos y coordina arriendo, préstamo o trueque por chat.

## Estado actual

Fase 0: bootstrap de Expo SDK 57, NativeWind, navegación por tabs y pantallas base con datos mock.

Fase 1: proyecto Supabase vinculado, migraciones, PostGIS, RLS, RPCs, Storage, Realtime, seed de categorías y tipos generados.

Fase 2: autenticación email/password con Supabase, sesión persistente, guards de rutas, onboarding obligatorio, perfil editable con avatar y estadísticas reales.

Fase 3 (pedidos): feed conectado a Supabase con categorías, filtros, ubicación/cercanía (`nearby_needs`) o fallback reciente, detalle real, publicación con foto, fechas y ubicación aproximada. Ofertas, chat y negociaciones siguen usando mocks hasta la Fase 4.

## Requisitos

- Node.js 20 o superior.
- npm.
- Expo Go, emulador Android o simulador iOS para probar la app.

## Instalación

```bash
npm install
Copy-Item .env.example .env
npm run start
```

Completa `.env` con el Project URL y la Publishable key del dashboard antes de iniciar la app.

## Scripts

| Script                  | Descripción                                   |
| ----------------------- | --------------------------------------------- |
| `npm run start`         | Inicia el servidor de Expo.                   |
| `npm run start:clear`   | Inicia Expo limpiando la caché.               |
| `npm run android`       | Abre la app en Android.                       |
| `npm run ios`           | Abre la app en iOS.                           |
| `npm run web`           | Abre la app en el navegador.                  |
| `npm run typecheck`     | Verifica TypeScript sin emitir archivos.      |
| `npm run lint`          | Ejecuta ESLint con la configuración de Expo.  |
| `npm run format`        | Formatea con Prettier.                        |
| `npm run db:push`       | Aplica migraciones y seed al proyecto remoto. |
| `npm run db:push:local` | Aplica migraciones y seed con Docker local.   |
| `npm run db:types`      | Genera tipos desde el proyecto vinculado.     |
| `npm run db:reset`      | Reinicia la base local de Supabase.           |

## Supabase

Para vincular el proyecto y aplicar el esquema:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npm run db:push
npm run db:types
```

Completa `.env` con el Project URL y la Publishable key del dashboard. No uses la Secret key ni `service_role` en la app.

## Autenticación

La app usa email/password con flujo PKCE. Configura en Supabase (Authentication → URL Configuration) las redirect URLs:

- `yotengoapp://auth/callback` para development build.
- `exp://127.0.0.1:8081/--/auth/callback` o la URL que muestre Expo Go.
- `http://localhost:8081/auth/callback` para web en desarrollo.

El onboarding se exige mientras el perfil no tenga barrio. El avatar se guarda en el bucket `avatars`; el perfil se crea automáticamente al registrarse.

## Estructura

```text
src/app/            Rutas de Expo Router (auth, onboarding, tabs)
src/components/     Componentes de UI, auth, perfil, pedidos, ofertas y chat
src/features/       Lógica de auth y estadísticas de perfil
src/lib/            Supabase, query client, formato y utilidades
src/mocks/          Datos de demostración de las pantallas pendientes
src/theme/          Tokens visuales
src/types/          Tipos de dominio y tipos generados de Supabase
src/validation/     Esquemas Zod de formularios
supabase/           Migraciones, config y seed
docs/               Plan de arquitectura y mockups
```

## Documentación

- `docs/plan-yotengoapp.html`: arquitectura, modelo de datos, fases y decisiones.
- `docs/mockups/index.html`: galería de pantallas de referencia.
- `AGENTS.md`: convenciones técnicas para futuras sesiones de desarrollo.
