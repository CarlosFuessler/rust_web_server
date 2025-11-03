#include "LedHandler.h"

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

// Array für aktive LED-Bereiche (jetzt 30 gleichzeitig)
LEDSegment activeSegments[MAX_SEGMENTS];
int segmentCount = 0;

void initializeLEDStrip()
{
    strip.begin();
    strip.show();
    strip.setBrightness(42);
}

void displayOff()
{
    strip.clear();
    strip.show();
}

void handleLEDCommand(int *values, int count)
{
    if (count < 2)
    {
        Serial.println(F("Error: LED command requires at least 2 values (ledId, forwards)"));
        return;
    }

    int ledId = values[0];
    bool forwards = (values[1] != 0); // 0 = rückwärts, alles andere = vorwärts
    bool isNegative = ledId < 0;

    if (isNegative)
    {
        ledId = -ledId; // Betrag von ledId nehmen
    }

    // Prüfe ob ledId gültig ist
    if (ledId > 30)
    {
        Serial.print(F("Error: Invalid LED ID "));
        Serial.print(ledId);
        Serial.println(F(" (must be 0-30)"));
        return;
    }

    // Berechne LED-Bereich
    int startLed = ledId * SEGMENT_LENGTH;
    int endLed = startLed + SEGMENT_LENGTH - 1;

    if (endLed >= LED_COUNT)
    {
        Serial.print(F("Error: LED range exceeds strip size ("));
        Serial.print(endLed);
        Serial.print(F(" >= "));
        Serial.print(LED_COUNT);
        Serial.println(F(")"));
        return;
    }

    if (isNegative)
    {
        // LED-Bereich aus Array entfernen und ausschalten
        for (int i = 0; i < segmentCount; i++)
        {
            if (activeSegments[i].ledId == ledId)
            {
                // LEDs ausschalten
                for (int j = startLed; j <= endLed; j++)
                {
                    strip.setPixelColor(j, strip.Color(0, 0, 0));
                }

                // Segment aus Array entfernen
                for (int k = i; k < segmentCount - 1; k++)
                {
                    activeSegments[k] = activeSegments[k + 1];
                }
                segmentCount--;

                Serial.print(F("Info: LED ID "));
                Serial.print(ledId);
                Serial.println(F(" removed from array and turned OFF"));
                strip.show();
                return;
            }
        }

        // Falls nicht im Array, einfach ausschalten
        for (int i = startLed; i <= endLed; i++)
        {
            strip.setPixelColor(i, strip.Color(0, 0, 0));
        }
        strip.show();

        Serial.print(F("Info: LED ID "));
        Serial.print(ledId);
        Serial.println(F(" turned OFF"));
        return;
    }

    // Für positive LED-IDs brauchen wir RGB-Werte
    if (count < 5)
    {
        Serial.println(F("Error: LED ON requires 5+ values (ledId, forwards, r, g, b[, pulseFreq])"));
        return;
    }

    // RGB-Werte mit Bounds-Checking
    uint8_t red = constrain(values[2], 0, 255);
    uint8_t green = constrain(values[3], 0, 255);
    uint8_t blue = constrain(values[4], 0, 255);
    float frequency = (count >= 6) ? values[5] : 0;

    if (frequency <= 0)
    {
        // Statisches Setzen ohne Array-Speicherung
        int step = forwards ? 1 : -1;
        int start = forwards ? startLed : endLed;
        int end = forwards ? endLed : startLed;

        for (int i = start; i != end + step; i += step)
        {
            strip.setPixelColor(i, strip.Color(red, green, blue));
        }
        strip.show();

        Serial.print(F("Info: LED ID "));
        Serial.print(ledId);
        Serial.println(F(" set to static color"));
        return;
    }

    // Prüfe ob LED-ID bereits im Array existiert
    for (int i = 0; i < segmentCount; i++)
    {
        if (activeSegments[i].ledId == ledId)
        {
            // Update existing segment
            activeSegments[i].start = forwards ? startLed : endLed;
            activeSegments[i].end = forwards ? endLed : startLed;
            activeSegments[i].r = red;
            activeSegments[i].g = green;
            activeSegments[i].b = blue;
            activeSegments[i].pulseFrequency = frequency;
            activeSegments[i].forwards = forwards;
            activeSegments[i].lastUpdate = 0;
            activeSegments[i].step = 0;

            Serial.print(F("Info: LED ID "));
            Serial.print(ledId);
            Serial.println(F(" updated in array"));
            return;
        }
    }

    // Neues Segment hinzufügen
    if (segmentCount < MAX_SEGMENTS)
    {
        activeSegments[segmentCount].ledId = ledId;
        activeSegments[segmentCount].start = forwards ? startLed : endLed;
        activeSegments[segmentCount].end = forwards ? endLed : startLed;
        activeSegments[segmentCount].r = red;
        activeSegments[segmentCount].g = green;
        activeSegments[segmentCount].b = blue;
        activeSegments[segmentCount].pulseFrequency = frequency;
        activeSegments[segmentCount].forwards = forwards;
        activeSegments[segmentCount].active = true;
        activeSegments[segmentCount].lastUpdate = 0;
        activeSegments[segmentCount].step = 0;
        segmentCount++;

        Serial.print(F("Info: LED ID "));
        Serial.print(ledId);
        Serial.print(F(" added to array. Total segments: "));
        Serial.println(segmentCount);
    }
    else
    {
        Serial.println(F("Error: Maximum segments reached (30)"));
    }
}

void pulseLED(int start, int end, uint32_t baseColor, int offLedPosition, int direction)
{
    for (int i = start; i != end + direction; i += direction)
    {
        if (i == offLedPosition)
        {
            strip.setPixelColor(i, strip.Color(0, 0, 0)); // Diese LED ausschalten
        }
        else
        {
            strip.setPixelColor(i, baseColor); // Normale Farbe setzen
        }
    }
    strip.show();
}

void updateLEDPulseUltraLight()
{
    // Durchlaufe alle aktiven Segmente
    for (int i = 0; i < segmentCount; i++)
    {
        LEDSegment &segment = activeSegments[i];

        if (!segment.active || segment.pulseFrequency <= 0)
            continue;

        unsigned long now = millis();

        // Verwende pulseFrequency um die Geschwindigkeit zu steuern
        unsigned long updateInterval = 1000 / max(1, (int)segment.pulseFrequency);

        if (now - segment.lastUpdate < updateInterval)
            continue;

        segment.lastUpdate = now;

        int direction = (segment.start <= segment.end) ? 1 : -1;
        int totalLeds = abs(segment.end - segment.start) + 1;

        // Berechne die aktuelle Position der ausgeschalteten LED
        int currentOffLed = segment.start + (segment.step * direction);

        // Rufe pulseLED auf
        uint32_t baseColor = strip.Color(segment.r, segment.g, segment.b);
        pulseLED(segment.start, segment.end, baseColor, currentOffLed, direction);

        // Nächste Position berechnen
        segment.step++;
        if (segment.step >= totalLeds)
        {
            segment.step = 0; // Zurück zum Start
        }
    }
}
