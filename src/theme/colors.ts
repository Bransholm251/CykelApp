/**
 * Farvetema: "Kobber og grafit".
 * Alle farver i appen skal komme herfra – brug aldrig hex-koder direkte i komponenter.
 * (Undtagelse: app.json kan ikke importere TS; adaptive icon-baggrunden dér er sat til `primary`.)
 */
export const colors = {
  background: '#F4F1EC', // app-baggrund (varm lys beige)
  surface: '#FFFFFF', // kort, søgefelt, bundmenu
  surfaceMuted: '#ECE7E0', // segmenteret kontrol, pladsholdere, partnerlogo-felter
  border: '#DDD7CE', // kanter på kort og felter

  text: '#2B2B2B', // primær tekst og overskrifter (grafit)
  textSecondary: '#5C5852', // sekundær tekst, ikoner i bundmenu
  textOnDark: '#FFFFFF',
  textOnDarkMuted: '#CFC8BE',

  primary: '#2B2B2B', // mørke flader: hero, "Find cykelsmed"-kort, "Køb"-knapper, aktive chips
  accent: '#A35A24', // kobber: primære knapper, valgt markør, stjerner, aktiv fane, links
  accentPressed: '#8A4A1C', // pressed-tilstand på accent-knapper
  accentTint: '#F3E6DA', // lys kobber til fremhævede flader og markørens glorie – aldrig tekst
  sage: '#8A9A8E', // dekorativ støttefarve (fx 3D-stellet) – aldrig tekst

  levelEasyBg: '#E6EFE8',
  levelEasyText: '#2F5D3A', // "Let"
  levelMediumBg: '#F6E5D6',
  levelMediumText: '#8A4512', // "Mellem"
  // "Svær" bruges ikke i seed-data endnu, men typen findes.
  levelHardBg: '#F6DEDB',
  levelHardText: '#8E2A20',

  // Afledte hjælpefarver (gennemsigtige lag, skygger, 3D)
  overlayOnDark: 'rgba(255,255,255,0.14)', // sekundær knap / ikonfelt på mørk flade
  overlayOnDarkBorder: 'rgba(255,255,255,0.35)',
  overlayLight: 'rgba(244,241,236,0.92)', // "Træk for at dreje"-mærkat over 3D (background, 92 %)
  shadow: '#000000',
  bikeRearLight: '#B3261E', // baglygtens røde glas på 3D-cyklen (illustration, ikke tekst)
} as const;

export type ColorName = keyof typeof colors;
