# Pietrabianca Resort — Tech Stack Report

> Documento di architettura pre-sviluppo · redatto il 19/11/2026 · **rev. 2** (dopo la revisione indipendente)
> Input: [`BRAND_IDENTITY.md`](./BRAND_IDENTITY.md). Versioni dei framework verificate sulla documentazione ufficiale tramite Context7 (Astro 6.x, Payload 3.8x). I costi sono **indicativi, aggiornati a novembre 2026**: verificarli al momento dell'offerta.

---

## 1. Contesto: perché la scelta conta qui

Il resort **oggi non ha un sito**. Il dominio storico `resortpietrabianca.it` è scaduto ed è stato **registrato da terzi il 16/09/2026** (WHOIS nic.it), che ora lo mettono in vendita. Instagram, Google, Fresha e le directory continuano a mandare traffico a un dominio che il cliente non controlla più. Il sito quindi non sostituisce un sito esistente: **recupera prenotazioni che oggi vanno perse**, e la SEO riparte da zero su un nuovo dominio.

La demo deve:
1. essere pronta **in pochi giorni** per presentarla al cliente prima di Natale;
2. essere **velocissima su smartphone**: il traffico arriva in prevalenza da Instagram e Google Maps (stima, non un dato misurato);
3. portare a una conversione (WhatsApp, chiamata, preventivo, buono regalo) in 2–3 tocchi;
4. essere **mantenibile a basso costo**, anche da un fornitore diverso in futuro.

> **La scelta del framework è la decisione meno importante del progetto.** Il cliente compra prenotazioni, non un punteggio Lighthouse. Contano di più dominio, Google Business, recensioni e chiarezza delle CTA.

---

## 2. Requisiti tecnici del business

### R1 · SEO locale (provincia di Napoli)
- La SEO locale si muove soprattutto con **Google Business Profile, recensioni, NAP coerente e directory di settore** (matrimonio.com, TheFork, Dayuse). Il sito ne è il punto di arrivo.
- Una pagina di atterraggio per ogni attività con scheda Google Business propria (SPA, ristorante, resort).
- HTML statico o renderizzato lato server, `sitemap.xml`, canonical, meta Open Graph (anteprime su WhatsApp e Instagram).
- JSON-LD essenziale nella v1 (`Hotel`/`LocalBusiness`, `DaySpa`, `Restaurant`). Il grafo completo con `Event` e `Offer` arriva in fase 2.
- Cluster di keyword da coprire con pagine vere: "spa pomigliano d'arco", "spa napoli coppia", "piscina day use napoli", "feste 18 anni napoli", "sala feste pomigliano", "pizzeria pomigliano", "cena spettacolo napoli".

### R2 · Media ad alta risoluzione ultraveloci
- Foto in **AVIF/WebP**, `srcset` responsive, lazy loading, dimensioni esplicite (CLS = 0).
- **Hero video** di 6–10 s, muto, `autoplay muted loop playsinline`, MP4 + WebM, poster come elemento LCP, peso inferiore a 2–3 MB. Niente iframe YouTube nella hero.
- Target Core Web Vitals (mobile, 75° percentile): **LCP < 2,5 s · INP < 200 ms · CLS < 0,1**.

### R3 · Conversione immediata
- Barra CTA fissa su mobile: **WhatsApp · Chiama · Prenota**, con numero diverso per divisione.
- Deep link `wa.me` con testo precompilato: zero backend.
- **Form preventivo eventi** con informativa privacy, consenso e anti-spam.
- **Buoni regalo SPA per Natale** con Stripe Payment Links (nessun e-commerce da costruire).
- Booking engine hotel: **integrazione** con il motore del cliente, non sviluppo.

### R4 · Aggiornabilità
- Promo ed eventi cambiano ogni settimana, ma **li produce già l'agenzia social**. Lo staff interno difficilmente aggiornerà il sito da solo.
- Soluzione semplice: **aggiornamenti inclusi nel canone**. Il fornitore modifica un file Markdown in 5 minuti. Un CMS si aggiunge solo se il cliente lo chiede esplicitamente.

