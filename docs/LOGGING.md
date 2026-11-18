# Logging

Ziel: Probleme von Teilnehmenden schnell finden und nachvollziehen, ohne personenbezogene Daten
zu speichern. Logs sind maschinenlesbar (eine JSON-Zeile pro Ereignis) und werden mit `lnav`
ausgewertet. Umsetzung mit [structlog](https://www.structlog.org/) auf Basis von Pythons `logging`.

## Regeln

### 1. Ereignisse mit Attributen statt Sätze

Das erste Argument ist ein **fester Ereignisname**, der Kontext steht in **Attributen**.
Keine f-Strings, keine `%`-Formatierung, keine zusammengesetzten Sätze.

```python
# richtig
logger.info("booking_created", booking_ref="R-123", ticket_id=2, duration_ms=84)
logger.warning("booking_rejected", reason="invalid_shift_count", amount_shifts=7)

# falsch: nicht filterbar, Inhalt landet unkontrolliert im Text
logger.info(f"Booking created for {first_name} {last_name} ({email})")
```

Ereignisnamen:
- `snake_case`, Englisch, Form `<objekt>_<ergebnis>`: `booking_created`, `mail_send_failed`,
  `shift_declined`, `auth_failed`, `rate_limit_exceeded`
- stabil: Ein Name wird nicht umbenannt, sonst brechen gespeicherte Abfragen
- ein Name pro Bedeutung, nicht `booking_created` an einer und `booking_saved` an anderer Stelle

### 2. Feste Attributnamen

Gleiche Information, gleicher Name – überall. Neue Attribute nur, wenn keines der Liste passt;
dann hier ergänzen.

| Attribut | Bedeutung | Beispiel |
|---|---|---|
| `request_id` | Kennung des Requests, wird automatisch gesetzt und den Nutzern als Fehlercode angezeigt | `a1b2c3d4` |
| `booking_ref` | Pseudonym einer Buchung: `R-<id>` regulär, `A-<id>` Artist | `R-123` |
| `email_ref` | kurzer HMAC einer E-Mail, nur wenn es (noch) keine Buchung gibt, z. B. bei Recovery | `e:9f2c41` |
| `role` | Rolle aus dem JWT | `admin` |
| `route`, `method`, `status`, `duration_ms` | Request-Daten, automatisch in `request_finished` | `bookings.submit_form` |
| `reason` | maschinenlesbarer Grund für eine Ablehnung | `duplicate_booking` |
| `error_type` | Klassenname einer Exception | `OperationalError` |
| `count` | Anzahl | `3` |
| `*_id` | technische IDs (`ticket_id`, `timeslot_id`, `assignment_id`) | `17` |

### 3. Level

| Level | Wofür | Beispiele |
|---|---|---|
| `debug` | nur Entwicklung, in Produktion aus | Zwischenwerte |
| `info` | fachliche Ereignisse und Requests | `booking_created`, `request_finished` |
| `warning` | erwartbare Fehler durch Eingaben oder Clients | Validierung, falsches Passwort, Rate-Limit |
| `error` | unerwartete Fehler, mit Stacktrace (`logger.exception`) | DB-Fehler, Mailversand fehlgeschlagen |

Fehler von Clients (4xx) sind nie `error`.

### 4. Nur Werte mit begrenzter Größe

Logs dürfen nicht durch Eingaben von außen beliebig wachsen (Platte voll, Log-Injection,
Kosten bei späterer Auswertung). Erlaubt sind nur Werte, deren Größe der Code bestimmt:

- **erlaubt:** IDs, Pseudonyme, Enums/Ereignisnamen, Zahlen, Statuscodes, Dauer, Routennamen
- **nie:** Request- oder Response-Bodys, ganze Header, Formularfelder, Freitext von Nutzern
  (Namen, Notizen, Nachrichten, Sonderwünsche), hochgeladene Daten, Unterschriften
- **gekürzt:** Werte, die von außen kommen, aber nötig sind (z. B. `User-Agent` nur im
  Security-Log), werden auf 200 Zeichen begrenzt
- Exceptions: Stacktraces sind erlaubt; die Fehlermeldung wird gekürzt, weil sie Eingaben
  enthalten kann

### 5. Keine personenbezogenen Daten, keine Geheimnisse

- **nie im Klartext:** Namen, E-Mail, Telefon, Adresse, Profil-UUID (sie ist ein Zugangsschlüssel),
  Passwörter, Tokens, `Authorization`-Header, Cookies, Unterschriften, Zahlungsnotizen
- stattdessen: `booking_ref` bzw. `email_ref`. Admins sehen in der Buchungsansicht das
  Pseudonym und finden darüber alle Einträge
- **IP-Adressen** nur im Security-Log (Erkennung von Brute-Force und Missbrauch, 90 Tage),
  nicht im Anwendungs-Log

### 6. Fehler

```python
try:
    send_confirmation_mail(...)
except SMTPException:
    logger.exception("mail_send_failed", booking_ref=ref, mail_type="confirmation")
```

- in `except`-Blöcken `logger.exception(...)` verwenden (Level `error` mit Stacktrace, Ruff `G201`),
  nicht `str(e)` in den Text kopieren
- jede Exception nur einmal loggen: dort, wo sie behandelt wird

## Durchsetzung

- **Processor-Kette** (`src/utils/logger.py`): kürzt zu lange Werte, schwärzt Attribute mit
  sensiblen Namen (`password`, `token`, `secret`, `authorization`, `signature`, `cookie`,
  `email`, `phone`, `profile_uuid`) und begrenzt die Größe einer Zeile – als Sicherheitsnetz,
  nicht als Ersatz für die Regeln oben
- **Ruff `G004`** verbietet f-Strings in Log-Aufrufen. Bestehende Stellen stehen als Baseline in
  `server/pyproject.toml` (Liste darf nur schrumpfen, wird mit S7 abgebaut)
- **Tests** prüfen, dass Log-Ausgaben eines Buchungsablaufs keine E-Mail, keinen Namen und keine
  Profil-UUID enthalten (nach S7)

## Dateien und Aufbewahrung

| Datei | Inhalt | Aufbewahrung |
|---|---|---|
| `logs/app.log` | alle Ereignisse ab `info`, eine JSON-Zeile pro Ereignis | 30 Tage |
| `logs/security.log` | Security-Ereignisse (fehlgeschlagene Logins, Rate-Limits, Rollenverstöße) inkl. IP | 90 Tage |
| stdout (`docker logs`) | nur `warning` und höher, Größe durch Docker begrenzt | – |

Rotation täglich durch Python (`TimedRotatingFileHandler`). Kein zusätzliches logrotate, kein
eigenes Aufräumskript.

## Auswertung mit lnav

[lnav](https://lnav.org) zeigt die JSON-Zeilen lesbar an, filtert und erlaubt SQL direkt auf den
Dateien. Das Format liegt in `deployment/lnav/wiesenwahn_log.json`.

> Hinweis: Das Format ist nach der lnav-Dokumentation geschrieben, aber noch nicht mit einer
> echten lnav-Installation getestet. Beim ersten Einsatz prüfen und ggf. korrigieren.

```bash
sudo apt install lnav                                   # einmalig auf dem Server
lnav -i deployment/lnav/wiesenwahn_log.json             # Format installieren (einmalig)
lnav /opt/wiesenwahn/logs/                              # app.log + security.log, inkl. rotierter Dateien
```

Typische Abfragen (in lnav mit `;` beginnen):

```sql
-- alles zu einem Fehlercode, den eine Person gemeldet hat
SELECT log_time, log_level, logger, event, route, status FROM wiesenwahn_log
 WHERE request_id = 'a1b2c3d4';

-- alles zu einer Buchung
SELECT log_time, event, route, reason FROM wiesenwahn_log WHERE booking_ref = 'R-123';

-- Fehler der letzten 24 Stunden, gruppiert
SELECT event, error_type, count(*) AS n FROM wiesenwahn_log
 WHERE log_level = 'error' AND log_time > datetime('now', '-1 day')
 GROUP BY event, error_type ORDER BY n DESC;

-- langsamste Routen
SELECT route, count(*) AS n, round(avg(duration_ms), 1) AS avg_ms, max(duration_ms) AS max_ms
  FROM wiesenwahn_log WHERE event = 'request_finished'
 GROUP BY route ORDER BY avg_ms DESC LIMIT 10;

-- fehlgeschlagene Logins pro IP (security.log)
SELECT client_ip, role, count(*) AS n FROM wiesenwahn_log
 WHERE event = 'auth_failed' GROUP BY client_ip, role ORDER BY n DESC;
```

Ohne lnav, nur mit `jq`:

```bash
jq -c 'select(.request_id == "a1b2c3d4")' /opt/wiesenwahn/logs/app.log
jq -c 'select(.level == "error") | {ts, event, where, error_type}' /opt/wiesenwahn/logs/app.log
```
