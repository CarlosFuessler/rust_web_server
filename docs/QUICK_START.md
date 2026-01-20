# 🚀 Quick Start Guide

## Sofort loslegen in 3 Schritten

### 1. Server starten
```bash
cd /Users/carlos/Documents/MES/Informatik/Q-Phase/fraunhofer/rust_web_server
cargo run --release
```

### 2. Browser öffnen
```
http://localhost:8088
```

### 3. Interagieren!
- **Klicke** auf ein Hexagon (Modul)
- **Klicke** auf eine Linie (LED)
- **Stelle** Parameter ein
- **Klicke** "Anwenden"

---

## 🎯 Schnell-Demo (30 Sekunden)

### LED-Farbe ändern
1. Klick auf eine **Verbindungslinie** zwischen zwei Modulen
2. Im Control Panel: **Farbpicker** öffnen
3. Wähle eine **leuchtende Farbe** (z.B. Grün: #10B981)
4. Setze **Frequenz** auf 5 (Maximum)
5. Klick **"Anwenden"**
6. ✨ **Wow!** Die LED leuchtet!

### Modul konfigurieren
1. Klick auf ein **Hexagon**
2. Ändere **Leistung** auf +80W (Solar-Erzeugung)
3. Ändere **Ladung** auf 100%
4. Klick **"Anwenden"**
5. ✅ Modul ist konfiguriert!

---

## 🎨 Features auf einen Blick

| Feature | Was es macht | Wo zu finden |
|---------|--------------|--------------|
| **LED-Farben** | Steuere die Farbe der Verbindungen | Klick auf Linie → Farbpicker |
| **LED-Richtung** | Vorwärts/Rückwärts Flow | LED-Sektion → [→] [←] Buttons |
| **LED-Frequenz** | Pulsgeschwindigkeit 0-5 Hz | LED-Sektion → Slider |
| **Modul-Leistung** | Stromproduktion/-verbrauch | Hexagon → Power Slider |
| **Modul-Ladung** | Batteriestand | Hexagon → Charge Slider |
| **Haushalt-Verbrauch** | Stromverbrauch einstellen | Quadrat → Power Slider |
| **Status-Anzeige** | Verbindungsstatus sehen | Header → Grüne LED |
| **Mobile-Modus** | Auf Tablet/Phone nutzen | Automatisch responsive |

---

## 🖱️ Interaktions-Cheatsheet

### Maus-Aktionen
| Aktion | Effekt |
|--------|--------|
| **Hover über Hexagon** | Modul leuchtet auf (blauer Glow) |
| **Hover über Linie** | LED wird heller |
| **Klick Hexagon** | Control Panel öffnet Modul-Steuerung |
| **Klick Linie** | Control Panel öffnet LED-Steuerung |
| **Klick Quadrat** | Control Panel öffnet Haushalt-Steuerung |

### Keyboard-Shortcuts (optional)
| Taste | Funktion |
|-------|----------|
| **Tab** | Nächstes Element fokussieren |
| **Enter** | Button aktivieren |
| **Esc** | Auswahl aufheben (wenn implementiert) |

### Touch-Gesten (Mobile)
| Geste | Funktion |
|-------|----------|
| **Tap** | Element auswählen |
| **Swipe Up** | Control Panel öffnen (Tablet) |
| **Pinch Zoom** | Canvas vergrößern/verkleinern |

---

## 🎭 Messe-Demo Checkliste

### Vor dem Start
- [ ] Server läuft (`cargo run --release`)
- [ ] Browser offen auf `localhost:8088`
- [ ] Mindestens 3 Module sichtbar
- [ ] Arduino verbunden (grüne LED im Header)
- [ ] Bildschirm auf max. Helligkeit

### Demo-Flow
1. [ ] **Zeige Canvas**: "Hier sehen Sie unser Stromnetzwerk..."
2. [ ] **Hover-Effekt**: Fahre über Module → Glow zeigen
3. [ ] **LED-Demo**: Klick Linie → Farbe ändern → Anwenden
4. [ ] **Modul-Demo**: Klick Hexagon → Parameter ändern
5. [ ] **Wow-Moment**: Zeige fließende LED-Animationen

### Backup-Plan
- **Kein Arduino?** → Demo-Modus zeigt statische Daten
- **Keine Icons?** → Module funktionieren auch ohne Bilder
- **Verbindung lost?** → "Reconnect" Button zeigt Robustheit

---

## 📱 Device-Spezifische Tipps

### Desktop (Empfohlen für Messe)
- **Browser**: Chrome oder Edge (beste Performance)
- **Auflösung**: Mind. 1920x1080
- **Zoom**: 100% (keine Browser-Vergrößerung)
- **Maus**: Externe Maus (besser als Touchpad)

### Tablet (iPad Pro)
- **Orientierung**: Landscape (Querformat)
- **Toggle**: [☰] Button unten rechts für Controls
- **Touch**: Große Touch-Targets, einfach zu bedienen

### Smartphone
- **Nutzung**: Funktioniert, aber Desktop bevorzugt
- **Canvas**: Automatisch auf 85% skaliert
- **Controls**: Als Bottom-Sheet

---

## 🎨 Farb-Vorschläge für LEDs

### Energie-Typen
```
Solar:      #F59E0B (Orange/Gold)
Wind:       #06B6D4 (Cyan)
Batterie:   #10B981 (Grün)
Haushalt:   #EF4444 (Rot)
Netz:       #3B82F6 (Blau - Standard)
```

### Effekte
```
Langsam:    Frequenz 0-1 (Beruhigend)
Normal:     Frequenz 2-3 (Standard)
Schnell:    Frequenz 4-5 (Dynamisch, Wow-Effekt)
```

---

## ⚠️ Häufige Probleme

### Problem: "Verbindung unterbrochen" Banner
**Lösung**: Klick "Reconnect" oder prüfe Arduino-Verbindung

### Problem: Icons werden nicht angezeigt
**Lösung**: Normal! Module funktionieren auch ohne Icons

### Problem: LED-Farbe ändert sich nicht
**Check**: 
1. Hast du "Anwenden" geklickt?
2. Ist die richtige Linie ausgewählt?
3. Backend verbunden?

### Problem: Control Panel öffnet nicht
**Lösung**: 
- Desktop: Klick direkt auf Element
- Mobile: [☰] Button nutzen

### Problem: Performance-Issues
**Optimierung**:
- Browser-Tab alleine offen lassen
- Andere Anwendungen schließen
- Hardware-Beschleunigung aktivieren

---

## 🔧 Entwickler-Infos

### Build-Befehle
```bash
# Frontend neu kompilieren
cd src/frontend
npm run build

# Server neu starten
cargo run --release

# Tests ausführen
cargo test
```

### Ports
```
Backend:  http://localhost:8088
Frontend: Embedded in Backend
Serial:   Auto-detected (Arduino)
```

### Logs
```bash
# Server-Logs anzeigen
cargo run --release 2>&1 | tee server.log

# Frontend-Fehler
Browser DevTools → Console (F12)
```

---

## 📚 Weitere Dokumentation

- **Vollständiges Feature-Set**: [FRONTEND_UPDATE.md](FRONTEND_UPDATE.md)
- **Messe-Präsentation**: [MESSE_GUIDE.md](MESSE_GUIDE.md)
- **UI-Komponenten**: [UI_COMPONENTS.md](UI_COMPONENTS.md)
- **API-Referenz**: [API-Reference.md](API-Reference.md)

---

## 🎉 Du bist bereit!

Öffne den Browser, klicke auf eine LED-Linie, ändere die Farbe zu einem leuchtenden Grün (#10B981), stelle die Frequenz auf 5, klicke "Anwenden" und genieße den **Wow-Effekt**! ✨

**Viel Erfolg auf der Messe! 🚀**

---

**Letzte Aktualisierung**: 19. Januar 2026  
**Version**: 3.0 (Messe-Ready)
