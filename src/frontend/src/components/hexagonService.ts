export const hexagonService = {
  async sendUpdate(
    hexagonLabel: string,
    power: number,
    charge: number,
    time: number
  ) {
    const requestData = {
      power,
      charge,
      active: 1,
      time,
      eeprom: parseInt(hexagonLabel),
    };

    console.log("Update clicked:", {
      hexagon: hexagonLabel,
      ...requestData,
    });

    try {
      const response = await fetch("http://localhost:5000/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);
        return { success: true, result };
      } else {
        console.error("Update failed:", response.status, response.statusText);
        return {
          success: false,
          error: `${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error("Network error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  async sendTurnOff(hexagonLabel: string = "None") {
    const eeprom = parseInt(hexagonLabel);
    const requestData = isNaN(eeprom) ? {} : { eeprom };

    console.log("Turn Off clicked:", {
      hexagon: hexagonLabel,
      ...requestData,
    });

    try {
      const response = await fetch("http://localhost:5000/api/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Stop successful:", result);
        return { success: true, result };
      } else {
        console.error("Stop failed:", response.status, response.statusText);
        return {
          success: false,
          error: `${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error("Network error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  async getPositions() {
    try{
      const response = await fetch("http://localhost:5000/api/scan");
      if (response.ok) {
        const result = await response.json();
        console.log("Positions successful:", result);
        return { success: true, result };
      } else if (response.status === 503){
            console.warn("No arduino connected. Please connect one and try again.", response.status, response.statusText);
            return {
              success: false,
              error: `${response.status} ${response.statusText}`,
            };
      }
       else {
        console.error("Positions failed:", response.status, response.statusText);
        return {
          success: false,
          error: `${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error("Network error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  // Line-spezifische Services
  async sendLineUpdate(
    lineLabel: string,
    ledForward: boolean,
    ledColor: string,
    ledPulsFrequenz: number
  ) {
    const requestData = {
      ledID: lineLabel,
      forward: ledForward,
      color: ledColor,
      pulseFrequenz: ledPulsFrequenz,
    };

    console.log("Line Update clicked:", requestData);

    // Erstmal nur Console-Output, später echter API-Call
    try {
      
      const response = await fetch("http://localhost:5000/api/led", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);
        return { success: true, result };
      } else {
        console.error("Update failed:", response.status, response.statusText);
        return {
          success: false,
          error: `${response.status} ${response.statusText}`,
        };
      }      
    } catch (error) {
      console.error("Line update error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Line update error",
      };
    }
  },

  async sendLineTurnOff(lineLabel: string) {
    const requestData = {
      lineLabel,
      type: 'line',
      action: 'turnOff'
    };

    console.log("Line Turn Off clicked:", requestData);

    try {
      // Simulation eines API-Calls
      console.log("Sending line turn off to server:", requestData);
      
      // Hier würde später der echte API-Call stehen:
      // const response = await fetch("http://localhost:5000/api/line-stop", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(requestData),
      // });

      // Simuliere erfolgreiche Antwort
      const result = { message: "Line turn off successful (simulated)", data: requestData };
      console.log("Line turn off successful:", result);
      return { success: true, result };
      
    } catch (error) {
      console.error("Line turn off error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Line turn off error",
      };
    }
  }
};
