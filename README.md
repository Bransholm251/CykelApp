# Cykelfiks – MVP

Dansk mobilapp, der hjælper almindelige cyklister med selv at reparere cyklen: find problemet på en 3D-cykel
eller via søgning, følg en enkel trin-for-trin-guide, og få anbefalet det rigtige værktøj fra partnerbutikker.

Expo SDK 58 · React Native · TypeScript · Expo Router · @react-three/fiber · AsyncStorage

## Kom i gang

```bash
npm install
npx expo start
```

Scan QR-koden med **Expo Go** (iOS/Android). Alle native moduler (expo-gl, AsyncStorage, expo-web-browser …) er med i Expo Go,
så der kræves ingen development build.

Nyttige kommandoer:

```bash
npm run typecheck      # TypeScript
npx expo-doctor        # tjek afhængigheder
npx expo start --clear # ryd bundler-cache (fx efter ny .glb)
```

## Mappestruktur

```
src/
  app/                      Ruter (Expo Router)
    _layout.tsx             Rod-stack, skrifttyper, UserDataProvider
    (tabs)/_layout.tsx      Bundmenu: Hjem, Find problem, Søg, Profil
    (tabs)/index.tsx        Hjem
    (tabs)/find.tsx         Find problem (3D-cykel + forslagskort)
    (tabs)/search.tsx       Søg
    (tabs)/profile.tsx      Profil (gemte guides / mine ratings)
    guide/[id].tsx          Guide-detalje (stack-skærm)
  components/
    BikeViewer.tsx          3D-visning: drejning, markører, tryk på dele, highlight
    PartHotspot.tsx         Markør (44 px touch-mål) oven på 3D-visningen
    bike/PrimitiveBike.tsx  Midlertidig low-poly cykel af primitive former
    bike/GlbBike.tsx        Indlæser en rigtig .glb-model
    bike/index.ts           Vælg model (BIKE_MODEL)
    GuideCard.tsx, ToolCard.tsx, StarRating.tsx, TabBarIcon.tsx, MechanicCard.tsx, ui.tsx
  data/
    seed/*.json             Seed-data: dele, guides, værktøj, partnere
    repository.ts           Repository-lag (CatalogRepository + UserRepository)
    hooks.ts                React-hooks oven på repository'et
    UserDataProvider.tsx    Gæsteprofil, gemte guides og ratings (AsyncStorage)
  lib/                      Søgning (æ/ø/å + stavefejl), formatering, links
  config.ts                 Appnavn, firmanavn, kontakt- og partner-links
  theme/colors.ts           Farvetema "Kobber og grafit" – alle farver i appen kommer herfra
  theme/index.ts            Skrifttyper, radius, touch-mål (+ re-eksport af colors)
assets/models/              Her lægges bike.glb
```

## Udskift cykelmodellen (.glb)

1. Eksportér modellen som `assets/models/bike.glb` (glTF binary, low-poly, ingen skygger nødvendige).
2. **Navngiv objekterne**, så de matcher `meshName` i `src/data/seed/parts.json`:
   `tires`, `brakes`, `chain`, `gears`, `saddle`, `handlebar`, `lights`, `pedals`.
   En del kan være en gruppe/et tomt objekt med flere meshes indeni – alt under objektet regnes som delen
   (tryk, highlight).
3. Valgfrit: tilføj tomme objekter (empties) med navnet `<meshName>_anchor`, fx `tires_anchor`, der hvor markøren
   skal sidde. Uden anchor placeres markøren i midten af delens bounding box.
4. Slå modellen til i `src/components/bike/index.ts`:
   ```ts
   export const BIKE_MODEL: number | null = require('../../../assets/models/bike.glb');
   ```
5. Kør `npx expo start --clear`. `GlbBike` centrerer og skalerer automatisk modellen (cyklens længde langs x-aksen).

Hold modellen let (helst under ~1–2 MB og få tusinde trekanter) – den skal køre flydende på ældre telefoner.

## Udskift seed-data

Alt indhold ligger i `src/data/seed/`:

| Fil             | Indhold                                                                 |
|-----------------|-------------------------------------------------------------------------|
| `parts.json`    | Dele: `id`, `name`, `meshName` (navn i 3D-modellen), `guideIds` (rækkefølge på forslagskort) |
| `guides.json`   | Guides: problem, titel, sværhedsgrad (`Let`/`Mellem`/`Svær`), minutter, trin, `toolIds`, rating |
| `tools.json`    | Værktøj: navn, hvorfor, `imageUrl` (tom = ikon), `offers` pr. partner med pris og URL |
| `partners.json` | Partnerbutikker (fiktive pladsholdere i MVP'en)                         |

Typerne findes i `src/types.ts`. Priser og URL'er er pladsholdere.

## Skift til en backend (fx Supabase)

Al dataadgang går gennem interfaces i `src/data/repository.ts`. Lav en ny implementering af
`CatalogRepository` (indhold) og/eller `UserRepository` (gemte guides, ratings, profil), og sæt `catalog` /
`userRepo` nederst i filen til den nye implementering. Skærmene kalder kun hooks i `src/data/hooks.ts` og
`useUserData()`, så de skal ikke ændres. Repository-metoderne er allerede asynkrone.

## Designvalg og noter

- **3D-drejning:** I stedet for drei's `OrbitControls` bruger `BikeViewer` en egen, begrænset orbit-styring
  (vandret drej + let hældning, ingen zoom). Det giver fuld kontrol over gesten: vandrette træk drejer cyklen, mens
  lodrette træk går videre til siden, så 3D-visningen aldrig blokerer scroll. Canvas'et renderer kun ved ændringer
  (`frameloop="demand"`), og der er ingen skygger.
- **Markører** er almindelige React Native-knapper placeret ved at projicere delenes 3D-punkter til skærmen. De har
  `accessibilityLabel` og et 44 px touch-mål. Man kan også trykke direkte på 3D-delen (raycasting).
- **Skærmlæsere:** Når VoiceOver/TalkBack er slået til, vises en liste over cyklens dele under 3D-visningen som
  alternativ, og selve 3D-lærredet skjules for skærmlæseren.
- **Søgning** er case-insensitiv, forstår både "kæde", "kaede" og "kade" og tolererer små stavefejl i ord på 5+ bogstaver.
- **Pladsholdere i MVP'en:** video i guides, partnerlogoer, værktøjsbilleder, "Find butik tæt på mig",
  indstillinger. "Find cykelsmed" åbner en kortsøgning efter cykelsmede i in-app-browseren.
- Appnavn og firmanavn ("Cykelfiks") er pladsholdere og ændres i `src/config.ts` og `app.json`.
