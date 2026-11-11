# AGENTS.md

## Proyecto

YoTengoApp es un marketplace comunitario de demanda inversa: un vecino publica lo que necesita (arriendo, préstamo o trueque), otros vecinos envían ofertas, negocian por chat y se reseñan al cerrar el trato.

La app móvil vive en la raíz del repositorio. El plan de arquitectura y los mockups están en `docs/`.

## Stack

- Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6 en modo estricto.
- Expo Router con el directorio de rutas en `src/app` (no en `app/`).
- NativeWind 4 + Tailwind CSS 3. No actualizar a Tailwind 4.
- Supabase (Postgres + PostGIS + Auth + Storage + Realtime).
- TanStack Query 5 para estado del servidor.
- React Hook Form + Zod para formularios y validación.
- date-fns, expo-image-picker, expo-location, expo-file-system, AsyncStorage.

## Comandos

```bash
npm install
npm run start
npm run start:clear
npm run android
npm run ios
npm run web
npm run typecheck
npm run lint
npm run format
npm run format:check
npm run db:push
npm run db:types
npm run db:reset
```

Antes de cerrar un cambio ejecutar `npm run typecheck` y `npm run lint`. Para cambios de UI, probar al menos en web y Android/emulador.

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (recomendada)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (legacy, opcional)

Nunca commitear `.env`. Nunca usar la service role key en la app. Las claves públicas pueden estar en el bundle; la seguridad real depende de RLS.

## Autenticación

- Supabase Auth con email/password y flujo PKCE (`flowType: 'pkce'`, `detectSessionInUrl: false`).
- Sesión persistida en AsyncStorage; en SSR web se usa almacenamiento vacío para evitar `window is not defined`.
- Deep link en `src/app/auth/callback.tsx`: intercambiar `code` con `exchangeCodeForSession`.
- Redirect URLs permitidas en Supabase: `yotengoapp://auth/callback`, la URL de Expo Go y `http://localhost:8081/auth/callback`.
- El guard vive en `src/app/_layout.tsx`: sin sesión → `(auth)`; con perfil incompleto (sin barrio) → `onboarding`; con sesión completa → tabs.
- El perfil se autocrea con el trigger `handle_new_user`; si falta, `AuthProvider` lo crea.
- Formularios con React Hook Form + Zod en `src/validation/auth.ts`.
- Al agregar rutas, regenerar tipos de Expo Router con `npx expo export --platform web` o `expo start` antes de `npm run typecheck`.

## Estructura

```text
src/
  app/                 Rutas de Expo Router
    (auth)/            Iniciar sesión y registro
    auth/callback.tsx  Deep link PKCE
    onboarding.tsx     Completar perfil obligatorio
    edit-profile.tsx   Editar perfil
    (tabs)/            Explorar, publicar, negociaciones, perfil
    need/[id].tsx      Detalle de un pedido
    offer/[needId].tsx Formulario de oferta
    chat/[needId].tsx  Chat del pedido
    review/[needId].tsx Calificar un trato completado
    reviews.tsx        Reseñas recibidas y reputación
    my-needs.tsx       Mis pedidos con todos los estados
  components/
    ui/                Componentes base (Screen, Button, Card, Field...)
    auth/              Layout compartido de autenticación
    profile/           Selector de avatar
    needs/             Tarjetas y miniaturas de pedidos
    offers/            Tarjetas de ofertas
    chat/              Burbujas de mensajes
    reviews/           Estrellas y tarjetas de reseñas
  features/
    auth/              Sesión, perfil, API y errores de Supabase Auth
    profile/           Estadísticas del perfil
    needs/             Feed, detalle, publicación, ubicación, storage y estados
    offers/            Crear/listar ofertas, aceptar/rechazar y realtime
    chat/              Historial, envío de mensajes, acceso y realtime
    reviews/           Listar y crear reseñas con RPC `create_review`
  lib/                 Utilidades, Supabase, query client, formato
  theme/               Tokens de color y radios
  types/               Tipos de dominio (espejo del esquema)
  validation/          Esquemas Zod de formularios
```

## Convenciones

- Rutas nuevas solo dentro de `src/app`. Usar layouts de Expo Router; no crear un router manual.
- Componentes reutilizables en `src/components`. Mantener las pantallas delgadas.
- Usar el alias `@/` para imports desde `src`.
- TypeScript estricto. Evitar `any`; preferir tipos de `src/types` y tipos generados de Supabase.
- Estilos con className de NativeWind. Los colores salen de `tailwind.config.js`; si se agrega un color, actualizar también `src/theme/tokens.ts`.
- Usar `cn()` para combinar clases condicionales.
- No agregar comentarios salvo que aporten contexto no obvio.
- Formularios con React Hook Form + Zod. No validar solo con `useState` en código de producción.
- Estado del servidor con TanStack Query. No duplicar datos remotos en estado local.
- Supabase: toda tabla con RLS. Operaciones multi-tabla mediante RPC transaccional.
- Fechas en ISO 8601. Montos en CLP como enteros. Coordenadas con PostGIS (`geography(Point, 4326)`).
- Textos de UI en español de Chile, tono cercano y claro.

## Base de datos

- Las migraciones viven en `supabase/migrations`.
- Generar tipos con `npm run db:types` después de aplicar migraciones.
- No editar `src/types/database.types.ts` a mano.
- `src/types/db.ts` deriva de los tipos generados y solo convierte `location` a `string | null`.
- `npm run db:push` aplica migraciones y seed al proyecto remoto vinculado. `npm run db:push:local` requiere Docker.
- RPCs: `nearby_needs`, `set_my_location`, `create_need`, `accept_offer`, `reject_offer`, `cancel_need`, `complete_need`, `send_message`, `create_review`.
- Storage: buckets `need-images`, `offer-images`, `avatars`; rutas por `user_id`.
- Los advisors marcan las RPC `security definer` como advertencia. Son intencionales y validan `auth.uid()` y participación antes de mutar.

## Fases

- Fase 0: bootstrap, NativeWind, navegación, pantallas base con mocks.
- Fase 1: proyecto Supabase, migraciones, RLS, seed, tipos generados.
- Fase 2: autenticación email/password, sesión persistente, onboarding y perfil.
- Fase 3: feed y publicación de pedidos con TanStack Query, ubicación/RPC `nearby_needs`, filtros y foto.
- Fase 4: ofertas con foto/precio, match (`accept_offer`/`reject_offer`), negociaciones y chat realtime por `need_id`.
- Fase 5: reseñas (`create_review` + trigger de reputación), perfil y pedidos con datos reales, estados de trato (completar/cancelar) y badge dinámico de negociaciones.

La app requiere `.env` con credenciales de Supabase desde la Fase 2. No importar `service_role` ni claves secretas en ningún archivo del cliente.
