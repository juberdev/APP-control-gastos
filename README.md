# 💳 Mis Gastos — App de seguimiento de gastos (Perú)

App multiplataforma para dar seguimiento a tus gastos de **tarjetas de crédito**
y **Yape**, leyendo automáticamente los correos de notificación del banco.

## Stack

| Capa | Tecnología |
|------|-----------|
| App móvil | **Expo (React Native + TypeScript)** — Android + iOS |
| Backend | **Supabase** — Postgres + Auth + Row Level Security + Edge Functions |
| Ingesta tarjetas | **Gmail API** — parseo de correos de BCP / Interbank |
| Yape | Captura asistida (notificaciones en Android + manual) |

> **Nota:** Belvo (open banking) **no opera en Perú**, por eso la vía automática
> es el parseo de correos del banco, que funciona en iOS y Android.

## Estructura

```
apps/
├── mobile/                       App Expo (arquitectura por features)
│   ├── index.ts                  Entry → src/app/App
│   └── src/
│       ├── app/                  Raíz: App, navegación y providers
│       │   ├── App.tsx           NavigationContainer + providers
│       │   ├── navigation/       Root (Auth | Tabs) + TabNavigator
│       │   └── providers/        AuthProvider (sesión de Supabase)
│       ├── features/             Un módulo por dominio
│       │   ├── auth/             Pantalla de login/registro
│       │   ├── gmail/            Hook de conexión OAuth
│       │   └── expenses/         Gastos: api, hooks, screens, components
│       ├── shared/theme/         Paleta y colores
│       └── services/supabase/    Cliente de Supabase
└── supabase/
    ├── migrations/
    │   └── 0001_initial_schema.sql   Tablas + RLS + triggers
    └── functions/
        ├── _shared/              crypto, google, parsers, cors
        ├── gmail-connect/        Guarda el refresh_token (cifrado)
        └── gmail-sync/           Lee correos → inserta transacciones
```

## Cómo funciona la ingesta de correos

1. El usuario conecta su Gmail (OAuth, scope `gmail.readonly`).
2. `gmail-connect` intercambia el código por un `refresh_token` y lo guarda **cifrado**.
3. `gmail-sync` (bajo demanda o por cron) busca correos del banco, los parsea
   (`_shared/parsers.ts`) y guarda cada gasto, deduplicando por `messageId`.
4. La app muestra el total y la lista.

Un solo Gmail cubre **todas** las tarjetas y bancos; cada tarjeta se distingue
por los **últimos 4 dígitos** que vienen en el correo.

## Puesta en marcha

### 1. App móvil
```bash
cd mobile
cp .env.example .env        # completa URL y anon key de Supabase
npm run android             # o: npm run ios / npm run web
```

### 2. Backend (Supabase)
```bash
# Instala el CLI:  brew install supabase/tap/supabase
supabase login
supabase link --project-ref TU_REF
supabase db push                          # aplica migrations/
cp supabase/.env.example supabase/.env    # completa secretos
supabase secrets set --env-file supabase/.env
supabase functions deploy gmail-connect gmail-sync
```

## Pendientes / próximos pasos

- [ ] Afinar los regex de `parsers.ts` con correos REALES de BCP e Interbank.
- [ ] Flujo OAuth de Google en la app (expo-auth-session) → llamar `gmail-connect`.
- [ ] Captura de Yape en Android (módulo nativo NotificationListener).
- [ ] Categorización de gastos y filtros por periodo.
- [ ] Cron para `gmail-sync` automático.

## ⚠️ Costos / compliance para publicar

- **Supabase**: gratis en desarrollo; ~$25/mes (plan Pro) en producción (backups).
- **Gmail `gmail.readonly`** es *restricted scope*: para publicar a usuarios
  Google exige verificación + **evaluación de seguridad CASA** (costo anual).
- **Yape**: posicionar como "registro asistido", no integración oficial (ToS).
