export const formatPrice = (kr: number) => `${kr.toLocaleString('da-DK')} kr.`;
export const formatMinutes = (m: number) => `${m} min`;
export const formatRating = (n: number) => n.toFixed(1).replace('.', ',');

const MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'];
export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
