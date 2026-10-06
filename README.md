# Viaje Financiero

App de entrenamiento financiero gamificado (web + Android) hecha con Expo (React Native + Expo Router) y TypeScript.

## Cómo correrla

```bash
npm install
npm run web       # abre en http://localhost:8081
npm run android   # requiere Expo Go o un emulador
npm run typecheck
```

## Despliegue

- **Web (Vercel):** `vercel.json` exporta la app con `npx expo export --platform web` y sirve `dist/` como SPA.
- **APK de Android (EAS Build):** `npx eas-cli@latest build -p android --profile preview` genera un APK instalable.
  Para Google Play: `--profile production` (genera un AAB).

## Estructura

- `src/app/` — pantallas (un archivo por ruta)
  - `bienvenida` onboarding · pestañas `(main)/viaje` inicio · `(main)/mapa` · `(main)/mentor` · `(main)/perfil` pasaporte
  - `nivel/[id]` nivel bloqueado / activo / próximamente · `nivel/[id]/desbloquear` compra
  - `mision/*` misiones de los niveles 1–3 · `logro/[id]` misión completada
- `src/data/` — niveles, precios y contenido educativo
- `src/state/` — estado del viaje (persistido con AsyncStorage) y reglas de misiones y progreso
- `src/services/` — mentor y pagos **simulados**
- `src/components/`, `src/theme/` — sistema de diseño (tokens, íconos, mapa, sellos)

## Backend (Supabase)

Proyecto `viaje-financiero` (organización Ufodevs, us-east-1). Un solo proyecto para los dos perfiles:

- **Usuario (`member`)**: crea su cuenta en la app, su progreso se sincroniza en `journeys`, conversa con el mentor en `messages` (texto y audios en el bucket privado `audios`).
- **Mentor (`mentor`)**: entra en `/admin`, ve a todos los usuarios, responde en tiempo real y publica el Mapa Personal y las frases (`transformations`).

Toda tabla tiene RLS: cada usuario solo ve lo suyo; el mentor ve todo. El esquema vive en `supabase/migrations/`.

**Dar rol de mentor** a una cuenta ya creada:

```bash
supabase db query --linked "update public.profiles set role = 'mentor' where email = 'correo@ejemplo.com';"
```

## Pendiente para producción

- **Pagos:** `src/services/payments.ts` simula el cobro. Integrar Wompi o Mercado Pago en el backend y desbloquear el nivel solo cuando el webhook confirme el pago.
- **Desbloqueo de niveles:** hoy lo marca la app al "pagar" (simulado). Con pagos reales debe marcarlo el servidor tras el webhook, no el cliente.
- **Correos de confirmación:** desactivados porque el correo integrado de Supabase solo envía a tu equipo. Para activarlos, configura un SMTP propio.
- **WhatsApp:** reemplazar los enlaces de ejemplo en `src/data/levels.ts`.
- **Precios y niveles 4–6:** se ajustan en `src/data/levels.ts`.