### R5 · Evoluzione
- Versione inglese, pagine per singolo evento e tecnologia SPA, integrazione booking/channel manager, eventuale CMS.

---

## 3. Le opzioni a confronto

### Option A — **Astro 6 + Tailwind CSS 4** (statico, contenuti nel repository)
- **Come funziona**: sito generato staticamente. Zero JavaScript di default, JS solo nelle "isole" interattive. Le immagini sono ottimizzate in build con `astro:assets` (`<Picture formats={['avif','webp']}>`). I contenuti stanno nelle **Content Collections** (Markdown/JSON validati da schema Zod).
- **Pro**: prestazioni e SEO massime senza sforzo, hosting gratuito o quasi, prototipo velocissimo. Le Content Collections hanno già la forma dei modelli di un CMS: se servirà, lo si collega con un loader **senza riscrivere le pagine**. Adapter SSR (Netlify/Cloudflare) disponibili per eventuali endpoint.
- **Contro**: senza CMS lo staff non aggiorna da solo (accettabile se gli aggiornamenti sono nel canone). Astro è **meno diffuso di WordPress tra le web agency locali**: va mitigato (vedi §6).

### Option B — **Next.js 16 (App Router) + Tailwind CSS 4 + Motion (ex Framer Motion)**
- **Pro**: massima flessibilità applicativa ed ecosistema enorme. È la scelta giusta per un booking proprietario, un'area clienti o un e-commerce complesso.
- **Contro**: più JavaScript a parità di pagina, INP a rischio con Motion su smartphone di fascia media. Su Vercel **il piano Hobby non è consentito per uso commerciale**. Più complessità e manutenzione per un sito che è al 90% vetrina.

### Option C — **Headless CMS** (lo staff aggiorna in autonomia)

| Variante | Stack | Note |
|---|---|---|
| **C1** | Astro 6 + **Sanity** (SaaS) | CMS ospitato, Studio personalizzabile, piano gratuito generoso, CDN immagini. La scelta più matura per uno staff non tecnico. |
| **C2** | Next.js 16 + **Payload 3** (self-hosted) | Payload vive dentro l'app Next.js, con admin, Local API, Live Preview e adapter Postgres/SQLite. Gratuito ma richiede **server Node, database e storage**. Ha senso solo con e-commerce o booking su misura. |
| **C3** | Astro 6 + **Keystatic** (CMS git-based) | L'admin modifica i file del repository e ogni salvataggio ricostruisce il sito. Costo zero, nessun database. **Decap è escluso**: su Netlify dipende da Git Gateway, deprecato. |

- **Pro**: autonomia dello staff, anteprima, contenuti riusabili.
- **Contro**: setup, una dipendenza in più, formazione. **Rallenta la demo** se fatto subito, e serve solo se qualcuno dal lato del cliente aggiornerà davvero.

### Baseline (non raccomandata): WordPress + page builder
Prestazioni mediocri con page builder e plugin, aggiornamenti di sicurezza continui. Ha però un vantaggio reale: **quasi ogni agenzia locale sa mantenerlo**. Va citata al cliente come termine di paragone, insieme a come Astro mitiga lo stesso rischio (§6).

---

## 4. Valutazione comparativa

Scala 1–5 (5 = migliore per **questo** progetto). I pesi bilanciano l'obiettivo della demo (velocità, impatto) con quello del cliente (costi, continuità).

