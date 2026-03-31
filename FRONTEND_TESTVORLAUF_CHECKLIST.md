# Frontend Testvorlauf (Release Candidate)

## 0) Setup

- [x] Backend starten: `cd server && source .venv/bin/activate && python main.py`
- [x] Frontend starten: `cd frontend && npm start`
- [x] Optional: frischer Browser-Tab im Inkognito-Modus, um Alt-Caches zu vermeiden

## 1) Schnellchecks (Build/Quality)

- [ ] `cd frontend && npm run quality` ist gruen
- [ ] `cd frontend && npm run test` ist gruen
- [ ] `cd frontend && npm run build` ist gruen

## 2) User Flow

- [ ] Login auf `/form` funktioniert
- [ ] Multi-Step User-Form komplett durchklicken
- [ ] Submit auf letzter Seite funktioniert (kein 4xx/5xx)
- [ ] Confirmation-Ansicht wird korrekt angezeigt
- [ ] Profil-Link oeffnet und laedt Daten korrekt

## 3) Artist Flow

- [ ] Login auf Artist-Flow funktioniert
- [ ] Artist-Form komplett durchklicken
- [ ] Submit funktioniert (kein 4xx/5xx)
- [ ] Confirmation/Profilzugriff funktioniert

## 4) Admin - Navigation & Stabilitaet

- [ ] Dashboard-Tabwechsel verursacht kein Flackern/keine Loops
- [ ] `Home` hat saubere Abstaende, Karten sind nicht gequetscht
- [ ] `Financials` hat saubere Card- und Tabellen-Abstaende
- [ ] `News Management` flackert nicht beim Laden/Bearbeiten
- [ ] `Profile Management` zeigt Profile (nicht Home-Inhalt), `Open` und `Send Link` funktionieren

## 5) Admin - Shift Assignments

- [ ] `Assignments`-Tab: 3-Spalten-Layout ist stabil und gut lesbar
- [ ] User-Selektion + Timeslot-Selektion funktionieren
- [ ] Assign/Unassign-Actions zeigen Erfolg/Fehler sauber an
- [ ] `Messages`-Tab: Formular + Preview + Historie stabil
- [ ] `Current Plan`-Tab: Summary + Kartenlayout korrekt (Desktop/Mobile)

## 6) Responsive Spot-Checks

- [ ] Mobile Breite (ca. 390px): User-Form, Home, Financials, Shift Assignments lesbar
- [ ] Tablet Breite (ca. 768px): Grids umbrechen sinnvoll
- [ ] Desktop Breite (>=1280px): keine ueberlappenden Cards/Tabellen

## 7) Abschluss

- [ ] Browser-Konsole ohne neue kritische Warnungen/Errors
- [ ] Netzwerktab ohne unerwartete 5xx bei Kernflows
- [ ] Ergebnis im PR/Task dokumentiert (Bestanden / offene Punkte)
