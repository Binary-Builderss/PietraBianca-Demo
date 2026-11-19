export type DivisioneId = 'spa' | 'eventi' | 'piscina' | 'ristorante';

// Forma dei dati di una voce della collection `divisioni` (vedi src/content.config.ts).
// Scritta a mano per non importare `astro:content`, così Vitest la usa senza Astro.
export interface Divisione {
  id: DivisioneId;
  ordine: number;
  tag: string;
  titolo: string;
  titoloEm: string;
  testo: string;
  prezzo: string;
  href: string;
  tel: string;
  whatsapp: string;
  waTesto: string;
  prenota: { tipo: 'whatsapp' | 'ancora'; label: string; target?: string };
  foto: string;
  fotoAlt: string;
}

export const waLink = (numero: string, testo: string) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(testo)}`;

export const telLink = (numero: string) => `tel:+${numero}`;

export function prenotaAction(d: Divisione): { label: string; href: string } {
  const { tipo, label, target } = d.prenota;
  return { label, href: tipo === 'ancora' ? target! : waLink(d.whatsapp, d.waTesto) };
}

export const CENTRALINO = '390818035327'; // rete fissa, niente WhatsApp

export const NOME: Record<DivisioneId, string> = {
  spa: 'SPA', eventi: 'Eventi', piscina: 'Piscina', ristorante: 'Ristorante',
};
