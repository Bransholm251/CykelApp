export type Level = 'Let' | 'Mellem' | 'Svær';

export interface Part {
  id: string;
  name: string;
  /** Navnet på det objekt/mesh i 3D-modellen, der repræsenterer delen. */
  meshName: string;
  guideIds: string[];
}

export interface Guide {
  id: string;
  partId: string;
  problem: string;
  title: string;
  level: Level;
  minutes: number;
  steps: string[];
  toolIds: string[];
  mediaUrl?: string;
  avgRating: number;
  ratingCount: number;
}

export interface ToolOffer {
  partnerId: string;
  price: number;
  url: string;
}

export interface Tool {
  id: string;
  name: string;
  why: string;
  imageUrl: string;
  offers: ToolOffer[];
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
}

export interface SavedGuide {
  guideId: string;
  savedAt: string;
}

export interface Rating {
  guideId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
}

export interface GuestProfile {
  id: string;
  name: string;
}
