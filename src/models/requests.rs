use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct UpdateRequest {
    pub power: i32,
    pub charge: i32,
    pub time: i32,
    pub eeprom: i32,
    #[serde(default = "default_active")]
    pub active: i32,
}

fn default_active() -> i32 {
    1
}

#[derive(Deserialize, Debug)]
pub struct StopRequest {
    pub eeprom: Option<i32>,
}

#[derive(Deserialize, Debug)]
pub struct LedRequest {
    #[serde(rename = "ledID")]
    pub led_id: i32,
    pub color: String, // hex color
    pub forward: bool,
    #[serde(rename = "pulseFrequenz")]
    pub pulse_frequenz: i32,
}
