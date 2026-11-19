import { useEffect, useState } from 'react';
import { catalog } from './repository';

/** Lille hjælper til asynkrone repository-kald. */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | undefined; loading: boolean } {
  const [state, setState] = useState<{ data: T | undefined; loading: boolean }>({ data: undefined, loading: true });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fn().then((data) => alive && setState({ data, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export const useParts = () => useQuery(() => catalog.getParts(), []);
export const useGuides = () => useQuery(() => catalog.getGuides(), []);
export const useGuide = (id: string) => useQuery(() => catalog.getGuide(id), [id]);
export const useGuidesForPart = (partId: string) => useQuery(() => catalog.getGuidesForPart(partId), [partId]);
export const usePopularGuides = () => useQuery(() => catalog.getPopularGuides(), []);
export const usePartners = () => useQuery(() => catalog.getPartners(), []);
export const useTools = (ids: string[]) => useQuery(() => catalog.getTools(ids), [ids.join(',')]);
