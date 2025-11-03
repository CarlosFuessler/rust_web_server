1# I2C Controller für Arduino

## Projektübersicht

Dieses Arduino-Projekt ist ein I2C Master Controller, der mehrere I2C-Slave-Geräte (z.B. Hexagone) über serielle Befehle steuert und gleichzeitig einen NeoPixel LED-Strip verwaltet. Der Controller empfängt Befehle über die serielle Schnittstelle und leitet diese entsprechend an die I2C-Geräte weiter oder steuert die LEDs direkt.

## Projektstruktur

```
I2C_Controller/
├── I2C_Controller.ino      # Hauptdatei mit setup() und loop()
├── CommandParser.h/.cpp    # Serielle Kommando-Verarbeitung
├── LedHandler.h/.cpp       # LED-Strip Steuerung
└── structs.h              # Datenstrukturen
```

### Dateibeschreibung

#### `I2C_Controller.ino`
- **Hauptfunktionen**: setup() und loop()
- **I2C-Scan**: Automatisches Erkennen und Verwalten von I2C-Geräten
- **Device-Management**: Speicherung von bis zu 16 Geräten mit EEPROM-ID, I2C-Adresse und Typ
- **RAM-Überwachung**: Optionale Speicher-Überwachung für Debugging

#### `CommandParser.h/.cpp`
- **Serielle Kommunikation**: Empfang von Befehlen zwischen `<` und `>` Markierungen
- **Befehlsanalyse**: Parsing von Befehlen im Format `COMMAND(param1,param2,...)`
- **Befehlsausführung**: Weiterleitung an entsprechende Handler-Funktionen

#### `LedHandler.h/.cpp`
- **NeoPixel-Steuerung**: Management eines LED-Strips mit 155 LEDs
- **Segment-System**: Aufteilung in 31 Segmente à 5 LEDs (IDs 0-30)
- **Animationen**: Unterstützung für statische Farben und Pulse-Effekte
- **Multi-Segment**: Bis zu 30 gleichzeitige LED-Animationen

#### `structs.h`
- **DeviceData**: Struktur für I2C-Geräteinformationen (EEPROM, I2C-Adresse, Typ)
- **LEDSegment**: Struktur für LED-Segment-Informationen (Position, Farbe, Animation)

## Serielle Befehls-Syntax

Alle Befehle müssen zwischen `<` und `>` Markierungen stehen:
```
<COMMAND(parameter1,parameter2,...)>
```

### Verfügbare Befehle

#### 1. UPDATE - I2C-Gerät aktualisieren
```
<UPDATE(eeprom_id,power,charge,time[,active])>
```

**Parameter:**
- `eeprom_id`: EEPROM-ID des Zielgeräts (0-255)
- `power`: Leistung in Prozent (-100 bis 100)
- `charge`: Ladung in Prozent (0-100)
- `time`: Zeit (0-47)
- `active`: Optional, Aktivitätsstatus (0 oder 1, Standard: 1)

**Beispiele:**
```
<UPDATE(1,50,75,12)>        # Gerät 1: 50% Power, 75% Charge, Zeit 12
<UPDATE(2,-30,25,8,0)>      # Gerät 2: -30% Power, 25% Charge, Zeit 8, inaktiv
```

#### 2. SCAN - I2C-Geräte scannen
```
<SCAN()>
```

**Funktion:** Scannt den I2C-Bus nach verfügbaren Geräten und gibt eine Liste aller gefundenen Geräte aus.

**Beispiel:**
```
<SCAN()>
```

#### 3. STOP - Geräte stoppen
```
<STOP()>                    # Alle Geräte stoppen + LEDs ausschalten
<STOP(eeprom_id1,eeprom_id2,...)>  # Bestimmte Geräte stoppen
```

**Beispiele:**
```
<STOP()>                    # Stoppt alle Geräte und schaltet LEDs aus
<STOP(1,3,5)>              # Stoppt nur Geräte mit EEPROM-IDs 1, 3 und 5
```

#### 4. LED - LED-Strip steuern

