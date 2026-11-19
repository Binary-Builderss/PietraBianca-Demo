import { test, expect } from 'vitest';
import { waLink, telLink, prenotaAction } from '../../src/lib/contatti';

test('waLink codifica accenti, € e spazi', () => {
  expect(waLink('393496897941', 'Ciao! Percorso SPA da €15 è ok?'))
    .toBe('https://wa.me/393496897941?text=Ciao!%20Percorso%20SPA%20da%20%E2%82%AC15%20%C3%A8%20ok%3F');
});
test('telLink', () => expect(telLink('390818035327')).toBe('tel:+390818035327'));
test('prenota eventi è un\'ancora', () => {
  expect(prenotaAction({ prenota: { tipo: 'ancora', label: 'Preventivo', target: '/eventi#preventivo' } } as any))
    .toEqual({ label: 'Preventivo', href: '/eventi#preventivo' });
});
