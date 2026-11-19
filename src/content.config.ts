import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// DA CONFERMARE: numero WhatsApp piscina (in divisioni.json punta al numero SPA)
const divisioni = defineCollection({
  loader: file('src/content/divisioni.json'),
  schema: z.object({
    id: z.enum(['spa', 'eventi', 'piscina', 'ristorante']),
    ordine: z.number(),
    tag: z.string(),
    titolo: z.string(),
    titoloEm: z.string(),
    testo: z.string(),
    prezzo: z.string(),
    href: z.string(),
    tel: z.string(),
    whatsapp: z.string(),
    waTesto: z.string(),
    prenota: z.object({
      tipo: z.enum(['whatsapp', 'ancora']),
      label: z.string(),
      target: z.string().optional(),
    }).refine(p => p.tipo !== 'ancora' || !!p.target, { message: "prenota.tipo 'ancora' richiede target", path: ['target'] }),
    foto: z.string(), // nome file in src/assets/cliente/ (non image(): le foto sono fuori da git)
    fotoAlt: z.string(),
  }),
});

export const collections = { divisioni };
