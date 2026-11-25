# Entwicklungsplan & Feature-Roadmap: Restaurant-Plattform

Dieses Dokument dient dem Entwicklerteam als fundierte Roadmap und technische Spezifikation für die nächsten Ausbaustufen. Der Plan ist in drei aufeinander aufbauende Phasen unterteilt. Jede Phase enthält User Stories, Architektur- und Datenmodell-Hinweise, Algorithmen zur Kapazitätsoptimierung sowie konkrete Abnahmekriterien (Definition of Done).

## Übersicht der Phasen

| Phase | Fokusbereich | Kernwert | Priorität |
|---|---|---|---|
| Phase 1 | Reservierungs- & Belegungsmanagement | Verlässliche Platzvergabe, No-Show-Reduktion, Tisch-Kombinatorik & Kapazitätskontrolle | Höchste (Start) |
| Phase 2 | Menü- & Speisekarten-Optimierung | Kundenspezifische Personalisierung, Nährwerte, Transparenz | Mittel |
| Phase 3 | Bestellung & Bezahlung (Self-Service) | Effizienzsteigerung im Service, digitale Checkout-Prozesse | Ausbau |

## Phase 1: Reservierungs- & Belegungsmanagement

### 1.1 Zielsetzung & Scope

Ziel dieser Phase ist es, den Tischreservierungs- und Platzierungsprozess vollständig zu digitalisieren. Gäste können Tische online reservieren, während das Personal über eine Raumplan- und Auslastungsübersicht verfügt. Ein intelligenter Allokations-Algorithmus sorgt dafür, dass die Sitzplatzkapazität optimal ausgenutzt wird (Vermeidung von „Empty Seats“).

### 1.2 Tisch-Modellierung & Kapazitätsoptimierung (Architektur-Entscheidung)

#### Das Grundproblem: Feste 4er-Tische vs. Realität

Startet man mit rein statischen 4-Personen-Tischen, entsteht ein massives Effizienzproblem:

- Ein Großteil der Restaurantbesucher kommt zu zweit (ca. 45–60 % aller Buchungen).
- Werden 2 Personen an einen statischen 4er-Tisch gesetzt, verliert das Restaurant 50 % seiner Sitzplatzkapazität in diesem Slot.
- Größere Gruppen (5, 6 oder 8 Personen) könnten gar nicht platziert werden, ohne Tische ad-hoc zusammenzuschieben.

#### Best-Practice-Lösungsansatz: Das modulare 2er-Raster (Table Clustering)

Die Gastronomie-Industrie nutzt primär ein Baukastenprinzip auf Basis von 2-Personen-Tischen (2-Tops):

1. **Atomare Einheit (2-Top):** Quadratische Tische (z. B. 70 × 70 cm oder 80 × 80 cm) für 2 Personen.
2. **Kombinierbarkeit:** Zwei benachbarte 2er-Tische bilden bei Bedarf einen 4er-Tisch. Drei Tische ergeben einen 6er-Tisch.
3. **Feste Großtische:** Spezifische Einheiten (z. B. runde Familientische für 6–8 Personen), die baulich nicht getrennt werden können.

#### Entwicklungsstufen für die Allokations-Engine

- **Stufe 1 (MVP-Start): Feste Tischgrößen mit `min_capacity` und `max_capacity`**
  - Ein 4er-Tisch hat z. B. `min_capacity: 3` und `max_capacity: 4`.
  - 2 Personen dürfen diesen Tisch zur Stoßzeit nur buchen, wenn keine 2er-Tische mehr existieren oder als „Last-Minute-Auffüllung“.
- **Stufe 2 (Produktionsstandard): Virtuelle Tischkombinationen (`TableCombination`)**
  - Das System prüft bei einer 6-Personen-Gruppe automatisch, ob Tisch 3 + Tisch 4 + Tisch 5 im selben Zeitfenster zusammenhängend frei sind.

#### TODO: Tischkonfiguration zur Laufzeit aktualisieren

- Änderungen an der Tischkonfigurationsdatei ohne Serverneustart übernehmen.
- Ungültige oder nicht lesbare Konfigurationen ausdrücklich melden und für jede Verfügbarkeitsprüfung bzw. Buchung einen konsistenten Konfigurationsstand verwenden.
- Auswirkungen von Änderungen auf bestehende und zukünftige Reservierungen berücksichtigen.

### 1.3 Kern-Features

#### A. Interaktiver Raum- & Tischplan

- **Gästeansicht:** Auswahl von Präferenzen (z. B. Fensterplatz, ruhiger Bereich, Barrierefreiheit) oder automatische Zuteilung des besten Tisches.
- **Betreiber-Dashboard:** Drag-and-Drop-Editor zur Konfiguration des Gastraums (Tische, Bar, Außenbereich, Kombinierbarkeits-Regeln benachbarter Tische).

#### B. Reservierungs-Engine & Allokations-Algorithmus

- **Best-Fit-First-Zuweisung:** Buchungen werden so verteilt, dass der Kapazitätsverlust `Waste = Tischkapazität − Gästeanzahl` minimiert wird.
- **Time-Slot-Management:** Standard-Slots (z. B. 90 Min für Mittagessen, 120 Min für Abendessen) mit konfigurierbarem Reinigungspuffer (z. B. 15 Min).
- **No-Show-Prävention:** Automatisierte Bestätigungen via E-Mail und SMS mit Kalender-Einladung (.ics) sowie Stornolinks. Optional: Kreditkarten-Preauthorization für Freitag-/Samstagabend.

#### C. Kapazitäts-Heatmap & Live-Auslastung

