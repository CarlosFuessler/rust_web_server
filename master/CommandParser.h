<<<<<<< HEAD:master/CommandParser.h
#ifndef COMMAND_PARSER_H
#define COMMAND_PARSER_H

#include <Arduino.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include "structs.h"
#include "LedHandler.h"

extern int deviceCount;
extern DeviceData devices[];
extern StaticJsonDocument<32> JsonInput;

extern const byte numChars;
extern char receivedChars[];
extern char tempChars[]; // temporary array for use when parsing
extern boolean newData;

extern DeviceData *findDeviceByEEPROM(int eepromId);
extern void scanI2CAddresses(bool printNew);

void parseCommand(const char *input);
void recvWithStartEndMarkers();
void handleSerialInput();
void handleUpdateCommand(int *values, int count);
void handleScanCommand();
void handleStopCommand(int *values, int count);

#endif
=======
#ifndef COMMAND_PARSER_H
#define COMMAND_PARSER_H

#include <Arduino.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include "structs.h"
#include "LedHandler.h"

extern int deviceCount;
extern DeviceData devices[];
extern StaticJsonDocument<32> JsonInput;

extern const byte numChars;
extern char receivedChars[];
extern char tempChars[];
extern boolean newData;

extern DeviceData *findDeviceByEEPROM(int eepromId);
extern void scanI2CAddresses(bool printNew);
extern LEDSegment activeSegments[];
extern int segmentCount;

void parseCommand(const char *input);
void recvWithStartEndMarkers();
void handleSerialInput();
void handleUpdateCommand(int *values, int count);
void handleScanCommand();
void handleStopCommand(int *values, int count);

#endif
>>>>>>> 541b617 (Verbessere die Fallunempfindlichkeit der Befehlsverarbeitung und optimiere die Hauptschleife zur Handhabung von seriellen Eingaben.):Master/CommandParser.h
