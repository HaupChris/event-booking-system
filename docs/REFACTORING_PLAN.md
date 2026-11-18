# Refactoring-Plan

Stand: 2026-11-18 · Ausgangspunkt: Tag `pre-refactoring-2026-11-18` (main @ `47fa876`)

Ziele: Code vereinfachen, Redundanzen beseitigen, schwache Architektur ersetzen, System absichern.

**Rücksprung**, falls etwas kaputtgeht:

```bash
git checkout pre-refactoring-2026-11-18          # Stand ansehen
git switch -c hotfix/<name> pre-refactoring-2026-11-18   # von dort aus weiterarbeiten
```

Reihenfolge: Phase 0 → Charakterisierungstests → Phase 1 + 3 parallel → Phase 4 → Phase 2.

---

## Phase 0 – Sicherheitslücken (sofort)

- [ ] **S1 – Client bestimmt Preis und Zahlstatus.**
  `/api/submitForm` übernimmt das Request-JSON 1:1 (`Booking(**booking_data)`), `total_price`,
  `is_paid`, `paid_amount`, `payment_*` landen ungeprüft in der DB.
  Orte: `server/src/api/bookings.py` (submit_form), `server/src/services/booking_service.py` (create_booking).
  Maßnahme: nur erlaubte Felder annehmen, Preis serverseitig berechnen (wie im Artist-Pfad,
  `server/src/api/artist_bookings.py` → `_calculate_artist_total_price`), Zahlungsfelder auf Defaults setzen.

- [ ] **S2 – HTML-Injection in Mails.**
  `first_name`, `last_name`, `supporter_buddy` u. a. werden unescaped in HTML-f-Strings eingesetzt.
  Ort: `server/src/services/mail_service.py` (Bestätigungs-, Artist- und Recovery-Mails).
  Maßnahme: sofort `html.escape()`, mittelfristig Jinja2 mit Autoescape (B5).

- [ ] **S3 – Rollenprüfung 30+ Mal kopiert, per Identity-String.**
  `identity != "admin"` in fast jedem Admin-Endpunkt (`admin_faq.py` 10×, `shift_assignments.py` 10×, …).
  `/submitForm` akzeptiert jedes gültige Token, auch Artist-Tokens.
  Maßnahme: zentraler Decorator `@role_required(...)` auf Basis des `role`-Claims bzw.
  `before_request` je Admin-Blueprint.

- [ ] **S4 – Rate-Limiting in Produktion praktisch aus.**
  `ENABLE_APP_RATE_LIMITING=false`; die Profil-Endpunkte (UUID = einziges Geheimnis) hängen nur am
  allgemeinen nginx-Limit (10 r/s). `get_client_ip()` vertraut dem ersten `X-Forwarded-For`-Eintrag (fälschbar).
  Orte: `server/src/utils/rate_limit.py`, `docker-compose.yml`, `deployment/nginx/wiesenwahn.conf`.
  Maßnahme: eigene nginx-Zonen für `/api/profile/` und schreibende Endpunkte; IP nur aus
  `request.remote_addr` nach `ProxyFix`.

- [ ] **S5 – Sensible Dateien im Git.**
  `data/bookings.db`, `frontend/build/`, `.github/artifacts/vulverability-report.csv` sind eingecheckt.
  Maßnahme: prüfen, ob echte Personendaten enthalten sind → ggf. mit `git filter-repo` aus der
  History entfernen; `.gitignore` ergänzen.

- [ ] **S6 – Keine CSP; JWT und Formularentwürfe (inkl. Unterschrift) in `localStorage`.**
  Orte: `deployment/nginx/wiesenwahn.conf`, `frontend/src/App.tsx`, `frontend/src/hooks/useFormManagement.tsx`.
  Maßnahme: `Content-Security-Policy` setzen, veralteten `X-XSS-Protection`-Header entfernen,
  Unterschrift nicht im Entwurf persistieren.

- [ ] **S7 – Personendaten in Logs.**
  E-Mail, Namen und volle UUIDs werden auf INFO geloggt (`bookings.py`, `profile.py`, …).
  Maßnahme: zentrale Maskierungs-Hilfe im Logger.

- [ ] **S8 – Buchung nicht atomar, Foreign Keys aus.**
  `create_user`, `create_booking`, `assign_materials`, `assign_professions` committen jeweils
  in eigener Verbindung → halbe Datensätze bei Fehlern. `PRAGMA foreign_keys` wird nirgends gesetzt.
  Maßnahme: eine Transaktion pro Buchung, Foreign Keys aktivieren.
  *Noch zu prüfen:* ob Ticket-Kontingente (`amount`) beim Buchen durchgesetzt werden.

### Voraussetzung: Charakterisierungstests

- [ ] Aktuell nur ~245 Zeilen Tests. Vor Phase 1: pytest mit Flask-Test-Client und temporärer DB
  für Buchung (user + artist), Auth, Admin-Zugriffsschutz, Profil-Endpunkte.

---

## Phase 1 – Backend-Fundament

- [ ] **B1 – Zentrale DB-Schicht.**
  Pfad-Logik (`IN_DOCKER` → `DB_FILE_PATH`) und `_connect_db()` existieren in 11 Services + 4 Migrationen.
  → `src/db.py` mit `get_connection()` als Context Manager (row_factory, `foreign_keys=ON`, WAL,
  Commit/Rollback), Pfad aus der Config.

