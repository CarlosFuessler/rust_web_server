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
