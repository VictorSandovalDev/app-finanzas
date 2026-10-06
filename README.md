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

## Pendiente para producción

- **Mentor (Nivel 1):** `src/services/mentor.ts` funciona con reglas. Reemplazarlo por un backend que llame a un LLM (p. ej. Claude) y transcriba los audios. Nunca poner la API key en la app.
- **Pagos:** `src/services/payments.ts` simula el cobro. Integrar Wompi o Mercado Pago en el backend y desbloquear el nivel solo cuando el webhook confirme el pago.
- **Cuentas:** el progreso vive solo en el dispositivo. Falta agregar autenticación y sincronización.
- **WhatsApp:** reemplazar los enlaces de ejemplo en `src/data/levels.ts`.
- **Precios y niveles 4–6:** se ajustan en `src/data/levels.ts`.
