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
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Nunca commitear `.env`. Nunca usar la service role key en la app. Las claves públicas pueden estar en el bundle; la seguridad real depende de RLS.

## Estructura

```text
src/
  app/                 Rutas de Expo Router
    (tabs)/            Explorar, publicar, negociaciones, perfil
    need/[id].tsx      Detalle de un pedido
    offer/[needId].tsx Formulario de oferta
    chat/[needId].tsx  Chat del pedido
  components/
    ui/                Componentes base (Screen, Button, Card, Field...)
    needs/             Tarjetas y miniaturas de pedidos
    offers/            Tarjetas de ofertas
    chat/              Burbujas de mensajes
  lib/                 Utilidades, Supabase, query client, formato
  mocks/               Datos de demostración de la Fase 0
  theme/               Tokens de color y radios
  types/               Tipos de dominio (espejo del esquema)
  api/                 Consultas y mutaciones (Fase 2+)
  hooks/               Hooks compartidos (Fase 2+)
  validation/          Esquemas Zod (Fase 2+)
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
- Mantener `src/types/db.ts` alineado al esquema mientras no existan los tipos generados.
- RPCs previstas: `get_nearby_needs`, `get_my_negotiations`, `accept_offer`, `create_review`.
- Storage: buckets `need-images`, `offer-images`, `avatars`; rutas por `user_id`.

## Fases

- Fase 0: bootstrap, NativeWind, navegación, pantallas base con mocks.
- Fase 1: proyecto Supabase, migraciones, RLS, seed, tipos generados.
- Fase 2: autenticación email/password, sesión persistente, onboarding y perfil.
- Fase 3: capa de datos con TanStack Query y RPC de cercanía.
- Fase 4: publicación de pedidos con fotos y geolocalización.
- Fase 5: ofertas, match, chat y notificaciones.
- Fase 6: reseñas, reputación y pulido.

La Fase 0 funciona sin `.env`; no importar `src/lib/supabase.ts` hasta que existan credenciales.