- Aggregierte Visualisierung der Auslastung über den Tagesverlauf.
- Öffentliche oder interne Statusanzeige (z. B. für Kantinen/Großgastronomie: „Aktuelle Auslastung: 65 % – geringe Wartezeit“).

### 1.4 Technische Anforderungen & Datenmodell

#### Entitäten & Schemavorschlag

```sql
-- Einzelner physikalischer Tisch
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number VARCHAR(20) NOT NULL UNIQUE,
    capacity_min INT NOT NULL DEFAULT 1,
    capacity_max INT NOT NULL DEFAULT 2,
    zone_id UUID REFERENCES zones(id),
    is_active BOOLEAN DEFAULT TRUE,
    position_x FLOAT,
    position_y FLOAT
);

-- Regeln, welche Tische physikalisch zusammengeschoben werden können
CREATE TABLE table_combinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50), -- z.B. "Tisch 12 + 13 (4 Pers)"
    combined_capacity_max INT NOT NULL
);

CREATE TABLE table_combination_items (
    combination_id UUID REFERENCES table_combinations(id),
    table_id UUID REFERENCES tables(id),
    PRIMARY KEY (combination_id, table_id)
);

-- Reservierung
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(50),
    guest_count INT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, SEATED, CANCELLED, NO_SHOW
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Zuordnung: Eine Reservierung kann einen Tisch ODER eine Tischkombination belegen
CREATE TABLE reservation_tables (
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id),
    PRIMARY KEY (reservation_id, table_id)
);
```

#### API-Endpunkte

- `GET /api/v1/zones/layout` – Liefert den Raumplan inklusive Tischkoordinaten und Kombinationsmöglichkeiten.
- `POST /api/v1/reservations/availability` – Ermittelt freie Slots. Berücksichtigt:
  - Einzeltische mit passender Kapazität (`capacity_min ≤ N ≤ capacity_max`).
  - Kombinierbare Tischcluster bei größeren Gruppen.
- `POST /api/v1/reservations` – Erstellt eine Buchung unter Verwendung von DB-Transaktionssperren (`SELECT ... FOR UPDATE`), um Race-Conditions/Doppelbuchungen auszuschließen.
- `PATCH /api/v1/reservations/{id}/status` – Status-Update für Servicekräfte (Check-in, Checkout, No-Show).

### 1.5 Definition of Done (DoD)

- Gäste können in unter 60 Sekunden einen freien Tisch buchen.
- Gruppen von 2 Personen blockieren zur Stoßzeit keine unteilbaren 4er- oder 6er-Tische, solange 2er-Kapazitäten verfügbar sind.
- Überbuchungen werden serverseitig über Transaktions-Locks sicher verhindert.
- Das Service-Team kann Reservierungen im Dashboard einsehen, Tischen zuweisen und den Belegungsstatus live anpassen.

## Phase 2: Menü- & Speisekarten-Optimierung

### 2.1 Zielsetzung & Scope

Verbesserung der Speisekartenansicht durch strukturierte Produktdaten, Filter nach individuellen Ernährungsbedürfnissen sowie transparente Informationen zu Nährwerten und Allergenen.

### 2.2 Kern-Features

- **Dynamischer Allergen- & Diätfilter:** Filterung nach Vegan, Vegetarisch, Halal etc. und Ausschluss der EU-14-Hauptallergene.
- **Nährwert- & Nachhaltigkeitsanzeige:** Kalorien, Makros und optionaler CO₂-Wert.
- **Dynamisches CMS:** Ausverkauf-Status („Sold Out“) und tageszeitabhängige Angebote (Lunch/Happy Hour).

### 2.3 Definition of Done (DoD)

- Speisekarte filtert unter 500 ms serverseitig oder clientseitig nach Allergen-Kombinationen.
- Gesetzlich vorgeschriebene Allergenkennzeichnungen werden barrierefrei dargestellt.

## Phase 3: Bestellung & Bezahlung (Self-Service)

### 3.1 Zielsetzung & Scope

Reduktion von Wartezeiten und Entlastung des Personals durch digitale Bestell- und Bezahlprozesse direkt am Tisch („Bring Your Own Device“) oder vorab zur Abholung („Click & Collect“).

### 3.2 Kern-Features

- **QR-Code-Ordering:** Tischspezifischer QR-Code öffnet die Web-App ohne Installationszwang. Synchronisierter Tisch-Warenkorb (Shared Basket).
- **Digital Split Payment:** Gäste teilen den Betrag nach verzehrten Speisen oder zu gleichen Teilen auf und zahlen via Apple Pay, Google Pay oder PayPal.
- **Kitchen Display Integration (KDS):** Bestellungen laufen direkt nach Gängen priorisiert am Küchen-Screen oder Bon-Drucker ein.

### 3.3 Definition of Done (DoD)

- Gesamter Bestellvorgang am Tisch in unter 3 Minuten ohne Login möglich.
- Rechnungsaufteilung (Split-Bill) schließt mathematisch immer auf 0 Cent Differenz ab.

## Empfohlener Tech-Stack & Architekturprinzipien

- **Frontend:** React / Next.js oder Vue / Nuxt mit mobile-optimiertem Layout für Gäste und Desktop-Ansicht für Servicekräfte.
- **Backend:** Node.js (TypeScript), Go oder Python (FastAPI/Django) mit PostgreSQL für relationale Integrität und Constraints.
- **Echtzeit-Synchronisation:** WebSockets oder SSE (Server-Sent Events) für Tischstatus und Live-Küchenansicht.
- **Transaktionssicherheit:** Row-Level Locks bei Reservierungsanfragen, um Doppelbelegungen im Millisekundenbereich zu verhindern.
