import { CENTRALINO } from './contatti';
import divisioni from '../content/divisioni.json';

// JSON-LD con soli dati ✅ (BRAND_IDENTITY §1-2). Niente `address` finché resta il conflitto
// "Via Pratola Ponte 80" / "Via Pratola 80" (§0.6); niente orari, voti, prezzi, stelle.
// URL e @id solo con SITE_URL (produzione): senza, JSON.stringify li omette.
const tel = (id: string) => `+${divisioni.find(d => d.id === id)!.tel}`;
const idResort = (site?: URL) => site && `${site.origin}/#resort`;

export const resort = (site?: URL) => ({
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness', // non Hotel: classificazione da confermare (§0.3)
  '@id': idResort(site),
  name: 'Pietrabianca Resort',
  url: site?.origin,
  telephone: `+${CENTRALINO}`,
  amenityFeature: [{ '@type': 'LocationFeatureSpecification', name: 'Parcheggio gratuito', value: true }],
  sameAs: ['https://www.instagram.com/pietrabianca.resort/'],
});

export const spa = (site?: URL) => ({
  '@context': 'https://schema.org',
  '@type': 'DaySpa',
  name: 'Pietrabianca Space',
  url: site && new URL('/spa/', site).href,
  telephone: tel('spa'),
  parentOrganization: site && { '@id': idResort(site) },
  sameAs: ['https://www.instagram.com/pietrabianca_space/'],
});
