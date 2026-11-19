import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { GuestProfile, Guide, Rating, SavedGuide } from '@/types';
import { userRepo } from './repository';

interface UserData {
  ready: boolean;
  profile: GuestProfile | null;
  saved: SavedGuide[];
  ratings: Rating[];
  isSaved(guideId: string): boolean;
  toggleSaved(guideId: string): void;
  getRating(guideId: string): Rating | undefined;
  rate(guideId: string, score: Rating['score'], comment?: string): void;
}

const Ctx = createContext<UserData | null>(null);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [saved, setSaved] = useState<SavedGuide[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    Promise.all([userRepo.getProfile(), userRepo.getSavedGuides(), userRepo.getRatings()]).then(([p, s, r]) => {
      setProfile(p);
      setSaved(s);
      setRatings(r);
      setReady(true);
    });
  }, []);

  const toggleSaved = useCallback((guideId: string) => {
    setSaved((prev) => {
      const next = prev.some((s) => s.guideId === guideId)
        ? prev.filter((s) => s.guideId !== guideId)
        : [{ guideId, savedAt: new Date().toISOString() }, ...prev];
      userRepo.setSavedGuides(next);
      return next;
    });
  }, []);

  const rate = useCallback((guideId: string, score: Rating['score'], comment?: string) => {
    setRatings((prev) => {
      const rating: Rating = {
        guideId,
        score,
        comment: comment?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      const next = [rating, ...prev.filter((r) => r.guideId !== guideId)];
      userRepo.setRatings(next);
      return next;
    });
  }, []);

  const value = useMemo<UserData>(
    () => ({
      ready,
      profile,
      saved,
      ratings,
      isSaved: (id) => saved.some((s) => s.guideId === id),
      toggleSaved,
      getRating: (id) => ratings.find((r) => r.guideId === id),
      rate,
    }),
    [ready, profile, saved, ratings, toggleSaved, rate],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUserData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUserData skal bruges inden i UserDataProvider');
  return ctx;
}

/** Gennemsnit inkl. brugerens egen rating (som om den var sendt til serveren). */
export function displayRating(guide: Guide, own?: Rating) {
  if (!own) return { avg: guide.avgRating, count: guide.ratingCount };
  const count = guide.ratingCount + 1;
  return { avg: (guide.avgRating * guide.ratingCount + own.score) / count, count };
}
