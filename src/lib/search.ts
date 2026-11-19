import type { Guide, Part } from '@/types';

/** To "foldninger" af teksten, så både "kæde", "kaede" og "kade" kan matche. */
function fold(text: string): [string, string] {
  const base = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const full = base.replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa');
  const simple = base.replace(/æ/g, 'a').replace(/ø/g, 'o').replace(/å/g, 'a');
  return [full, simple];
}

const words = (s: string) => s.split(/[^a-z0-9]+/).filter(Boolean);

/** Optimal string alignment-afstand (Levenshtein + ombytning af to bogstaver). */
function osa(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

function tokenMatches(token: string, hayWords: string[], hay: string): boolean {
  if (hay.includes(token)) return true;
  const allowed = token.length >= 8 ? 2 : token.length >= 5 ? 1 : 0;
  if (!allowed) return false;
  return hayWords.some((w) => {
    if (w[0] !== token[0]) return false;
    // Sammenlign med ordets begyndelse (± 1 tegn), så delvise ord også kan have stavefejl.
    for (const len of [token.length - 1, token.length, token.length + 1]) {
      if (len > 0 && len <= w.length && osa(token, w.slice(0, len)) <= allowed) return true;
    }
    return false;
  });
}

export interface SearchableGuide {
  guide: Guide;
  part?: Part;
}

/** Filtrerer guides på del, problem og titel. Alle ord i søgningen skal matche. */
export function searchGuides(items: SearchableGuide[], query: string): SearchableGuide[] {
  const q = query.trim();
  if (!q) return items;
  const [qFull, qSimple] = fold(q);
  const tokenSets = [words(qFull), words(qSimple)];
  return items.filter(({ guide, part }) => {
    const raw = `${part?.name ?? ''} ${guide.problem} ${guide.title}`;
    const hays = fold(raw);
    return hays.some((hay, i) => {
      const hw = words(hay);
      return tokenSets[i].every((t) => tokenMatches(t, hw, hay));
    });
  });
}

export const sameTerm = (a: string, b: string) => fold(a.trim())[0] === fold(b.trim())[0];
