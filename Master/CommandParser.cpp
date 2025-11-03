#include "CommandParser.h"
#include <string.h>
#include <stdlib.h>

void recvWithStartEndMarkers()
{
  static boolean recvInProgress = false;
  static byte ndx = 0;
  char startMarker = '<';
  char endMarker = '>';
  char rc;

  while (Serial.available() > 0 && newData == false)
  {
    rc = Serial.read();

    if (recvInProgress == true)
    {
      if (rc != endMarker)
      {
        receivedChars[ndx] = rc;
        ndx++;
        if (ndx >= numChars)
        {
          ndx = numChars - 1;
        }
      }
      else
      {
        receivedChars[ndx] = '\0'; // terminate the string
        recvInProgress = false;
        ndx = 0;
        newData = true;
      }
    }

    else if (rc == startMarker)
    {
      recvInProgress = true;
    }
  }
}

void parseCommand(const char *input)
{
  // Find parentheses
  char *openParen = strchr(input, '(');
  char *closeParen = strrchr(input, ')');

  if (openParen == nullptr || closeParen == nullptr || closeParen < openParen)
  {
    Serial.println(F("Error: Missing parentheses or malformed values."));
    return;
  }

  int commandLength = openParen - input;
  char command[16];
  if (commandLength >= 16)
  {
    Serial.println(F("Error: Command too long."));
    return;
  }
  strncpy(command, input, commandLength);
  command[commandLength] = '\0';
  // Trim command
  while (commandLength > 0 && command[commandLength - 1] == ' ')
  {
    command[--commandLength] = '\0';
  }

  // Extract values string
  int valuesLength = closeParen - openParen - 1;
  char valuesStr[64]; // Reduziert von 64 auf 32 Bytes
  strncpy(valuesStr, openParen + 1, valuesLength);
  valuesStr[valuesLength] = '\0';

  // Parse values
  int values[10];
  int valueCount = 0;
  char *token = strtok(valuesStr, ",");

  while (token != nullptr && valueCount < 10)
  {
    // Trim whitespace from token
    while (*token == ' ')
      token++;
    char *end = token + strlen(token) - 1;
    while (end > token && *end == ' ')
      *end-- = '\0';

    values[valueCount++] = atoi(token);
    token = strtok(nullptr, ",");
  }

  if (strcasecmp(command, "UPDATE") == 0)
  {
    handleUpdateCommand(values, valueCount);
  }
  else if (strcasecmp(command, "SCAN") == 0)
  {
    handleScanCommand();
  }
  else if (strcasecmp(command, "STOP") == 0)
  {
    handleStopCommand(values, valueCount);
  }
  else if (strcasecmp(command, "LED") == 0)
  {
    handleLEDCommand(values, valueCount);
  }
  else
  {
    Serial.print(F("Error: Unknown command: "));
    Serial.println(command);
  }
}

void handleUpdateCommand(int *values, int count)
{
  scanI2CAddresses(false);
  if (count < 4 || count > 5)
  {
    Serial.println(F("Error: UPDATE needs 4-5 values (eeprom,power,charge,time,active)"));
    return;
  }

  JsonInput.clear();
  int eepromId = values[0];

  JsonInput["p"] = values[1];
  JsonInput["c"] = values[2];
  JsonInput["t"] = values[3];
  JsonInput["r"] = (count > 4) ? values[4] : 1;

  DeviceData *device = findDeviceByEEPROM(eepromId);
  if (device == nullptr)
  {
    Serial.print(F("Error: Device with EEPROM "));
    Serial.print(eepromId);
    Serial.println(F(" not found."));
    return;
  }

  Wire.beginTransmission(device->i2c);
  serializeJson(JsonInput, Wire);
  Wire.endTransmission();

  Serial.print(F("Info: Updated device EEPROM "));
  Serial.println(eepromId);
}

void handleScanCommand()
{
  scanI2CAddresses(true);
}

void handleStopCommand(int *values, int count)
{
  scanI2CAddresses(false);

  if (deviceCount == 0)
  {
    Serial.println(F("Info: No devices to stop."));
    return;
  }

  JsonInput.clear();
  JsonInput["p"] = 0;
  JsonInput["c"] = 0;
  JsonInput["r"] = 0;
  JsonInput["t"] = 0;

  if (count < 1)
  {

    // LED-Array leeren
    segmentCount = 0;
    displayOff(); // LEDs ausschalten
    Serial.print(F("Info: LED array cleared."));

    for (int i = 0; i < deviceCount; i++)
    {
      int eepromId = devices[i].eeprom;
      int i2cAddress = devices[i].i2c;

      Wire.beginTransmission(i2cAddress);
      serializeJson(JsonInput, Wire);
      Wire.endTransmission();

      Serial.print(F(" Stopped device EEPROM "));
      Serial.print(eepromId);
    }

    Serial.println(F("All devices stopped."));
  }
  else
  {
    for (int i = 0; i < count; i++)
    {
      int eepromId = values[i];
      DeviceData *device = findDeviceByEEPROM(eepromId);
      if (device != nullptr)
      {
        Wire.beginTransmission(device->i2c);
        serializeJson(JsonInput, Wire);
        Wire.endTransmission();
        Serial.print(F("Info: Stopped device EEPROM "));
        Serial.print(eepromId);
      }
      else
      {
        Serial.print(F("Error: Device not found "));
        Serial.print(eepromId);
      }
    }
    Serial.println();
  }
}
void handleSerialInput()
{
  recvWithStartEndMarkers();
  if (newData == true)
  {
    strcpy(tempChars, receivedChars);
    parseCommand(tempChars);
    newData = false;
  }
}
