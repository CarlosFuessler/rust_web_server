# UI-Komponenten Übersicht

## 🎨 Design Token Reference

### Farb-Palette
```css
/* Primäre Farben */
--bg-app: #0f1115              /* Haupt-Hintergrund - Tiefes Schwarz */
--bg-panel: rgba(22,24,29,0.75) /* Panel-Hintergrund - Glassmorphism */
--bg-control: rgba(255,255,255,0.05) /* Input/Button Hintergrund */
--bg-control-hover: rgba(255,255,255,0.08) /* Hover State */

/* Akzent-Farben */
--accent-primary: #3b82f6     /* Electric Blue - LED Standard */
--accent-secondary: #8b5cf6   /* Purple - Gradients */

/* Text-Farben */
--text-primary: #f1f5f9       /* Haupttext - Fast Weiß */
--text-secondary: #94a3b8     /* Sekundärtext - Grau */
--text-tertiary: #64748b      /* Tertiär - Dunkelgrau */

/* Utility-Farben */
--border-subtle: rgba(255,255,255,0.1) /* Feine Linien */
--success: #10b981            /* Grün - Online Status */
--danger: #ef4444             /* Rot - Fehler/Disconnect */
--warning: #f59e0b            /* Orange - Warnungen */

/* Farbverläufe */
Power-Gradient:    #ef4444 → #eab308 → #10b981  (Rot→Gelb→Grün)
Charge-Gradient:   #3b82f6 → #8b5cf6            (Blau→Lila)
Time-Gradient:     #6366f1 → #8b5cf6 → #ec4899  (Indigo→Lila→Pink)
```

### Abstände (Spacing)
```css
--space-xs: 0.25rem  (4px)
--space-sm: 0.5rem   (8px)
--space-md: 0.75rem  (12px)
--space-lg: 1rem     (16px)
--space-xl: 1.5rem   (24px)
--space-2xl: 2rem    (32px)
```

### Border Radius
```css
--radius-sm: 6px     /* Buttons, Inputs */
--radius-md: 8px     /* Cards, Panels */
--radius-lg: 12px    /* Große Elemente */
--radius-full: 9999px /* Kreise */
```

### Schatten
```css
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1)

/* Glow-Effekte */
--glow-blue: 0 0 20px rgba(59,130,246,0.5)
--glow-green: 0 0 20px rgba(16,185,129,0.5)
--glow-red: 0 0 20px rgba(239,68,68,0.5)
```

---

## 📦 Komponenten-Bibliothek

### 1. Hexagon Module
```
Struktur:
┌─────────────┐
│   ⬡         │ ← Polygon Shape
│  ╱ ╲        │   
│ │   │       │   Fill: Icon Pattern oder Gradient
│  ╲ ╱        │   Stroke: 2-3px
│   ⬡         │   
│  [●]        │ ← Status LED (grün, pulsierend)
└─────────────┘

States:
- Default:  Stroke: subtle, Fill: gradient
- Hover:    Stroke: blue, Scale: 1.02, Glow
- Selected: Stroke: blue 3px, Pulse-Animation
- With-Image: Icon gefüllt, Overlay-Darken
```

**CSS Klassen**:
- `.hexagon` - Base
- `.hexagon-selected` - Ausgewählt
- `.hexagon-with-image` - Mit Icon
- `.status-led` - Status-Indikator

### 2. LED-Verbindungen
```
Visualisierung:
──────●●●●────── ← Linie mit Energy Flow

Properties:
- Stroke-Width: 3-5px
- Stroke-Linecap: round
- Stroke-Color: rgba(59,130,246,0.3) → user-color
- Animation: stroke-dashoffset (fließend)

States:
- Default:  Subtiles Blau, 3px
- Hover:    Heller, 4px, Glow
- Selected: User-Color, 5px, Energy-Flow-Animation
```

**CSS Klassen**:
- `.hexline` - Base
- `.selected-line` - Aktiv
- `.hexline-glow` - Glow-Layer
- `.selected-line-glow` - Aktiver Glow

### 3. Control Panel - LED Sektion
```
┌──────────────────────────────────┐
│ ● LED STEUERUNG                  │ ← Section Header
├──────────────────────────────────┤
│ LED Farbe                        │ ← Label
│ ┌─────┐ ┌─────────┐ #3B82F6    │
│ │ [🎨] │ │█████████│ HEX-Code  │
│ └─────┘ └─────────┘             │
│  Picker  Live-Preview            │
│                                  │
│ ┌────────────┬────────────┐     │
│ │ Richtung   │ Frequenz   │     │
│ │  [→] [←]   │ ━━━●━━ 3Hz │     │
│ └────────────┴────────────┘     │
└──────────────────────────────────┘

Elemente:
1. Color Picker Input (60x60px)
2. Live Preview (flex:1, height:60px, colored)
3. Hex Display (Mono Font, 1rem)
4. Direction Buttons (50%, flex-row)
5. Frequency Slider (gradient background)
```

