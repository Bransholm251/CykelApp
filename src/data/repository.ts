/**
 * Repository-lag: al dataadgang går gennem disse interfaces.
 * MVP'en bruger lokal seed-data + AsyncStorage. For at skifte til en backend
 * (fx Supabase) skal man blot lave nye implementeringer af CatalogRepository
 * og UserRepository og eksportere dem nederst i filen.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GuestProfile, Guide, Part, Partner, Rating, SavedGuide, Tool } from '@/types';
import partsSeed from './seed/parts.json';
import guidesSeed from './seed/guides.json';
import toolsSeed from './seed/tools.json';
import partnersSeed from './seed/partners.json';

export interface CatalogRepository {
  getParts(): Promise<Part[]>;
  getGuides(): Promise<Guide[]>;
  getGuide(id: string): Promise<Guide | undefined>;
  getGuidesForPart(partId: string): Promise<Guide[]>;
  getPopularGuides(limit?: number): Promise<Guide[]>;
  getTools(ids: string[]): Promise<Tool[]>;
  getPartners(): Promise<Partner[]>;
}

export interface UserRepository {
  getProfile(): Promise<GuestProfile>;
  getSavedGuides(): Promise<SavedGuide[]>;
  setSavedGuides(saved: SavedGuide[]): Promise<void>;
  getRatings(): Promise<Rating[]>;
  setRatings(ratings: Rating[]): Promise<void>;
}

// ---------- Lokal seed-implementering ----------

const parts = partsSeed as Part[];
const guides = guidesSeed as Guide[];
const tools = toolsSeed as Tool[];
const partners = partnersSeed as Partner[];

export const seedCatalogRepository: CatalogRepository = {
  async getParts() {
    return parts;
  },
  async getGuides() {
    return guides;
  },
  async getGuide(id) {
    return guides.find((g) => g.id === id);
  },
  async getGuidesForPart(partId) {
    const part = parts.find((p) => p.id === partId);
    if (!part) return [];
    return part.guideIds
      .map((id) => guides.find((g) => g.id === id))
      .filter((g): g is Guide => Boolean(g));
  },
  async getPopularGuides(limit = 6) {
    return [...guides].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, limit);
  },
  async getTools(ids) {
    return ids.map((id) => tools.find((t) => t.id === id)).filter((t): t is Tool => Boolean(t));
  },
  async getPartners() {
    return partners;
  },
};

// ---------- Lokal AsyncStorage-implementering ----------

const KEYS = {
  profile: 'cykelfiks:profile',
  saved: 'cykelfiks:savedGuides',
  ratings: 'cykelfiks:ratings',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const localUserRepository: UserRepository = {
  async getProfile() {
    const existing = await readJson<GuestProfile | null>(KEYS.profile, null);
    if (existing) return existing;
    const guest: GuestProfile = { id: `guest-${Date.now().toString(36)}`, name: 'Gæst' };
    await writeJson(KEYS.profile, guest);
    return guest;
  },
  getSavedGuides: () => readJson<SavedGuide[]>(KEYS.saved, []),
  setSavedGuides: (saved) => writeJson(KEYS.saved, saved),
  getRatings: () => readJson<Rating[]>(KEYS.ratings, []),
  setRatings: (ratings) => writeJson(KEYS.ratings, ratings),
};

// ---------- Aktive implementeringer (skift her) ----------

export const catalog: CatalogRepository = seedCatalogRepository;
export const userRepo: UserRepository = localUserRepository;
