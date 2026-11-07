# YoTengoApp

Marketplace comunitario de demanda inversa. Publica lo que necesitas, recibe ofertas de tus vecinos y coordina arriendo, préstamo o trueque por chat.

## Estado actual

Fase 0: bootstrap de Expo SDK 57, NativeWind, navegación por tabs y pantallas base con datos mock. La conexión real a Supabase comienza en la Fase 1.

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

Completa `.env` cuando tengas el proyecto de Supabase creado. La app arranca sin credenciales porque la Fase 0 usa mocks.

## Scripts

| Script                | Descripción                                  |
| --------------------- | -------------------------------------------- |
| `npm run start`       | Inicia el servidor de Expo.                  |
| `npm run start:clear` | Inicia Expo limpiando la caché.              |
| `npm run android`     | Abre la app en Android.                      |
| `npm run ios`         | Abre la app en iOS.                          |
| `npm run web`         | Abre la app en el navegador.                 |
| `npm run typecheck`   | Verifica TypeScript sin emitir archivos.     |
| `npm run lint`        | Ejecuta ESLint con la configuración de Expo. |
| `npm run format`      | Formatea con Prettier.                       |
| `npm run db:push`     | Aplica migraciones a Supabase.               |
| `npm run db:types`    | Genera tipos desde el proyecto vinculado.    |
| `npm run db:reset`    | Reinicia la base local de Supabase.          |

## Estructura

```text
src/app/            Rutas de Expo Router
src/components/     Componentes de UI, pedidos, ofertas y chat
src/lib/            Supabase, query client, formato y utilidades
src/mocks/          Datos de demostración de la Fase 0
src/theme/          Tokens visuales
src/types/          Tipos de dominio
docs/               Plan de arquitectura y mockups
```

## Documentación

- `docs/plan-yotengoapp.html`: arquitectura, modelo de datos, fases y decisiones.
- `docs/mockups/index.html`: galería de pantallas de referencia.
- `AGENTS.md`: convenciones técnicas para futuras sesiones de desarrollo.
