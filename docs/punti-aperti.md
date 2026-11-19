# Demo Pietrabianca: cose rimaste aperte

## Da confermare col cliente (contenuti, non codice)
- SPA: elenco servizi del percorso, massaggio di coppia, Tranquility Ritual (fonti 🟡); formulazione di B-Tonic e Slim Swing; listino massaggi; promo €15 valida 27–29/11.
- Voto Google SPA 4,9 (🟡); voto e numero recensioni Tripadvisor.
- Piscina: "lettini al sole", "si mangia a bordo piscina", "dal mattino a sera" con chiusura 18:00; date di stagione 30/05 contro 15/06; politica bambini, borse frigo, costo ombrellone; numero WhatsApp della piscina (oggi usa quello SPA).
- Eventi: "show e ospiti" (la fonte dice "artisti"); "Cene aziendali" da verificare; testo informativa privacy.
- Camere: tipologie. Footer: P.IVA, REA, capitale sociale.

## Dopo la demo (codice)
- Spostare in `global.css` le classi condivise (`.btn*`, `.eyebrow`, `.pic`), una sola classe sezione per spa/eventi/piscina.
- Un helper unico per la collection `divisioni` e per le foto; tipo `Divisione` derivato dallo schema zod.
- Menu mobile: Esc e focus trap; `aria-current` nella nav; il "+/–" delle FAQ letto dagli screen reader.
- Pulizie minori in `intro.ts`/`water.ts` (revert morto nel catch, `loseContext` nel cleanup, listener resize).
- Prova manuale con VoiceOver su Mac (ScrollSmoother).