| Criterio | Peso | A · Astro + Tailwind | B · Next.js + Motion | C1 · Astro + Sanity | C2 · Next + Payload | C3 · Astro + Keystatic |
|---|---|---|---|---|---|---|
| Performance / Core Web Vitals | 20% | **5** | 3 | **5** | 3 | **5** |
| SEO tecnica | 15% | **5** | 4 | **5** | 4 | **5** |
| Velocità del prototipo (demo) | 20% | **5** | 3 | 3 | 2 | 4 |
| Costi hosting e manutenzione | 15% | **5** | 3 | 4 | 2 | **5** |
| Autonomia di aggiornamento | 10% | 2 (via canone) | 1 | **5** | **5** | 4 |
| Manutenibilità da terzi / passaggio di consegne | 10% | 3 | **4** | 3 | 3 | 3 |
| Scalabilità (gift card, booking, EN) | 10% | 4 | **5** | 4 | **5** | 4 |
| **Totale ponderato** | | **4,40** | 3,25 | 4,15 | 3,20 | **4,40** |

> A e C3 sono a pari merito perché **C3 è A più un CMS**. La strategia (§5) parte da A e passa a C3 solo se il cliente vuole aggiornare in autonomia.

### Costi (indicativi)

| Voce | A / C3 | C1 | B | C2 |
|---|---|---|---|---|
| Hosting | Cloudflare Pages: **€0**, uso commerciale consentito. Netlify: piano gratuito a crediti, verificare limiti e termini | idem + Sanity Free €0 | Vercel Pro circa $20/mese (oppure Netlify) | Node + Postgres + storage: circa €10–30/mese |
| Manutenzione tecnica | Molto bassa | Bassa | Media | Medio-alta (aggiornamenti, backup DB) |
| Dominio `.it` nuovo | circa €10–20/anno, **intestato a Pietrabianca S.r.l.** | | | |
| Recupero `resortpietrabianca.it` | Prezzo ignoto (mercato secondario) o costi legali (riassegnazione): **a carico del cliente**, a sua decisione | | | |
| **Lavoro** (il costo reale per il cliente) | Vedi la struttura d'offerta in §7 | | | |

**Scalabilità.** Gift card con **Stripe Payment Links** (nessun backend; in fase 2 un webhook per il voucher automatico). Il booking engine si integra con widget o deep link. L'inglese è nativo in Astro (i18n routing).

---

## 5. Raccomandazione finale

### ✅ **Astro 6 + Tailwind CSS 4 + Content Collections**, con aggiornamenti inclusi nel canone

**Perché**
1. **Demo pronta in 2–3 giorni**, velocissima su qualsiasi smartphone.
2. **È un sito vetrina al 90%**: booking, pagamenti e prenotazioni passano da servizi esterni (Stripe, channel manager, TheFork, WhatsApp).
3. **Costi ricorrenti vicini a zero**: il cliente paga il lavoro e il canone, non l'infrastruttura.
4. **Nessun lock-in**: contenuti in Markdown leggibili da chiunque, repository nell'organizzazione del cliente.
5. **Un solo CMS, solo se serve**: se il cliente vuole aggiornare da sé, si aggiunge **Keystatic** (gratuito) o **Sanity** (se più persone, ruoli, anteprima). Non entrambi, non subito.

> Quando cambiare idea: booking engine proprietario, e-commerce con catalogo o area clienti → **Next.js + Payload**. Oggi nulla lo richiede.

### Stack della demo (minimo indispensabile)