**CSS Klassen**:
- `.led-section` - Container
- `.led-color-control` - Farbsteuerung
- `.color-preview-wrapper` - Wrapper
- `.color-picker-input` - Input Element
- `.color-preview` - Live-Vorschau
- `.color-glow` - Glow-Effekt
- `.color-hex` - Hex-Anzeige
- `.direction-toggle` - Button-Gruppe
- `.direction-btn` - Einzelner Button
- `.direction-btn.active` - Aktiver Button
- `.frequency-slider` - Range Input

### 4. Parameter-Slider
```
Layout:
┌────────────────────────────┐
│ Leistung      +50 W        │ ← Header mit Wert
│ ════════●══════════════    │ ← Slider (colored)
│ Verbrauch  0  Erzeugung    │ ← Labels
└────────────────────────────┘

Gradient Background:
Power:  Red → Yellow → Green
Charge: Blue → Purple
Time:   Indigo → Purple → Pink

Thumb:
- Size: 22x22px
- Color: White
- Shadow: 0 2px 10px rgba(0,0,0,0.4)
- Border: 2px solid background
- Hover: Scale 1.2
```

**CSS Klassen**:
- `.param-control` - Container
- `.param-header` - Label Row
- `.param-value` - Wert-Anzeige
- `.param-value.positive` - Grün (Erzeugung)
- `.param-value.negative` - Rot (Verbrauch)
- `.power-slider` - Power Slider
- `.charge-slider` - Charge Slider
- `.time-slider` - Time Slider
- `.param-labels` - Label-Row

### 5. Action Buttons
```
Primary Button:
┌────────────────────────┐
│  ✓  ANWENDEN          │ ← Icon + Text
└────────────────────────┘
- Gradient: Blue → Purple
- Shadow: 0 4px 12px blue/30%
- Hover: Lift -2px, Shadow verstärken
- Font: 0.875rem, Uppercase, Bold

Secondary Button:
┌────────────────────────┐
│  ✕  AUSSCHALTEN       │
└────────────────────────┘
- Background: Glass (5% white)
- Border: 1px subtle
- Hover: 8% white, Border lighter
```

**CSS Klassen**:
- `.action-panel` - Container
- `.action-btn` - Base
- `.action-btn.primary` - Primär (Gradient)
- `.action-btn.secondary` - Sekundär (Ghost)

### 6. Status-Indikatoren
```
Connection Status:
┌─────────────────┐
│ [●] Verbunden   │ ← Grüne LED + Text
└─────────────────┘

Last Update:
┌─────────────────┐
│ [🕐] 14:32:15   │ ← Clock Icon + Time
└─────────────────┘

LED Pulse Animation:
@keyframes:
0%: Opacity 1, Scale 1
50%: Opacity 0.7, Scale 0.9
100%: Opacity 1, Scale 1
Duration: 2s infinite
```

**CSS Klassen**:
- `.status-indicator` - Container
- `.status-dot` - LED Punkt
- `.status-text` - Text-Label
- `.last-update` - Timestamp Display

### 7. Empty State
```
┌───────────────────────────┐
│        ╔═══╗              │
│        ║ ⚡ ║              │ ← Pulsing Icon
│        ╚═══╝              │
│                           │
│  Stromnetz Steuerung      │ ← Heading
│                           │
│  Wähle ein Element aus... │ ← Description
│                           │
│  [⟲ Reset]                │ ← Action
└───────────────────────────┘

Icon:
- Size: 80x80px
- Radial Gradient Background
- Pulse Animation
- Drop Shadow: Blue Glow
```

**CSS Klassen**:
- `.empty-state-panel` - Container
- `.pulse-icon` - Icon Wrapper
- `.quick-actions` - Button Row
- `.quick-action-btn` - Button
- `.quick-action-btn.danger` - Rot variant

### 8. Section Headers
```
┌──────────────────────────┐
│ [●] LED STEUERUNG        │ ← Icon + Title
├──────────────────────────┤ ← Border
│ ...Content...            │
└──────────────────────────┘

Styling:
- Icon: 20x20px, Accent Color
- Title: 0.875rem, Uppercase, Bold
- Border-Bottom: 1px subtle
- Padding-Bottom: 1rem
- Margin-Bottom: 1.25rem
```

**CSS Klassen**:
- `.control-section` - Container
- `.section-header` - Header Row
- `.section-icon` - Icon SVG

