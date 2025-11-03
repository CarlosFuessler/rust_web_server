use serde::Serialize;

#[derive(Serialize)]
pub struct SuccessResponse {
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sent: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub arduino_response: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parameters: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub status: String,
    pub message: String,
}