| Livello | Scelta | Note |
|---|---|---|
| Framework | **Astro 6** | output statico |
| Stile | **Tailwind CSS 4** | token del design system (§4.3 Brand Identity) in `@theme` |
| Font | Bodoni Moda + Manrope, **self-hosted** (woff2) | nessuna richiesta a Google Fonts (performance e GDPR) |
| Immagini | `astro:assets` → `<Picture>` AVIF/WebP | `fetchpriority="high"` solo sull'immagine LCP |
| Video hero | `<video>` nativo, MP4 + WebM + poster | nessun player JS |
| Animazioni | Solo transizioni CSS | niente librerie, rispetto di `prefers-reduced-motion` |
| Contenuti | Content Collections (MD/JSON + Zod) | `promo`, `eventi`, `trattamenti`, `camere` |
| Form preventivo | Nella demo **non invia dati reali** (oppure invia solo al fornitore, con avviso) | in produzione: Netlify Forms o Formspree + honeypot + consenso |
| WhatsApp / chiamate | link `wa.me` / `tel:` | zero dipendenze |
| Buoni regalo | Pulsante verso uno Stripe Payment Link di esempio | in produzione: link reale dell'account Stripe **del cliente** |
| Mappa | Immagine statica con link a Google Maps | nessun embed prima del consenso |
| Hosting demo | URL **non indicizzato** (`noindex` + `robots.txt`) e protetto: Cloudflare Pages + Cloudflare Access (gratuito), oppure mostrata solo dal proprio dispositivo | foto e logo non sono del fornitore |

### Perimetro della demo

**Costruire** (2–3 giorni):
1. **Home**: hero (piscina o SPA), 4 card nell'ordine **SPA · Eventi · Piscina · Ristorante**, camere in fondo, **blocco Natale** (buoni regalo SPA + Capodanno/Dinner Show), voti con numero di recensioni e link alla fonte, mappa statica.
2. **/spa**: percorso SPA, massaggi, KRONOS / B-Tonic / Slim Swing (senza promesse di risultato), WhatsApp precompilato verso il 349.
3. **/eventi**: feste a tema, 18 anni, comunioni, Dinner Show, **form preventivo** (non invia dati reali).
4. **Barra CTA su mobile** con il numero della divisione.
5. **/piscina**: struttura con FAQ e regolamento, con segnaposto `[DA INSERIRE CON IL CLIENTE]`. È la risposta alle recensioni.

**Non costruire**: pagine per singola camera, menu completo, galleria, inglese, CMS, JSON-LD completo, GA4, booking engine, pagine business o aziendali, dati non confermati (4 stelle, 19.000 mq, 3 piscine, Sala Aurea, T-Shape 2, Infrabaldan).

---

## 6. Governance e conformità

| Area | Regola |
|---|---|
| **Proprietà degli account** | Dominio, hosting, GA4, Google Business, Stripe, repository GitHub: **tutto intestato a Pietrabianca S.r.l.**, con il fornitore come amministratore. La perdita del dominio dimostra che oggi nessuno se ne occupa: va scritto nel contratto. |
| **Passaggio di consegne** | Repository nell'organizzazione GitHub del cliente, README per un nuovo fornitore, contenuti in Markdown. È la mitigazione del rischio "Astro poco diffuso". |
| **GDPR** | Informativa e consenso nel form preventivi. Nessun cookie di tracciamento prima del consenso (Consent Mode v2). Mappa e video esterni caricati solo al clic. Font self-hosted. SPF e DKIM per le email di notifica. Dati del form senza passaggi da servizi non necessari. |
| **European Accessibility Act** | Dal 28/06/2025 si applica ai servizi di prenotazione e all'e-commerce rivolti ai consumatori. Sono esentate solo le microimprese (**meno di 10 addetti e meno di 2 M€**). Con un fatturato di circa 1,19 M€ conta il numero di addetti, probabilmente 10 o più tra hotel, SPA, ristorante ed eventi. Va quindi considerato **applicabile** appena si attivano booking o buoni regalo: WCAG 2.1 AA e **dichiarazione di accessibilità** (`/accessibilita`). |
| **Contenuti e claim** | Niente stelle, metrature o macchinari non confermati. Claim estetici senza promesse di risultato (D.Lgs. 206/2005). Voti delle recensioni con fonte e numero, senza copiare i testi delle recensioni Google. |
| **Operatività** | Backup del repository, monitoraggio uptime gratuito, rinnovo automatico del dominio. Tutto incluso nel canone. |
| **Google Business e recensioni** | Verifica di proprietà e aggiornamento del campo "sito" delle schede. Risposte alle recensioni. Correzione della categoria su Tripadvisor. |