##### LEDs ausschalten (negative LED-ID):
```
<LED(-led_id,forwards)>
```

##### LEDs einschalten - statisch:
```
<LED(led_id,forwards,r,g,b)>
```

##### LEDs einschalten - mit Pulse-Animation:
```
<LED(led_id,forwards,r,g,b,frequency)>
```

**Parameter:**
- `led_id`: LED-Segment ID (0-30, negativ zum Ausschalten)
- `forwards`: Richtung (0 = rückwärts, 1 = vorwärts)
- `r,g,b`: RGB-Farbwerte (0-255)
- `frequency`: Pulse-Frequenz in Hz (>0 für Animation, 0 für statisch)

**LED-Segment-System:**
- 31 Segmente (IDs 0-30)
- Jedes Segment = 5 aufeinanderfolgende LEDs
- Segment 0 = LEDs 0-4, Segment 1 = LEDs 5-9, usw.
- Gesamtanzahl: 155 LEDs (31 × 5)

**Beispiele:**
```
<LED(0,1,255,0,0)>          # Segment 0 statisch rot, vorwärts
<LED(1,0,0,255,0)>          # Segment 1 statisch grün, rückwärts
<LED(2,1,0,0,255,2)>        # Segment 2 blau mit 2Hz Pulse, vorwärts
<LED(-1,0)>                 # Segment 1 ausschalten
```

## Hardware-Konfiguration

### I2C-Verbindung
- **SDA**: Pin A4 (Arduino Uno)
- **SCL**: Pin A5 (Arduino Uno)
- **Master-Adresse**: Automatisch (Arduino als Master)
- **Slave-Adressen**: 1-126 (automatisch gescannt)

### LED-Strip
- **Pin**: Digital Pin 8
- **Typ**: NeoPixel (WS2812B)
- **Anzahl**: 155 LEDs
- **Helligkeit**: 42/255 (ca. 16%)
- **Protokoll**: GRB + 800kHz

### Serielle Kommunikation
- **Baudrate**: 9600
- **Format**: 8N1
- **Protokoll**: Befehle zwischen `<` und `>`

## Anwendungsbeispiele

### 1. Grundlegende Gerätekommunikation
```
<SCAN()>                    # Verfügbare Geräte finden
<UPDATE(1,100,50,15)>       # Gerät 1 auf volle Leistung setzen
<UPDATE(2,-50,75,20)>       # Gerät 2 rückwärts laufen lassen
<STOP(1,2)>                 # Beide Geräte stoppen
```

### 2. LED-Lichteffekte
```
<LED(0,1,255,0,0,1)>        # Rotes Pulsieren mit 1Hz
<LED(1,1,0,255,0,2)>        # Grünes Pulsieren mit 2Hz  
<LED(2,1,0,0,255)>          # Statisches Blau
<LED(-0,0)>                 # Erstes Segment ausschalten
<STOP()>                    # Alle LEDs ausschalten
```

### 3. Komplexes Szenario
```
<SCAN()>                    # System initialisieren
<UPDATE(1,75,80,10)>        # Hexagon 1 starten
<UPDATE(2,50,60,15)>        # Hexagon 2 starten
<LED(0,1,255,100,0,1)>      # Orange Pulse für Status
<LED(5,1,0,255,0)>          # Grüne Statusanzeige
```

## Fehlerbehandlung

Das System gibt verschiedene Fehlermeldungen über die serielle Schnittstelle aus:

- `Error: Missing parentheses or malformed values.`
- `Error: Unknown command: [COMMAND]`
- `Error: LED command requires at least 2 values`
- `Error: Invalid LED ID`
- `Error: Maximum segments reached (30)`
- `Error: Device not found.`


## Entwicklungshinweise

- Das System verwendet Arduino's F()-Makro für Flash-String-Speicherung zur RAM-Optimierung
- LED-Updates laufen asynchron im Hauptloop für flüssige Animationen
- I2C-Geräte werden automatisch bei jedem UPDATE-Befehl neu gescannt
