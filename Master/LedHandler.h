#ifndef LED_HANDLER_H
#define LED_HANDLER_H

#include <Wire.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include "structs.h"

extern StaticJsonDocument<32> JsonInput;
extern DeviceData devices[];
extern int deviceCount;
extern DeviceData* findDeviceByEEPROM(int eepromId);

#define LED_PIN 8
#define LED_COUNT 155
#define MAX_SEGMENTS 30
#define SEGMENT_LENGTH 5

// Struktur für LED-Bereich
struct LEDSegment {
    int ledId;
    int start;
    int end;
    uint8_t r, g, b;
    float pulseFrequency;
    bool forwards;
    bool active;
    unsigned long lastUpdate;
    int step;
};

extern Adafruit_NeoPixel strip;

// Globale Arrays und Variablen
extern LEDSegment activeSegments[MAX_SEGMENTS];
extern int segmentCount;

void initializeLEDStrip();
void displayOff();
void handleLEDCommand(int* values, int count);
void updateLEDPulseUltraLight();
void pulseLED(int start, int end, uint32_t baseColor, int offLedPosition, int direction);

#endif