---

## 🎭 Animation Library

### 1. Pulse Glow (Hexagon Selection)
```css
@keyframes pulse-glow {
  0%, 100% { 
    filter: drop-shadow(0 0 16px rgba(59,130,246,0.6))
            drop-shadow(0 0 24px rgba(59,130,246,0.3));
  }
  50% { 
    filter: drop-shadow(0 0 20px rgba(59,130,246,0.8))
            drop-shadow(0 0 32px rgba(59,130,246,0.5));
  }
}
Duration: 2s ease-in-out infinite
```

### 2. Energy Flow (LED Animation)
```css
@keyframes energy-flow {
  0% { stroke-dashoffset: 0; opacity: 1; }
  50% { opacity: 0.8; }
  100% { stroke-dashoffset: -20; opacity: 1; }
}
Duration: 2s linear infinite
```

### 3. LED Pulse (Status Indicator)
```css
@keyframes led-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
Duration: 2s ease-in-out infinite
```

### 4. Alert Pulse (Connection Banner)
```css
@keyframes alert-pulse {
  0%, 100% { box-shadow: 0 8px 32px rgba(239,68,68,0.3); }
  50% { box-shadow: 0 8px 32px rgba(239,68,68,0.5); }
}
Duration: 2s ease-in-out infinite
```

### 5. Slide In (Panel Entry)
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
Duration: 0.3s ease-out
```

### 6. Glow Animation (Color Preview)
```css
@keyframes glow-animation {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
Duration: 2s ease-in-out infinite
```

---

## 📱 Responsive Breakpoints

### Desktop (>1024px)
```
┌─────────────────────────────────┐
│ Sidebar │      Canvas          │
│  320px  │     Remaining        │
│         │                      │
│ Control │    ⬡  ⬡  ⬡          │
│  Panel  │      ⬡  ⬡            │
│         │    ⬡  ⬡  ⬡          │
└─────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────────────────────────────┐
│         Canvas (Full)           │
│                                 │
│        ⬡  ⬡  ⬡                  │
│          ⬡  ⬡                   │
│        ⬡  ⬡  ⬡                  │
├─────────────────────────────────┤
│    Control Panel (Bottom)       │
│    60vh height, slides up       │
└─────────────────────────────────┘

Toggle: [☰] Button (Fixed, Bottom-Right)
```

### Mobile (<768px)
```
┌──────────────┐
│   Canvas     │
│   (Scaled)   │
│              │
│   ⬡  ⬡       │
│     ⬡        │
│   ⬡  ⬡       │
│              │
│   [☰]        │ ← Hamburger
├──────────────┤
│   Control    │
│   (Overlay)  │
└──────────────┘
```

**Media Queries**:
```css
@media (max-width: 1024px) {
  /* Sidebar → Bottom Sheet */
  .sidebar {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60vh;
  }
}

@media (max-width: 768px) {
  /* Canvas Scale */
  .hexagon-canvas {
    transform: scale(0.85);
  }
}
```

---

## 🎨 Typografie

### Font-Familien
```css
/* UI Text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
Weights: 300, 400, 500, 600

/* Data/Code */
font-family: 'JetBrains Mono', 'Courier New', monospace;
Weights: 400, 500
```

### Font-Größen
```css
--text-xs: 0.75rem    (12px) - Labels, Timestamps
--text-sm: 0.875rem   (14px) - Body, Buttons
--text-base: 1rem     (16px) - Headings
--text-lg: 1.125rem   (18px) - Values
--text-xl: 1.25rem    (20px) - Page Titles
```

### Font-Weights
```css
300 - Light (Subtitles)
400 - Regular (Body)
500 - Medium (Labels)
600 - Semibold (Headings)
700 - Bold (Values, Emphasis)
```

---

## 🔧 Implementierungs-Tipps

### Performance
1. **Memoization**: React.memo() für Hexagons
2. **SVG-Optimierung**: Patterns nur bei Bedarf
3. **Animation**: CSS statt JS für Performance
4. **Debouncing**: Bei Range-Slider Inputs

### Accessibility
1. **ARIA-Labels**: Alle interaktiven Elemente
2. **Keyboard Navigation**: Tab-Order beachten
3. **Focus States**: Sichtbare Fokus-Ringe
4. **Color Contrast**: WCAG AA-konform

### Browser-Kompatibilität
1. **Vendor Prefixes**: -webkit- für backdrop-filter
2. **Fallbacks**: rgba() für ältere Browser
3. **Polyfills**: CSS Custom Properties Support

---

**Version**: 3.0  
**Letztes Update**: 19. Januar 2026  
**Status**: ✅ Production Ready
