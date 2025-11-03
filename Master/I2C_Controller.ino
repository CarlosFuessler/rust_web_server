// Serial Input JSON
// JSON over I2C
// Master Code
#include <Arduino.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "CommandParser.h"
#include "structs.h"

// JSON structure that will be sent over Serial and I2C to the hexagons
//
// {
// time: 0 bis 47;
// Power: -100% bis 100 %;
// Charge: 0 bis 100 %;
// active: 0 oder 1;
// }
//

StaticJsonDocument<32> JsonInput; // Use StaticJsonDocument with a size

const byte numChars = 32;
char receivedChars[numChars];
char tempChars[numChars]; // temporary array for use when parsing

boolean newData = false;

// Maximal 32 Geräte speichern (anpassbar)
#define MAX_DEVICES 16
DeviceData devices[MAX_DEVICES];
int deviceCount = 0;

void scanI2CAddresses(bool print = false)
{
  bool changed = false;
  DeviceData newDevices[MAX_DEVICES];
  int newDeviceCount = 0;

  for (byte addr = 1; addr < 127; addr++)
  {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0)
    {
      Wire.requestFrom((uint8_t)addr, (uint8_t)64);

      char jsonBuffer[36];
      int bufferIndex = 0;

      // Lese Zeichen in char Array
      while (Wire.available() && bufferIndex < 35)
      { // Ändert von 127 zu 35 (Größe des Buffers)
        jsonBuffer[bufferIndex] = Wire.read();
        bufferIndex++;
      }
      jsonBuffer[bufferIndex] = '\0';

      if (bufferIndex > 0 && newDeviceCount < MAX_DEVICES)
      {
        StaticJsonDocument<36> doc;
        DeserializationError error = deserializeJson(doc, jsonBuffer);

        if (!error)
        { // Prüfe auf Fehler!
          newDevices[newDeviceCount].eeprom = doc["EEPROM"];
          newDevices[newDeviceCount].i2c = doc["I2C"];
          newDevices[newDeviceCount].type = doc["TYPE"];
          newDeviceCount++;
        }
        else
        {
          Serial.print(F("Error: JSON parse failed at address "));
          Serial.println(addr);
        }
      }
    }
  }
  // Prüfen ob sich etwas geändert hat
  if (newDeviceCount != deviceCount)
  {
    changed = true;
  }
  else
  {
    for (int i = 0; i < newDeviceCount; i++)
    {
      if (newDevices[i].eeprom != devices[i].eeprom ||
          newDevices[i].i2c != devices[i].i2c ||
          newDevices[i].type != devices[i].type)
      {
        changed = true;
        break;
      }
    }
  }
  if (changed)
  {
    deviceCount = newDeviceCount;
    for (int i = 0; i < deviceCount; i++)
    {
      devices[i] = newDevices[i];
    }
  }
  if (print)
  {
    Serial.print(F("DeviceList:["));
    for (int i = 0; i < deviceCount; i++)
    {
      Serial.print(F("  {\"EEPROM\":"));
      Serial.print(devices[i].eeprom);
      Serial.print(F(",\"I2C\":"));
      Serial.print(devices[i].i2c);
      Serial.print(F(",\"TYPE\":"));
      Serial.print(devices[i].type);
      Serial.print(F("}"));

      if (i < deviceCount - 1)
      {
        Serial.print(F(","));
      }
      else
      {
        Serial.print("");
      }
    }
    Serial.println(F("]"));
  }
}

// Hilfsfunktion: Suche nach DeviceData anhand EEPROM
DeviceData *findDeviceByEEPROM(int eepromId)
{
  for (int i = 0; i < deviceCount; i++)
  {
    if (devices[i].eeprom == eepromId)
    {
      return &devices[i];
    }
  }
  return nullptr;
}

extern char _end;                // Wird vom Linker gesetzt
extern "C" char *sbrk(int incr); // Heap-Ende

int getfreeRam()
{
  char stack_dummy = 0;
  char *heap_end = sbrk(0);
  char *stack_ptr = &stack_dummy;
  return stack_ptr - heap_end;
}

// Funktion zur regelmäßigen RAM-Überwachung
void monitorRAM()
{
  static unsigned long lastRamCheck = 0;
  unsigned long now = millis();

  if (now - lastRamCheck >= 5000)
  { // Alle 5 Sekunden
    lastRamCheck = now;
    int freeRam = getfreeRam();

    Serial.print(F("Free RAM: "));
    Serial.print(freeRam);
    Serial.println(F(" bytes"));

    // Warnung bei niedrigem RAM
    if (freeRam < 200)
    {
      Serial.println(F("WARNING: Low RAM!"));
    }
  }
}

void setup()
{
  Serial.begin(9600);
  Wire.begin();
  initializeLEDStrip();
  Serial.println(F("Info: I2C Controller ready."));
  scanI2CAddresses(true);
}

void loop()
{
  recvWithStartEndMarkers();
  if (newData == true)
  {
    strcpy(tempChars, receivedChars); // Copy receivedChars to tempChars for parsing
    parseCommand(tempChars);
    newData = false; // Reset newData after processing
  }
  updateLEDPulseUltraLight();
  monitorRAM();
}