---

## 7. Piano d'azione e offerta

### Prossimi 7 giorni (dal 19/11/2026)
1. **Gio–ven**: visura camerale (legale rappresentante, REA, capitale). Controllare il campo "sito" delle schede Google. Preparare un **mini-audit di 1 pagina: "6 problemi che vi costano clienti oggi"** (dominio in mano a terzi, link morti in bio, Google e Fresha, categoria B&B su Tripadvisor, indirizzo scritto in due modi, assenza da matrimonio.com e Dayuse, nessun form per gli eventi). **Non registrare domini a proprio nome.**
2. **Ven–lun**: demo (perimetro in §5).
3. **Lun**: video di 60–90 secondi della demo, da mandare via WhatsApp se l'incontro salta.
4. **Mar–mer**: primo contatto. Telefonata al 081 803 5327 chiedendo del titolare, oppure visita di persona (cena da Don Peppino o percorso SPA). Contatto tiepido alternativo: l'event planner Anna Esposito.
5. **Gio**: incontro, offerta di 1 pagina con 3 pacchetti, richiamare entro 48 ore.

### Pitch: i primi 60 secondi
1. Dal **loro** telefono: Google → "Pietrabianca resort" → "Sito web" → *"This domain is for sale"*. "Dal 16 settembre quel dominio è di un'altra persona. Chi vi cerca finisce lì."
2. Dal **proprio** telefono: la demo. Home → SPA → tap su WhatsApp con il messaggio già scritto. "Questo è un cliente che prenota in 3 tocchi."
3. "E prima di Natale possiamo vendere buoni regalo SPA."

Sull'agenzia social: "OTB continua a fare i social, il sito è il posto dove i loro contenuti diventano prenotazioni. Mi coordino con loro per foto e video."

### Struttura d'offerta (stime per il mercato campano 2026, da validare)

| Fase | Contenuto | Ordine di prezzo |
|---|---|---|
| **0. Messa in sicurezza** (gancio) | Nuovo dominio intestato al cliente, pagina temporanea, aggiornamento dei link in bio e di Google Business, richiesta di correzione su Tripadvisor | €0–200 |
| **1. Sito** | Sitemap v1 (10–12 pagine), CTA mobile, form eventi, SEO locale di base, 1–3 schede Google Business, privacy, cookie, accessibilità AA | €2.500–4.500 |
| **1b. Natale** (subito, opzionale) | Buoni regalo SPA con Stripe Payment Links + voucher PDF | €500–1.000 |
| **2. Crescita** | Inglese, integrazione booking, schede matrimonio.com e Dayuse, eventuale CMS | a preventivo |
| **Canone** | Hosting, dominio, backup, aggiornamento contenuti (promo ed eventi), report mensile | €60–120/mese base · €150–250/mese con contenuti e Google Business |

### Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| Il dominio storico resta a terzi | Nuovo dominio intestato al cliente da subito. Il riacquisto è una decisione del cliente. **Non contattare il venditore prima del cliente** |
| Registrare domini del cliente a nome del fornitore | **Mai**: sembra cybersquatting. Si registrano durante l'incontro, a nome di Pietrabianca S.r.l. |
| Foto e logo altrui nella demo | Demo privata (`noindex`, protetta o mostrata solo dal proprio dispositivo), con la nota "immagini dai vostri canali, solo a scopo dimostrativo". Nessuna pubblicazione |
| Diritti su foto e video per il sito definitivo | Chiarire chi li possiede (OTB? un fotografo?) e ottenere un'autorizzazione scritta |
| Claim non verificati | Esclusi finché il cliente non li conferma |
| L'agenzia social si propone per il sito | Coinvolgerla da partner, ma dopo aver parlato con il cliente |
| Lo staff non aggiorna | Aggiornamenti inclusi nel canone. CMS solo su richiesta |