- [ ] **B2 – Ein Migrationssystem statt fünf.**
  Heute: `server/data/schema.sql`, `server/data/migrations/*.sql`, `server/src/migrations/*.py`,
  `server/src/scripts/migrate_*.py` und ~30 `CREATE TABLE IF NOT EXISTS`/`ALTER TABLE` zur Laufzeit in 9 Services.
  → versionierter Runner (`PRAGMA user_version` + nummerierte SQL-Dateien) beim Start; kein DDL in Request-Pfaden.

- [ ] **B3 – Endpunkt-Boilerplate abbauen.**
  `server/src/api/auth.py` enthält dieselbe Funktion 3× (nur Rolle verschieden). Fast jeder
  Endpunkt wiederholt try/except, Zeitmessung und Logging, obwohl `main.py` das zentral kann.
  → eine Route `/api/auth/<role>`; per-Endpoint-Fehlerbehandlung entfernen (geschätzt −30–40 % in `src/api/`).

- [ ] **B4 – Eingabevalidierung über Schemas** (Pydantic o. ä.). Löst S1 strukturell.
  Dabei Abhängigkeiten aufräumen: `flask-praetorian` (ungenutzt), `py-ts-interfaces` (ersetzen),
  `pytest` in die dev-Abhängigkeiten.

- [ ] **B5 – Mails über Templates.**
  `mail_service.py` (794 Zeilen) baut HTML in f-Strings, User/Artist fast doppelt → Jinja2 mit gemeinsamem Layout.

- [ ] **B6 – Dateien über dem 300-Zeilen-Limit aufteilen:**
  `formcontent_service.py` (898), `rideshare_service.py` (894), `profile_service.py` (743),
  `booking_service.py` (691), `news_service.py` (690), `option_service.py` (665), `artist_service.py` (631).

---

## Phase 2 – Architektur: User und Artist zusammenführen

Fast alles existiert doppelt:

- Tabellen: `Bookings`/`ArtistBookings`, `TicketOptions`/`ArtistTicketOptions`, Beverage, Food, Materials, Professions
- Services: `booking_service.py` / `artist_service.py`
- API: `bookings.py` / `artist_bookings.py`
- Mails, Frontend-Formulare, Admin-Seiten

Ziel: ein `Booking`-Modell mit `audience` ('regular' | 'artist') und optionalen Artist-Feldern
(Bandmitglieder als eigene Tabelle); Optionen ebenfalls mit `audience`.
Erfordert Datenmigration mit Backup → erst nach Phase 0/1 und mit Testabdeckung, außerhalb der Buchungssaison.

- [ ] Zielschema entwerfen und Migrationsskript schreiben
- [ ] Services/API zusammenführen
- [ ] Frontend und Admin auf das gemeinsame Modell umstellen

---

## Phase 3 – Frontend

- [ ] **F1 – Eine API-Schicht.**
  `services/apiClient.ts` (mit Interceptor) wird nur von 2 Dateien genutzt; 18 Dateien nutzen
  `axios` direkt, in 15 Dateien wird der `Bearer`-Header 54× manuell gesetzt.
  `services/api.ts` enthält Endpunkte, die es im Backend nicht gibt (`POST /api/booking`, `payment_received`).
  → alles über `apiClient`, 401 zentral → Logout, tote Endpunkte entfernen.

- [ ] **F2 – Auth-State vereinfachen.**
  `auth`, `isAdmin`, `token` in zwei Contexts; `isAdmin` geht beim Reload verloren.
  → ein `AuthContext`, Rolle und Ablaufzeit aus dem JWT.

- [ ] **F3 – Theme über Tokens statt Komponenten-Kopien.**
  Circus/Default/Space-Paare ≈ 2.900 Zeilen (`TicketOption*`, `SelectionOptionWithImage*`,
  `timeSlot*`, `*PanelLayout`, `*Background`) → eine Komponente je Element, Look aus dem Branding-Pack
  (`frontend/src/branding/`).

- [ ] **F4 – Artist-Formulare auf Basis-Komponenten.**
  Beispiel: `ArtistFoodSelectionForm.tsx` (160 Zeilen) baut nach, was `FoodSelectionForm.tsx`
  (29 Zeilen) über `FoodSelectionFormBase` erledigt. Ebenso Beverage, Ticket, Personal Details.

- [ ] **F5 – Offline/PWA-Sync bewerten.**
  `syncService.ts`, `utils/indexedDB.ts`, `SyncQueueManager` > 800 Zeilen. Nutzen prüfen, sonst entfernen.

- [ ] **F6 – Signature-Pads konsolidieren** (`SignaturePad.tsx` und `customSignaturePad.tsx`).

---

## Phase 4 – Betrieb und CI

- [ ] **Test-Gate vor Deploy.** `.github/workflows/deploy.yml` deployt bei jedem Push auf `main` ohne Lint/Tests.
- [ ] **Rollback-fähige Images.** Zusätzlich zum `:latest` mit Commit-SHA taggen.
- [ ] **nginx entdoppeln.** `frontend/nginx/default.conf` dupliziert Rate-Limit-Zonen und Auth-Routen des
  Host-nginx → Rate-Limiting nur im Host-nginx, Container-nginx liefert nur statische Dateien.
- [ ] **Doku aufräumen.** Veraltete Plan-/Session-Dokumente entfernen, verbleibende Doku aktualisieren
  (CLAUDE.md/README erwähnen noch `requirements.txt` bzw. „space-themed UI“).
