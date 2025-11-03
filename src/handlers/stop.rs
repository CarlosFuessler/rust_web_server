use crate::models::{AppState, ErrorResponse, StopRequest, SuccessResponse};
use crate::serial::send_data;
use axum::{extract::State, http::StatusCode, Json};

pub async fn stop(
    State(state): State<AppState>,
    Json(payload): Json<Option<StopRequest>>,
) -> Result<Json<SuccessResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut arduino = state.arduino.lock().await;

    if arduino.is_none() {
        return Err((
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ErrorResponse {
                status: "error".to_string(),
                message: "Arduino not connected - no port available".to_string(),
            }),
        ));
    }

    let command = match payload {
        Some(req) if req.eeprom.is_some() => format!("STOP({})", req.eeprom.unwrap()),
        _ => "STOP()".to_string(),
    };

    let port = arduino.as_mut().unwrap();
    match send_data(port, &command) {
        Ok(response) if !response.to_lowercase().starts_with("error") => {
            Ok(Json(SuccessResponse {
                status: "success".to_string(),
                sent: None,
                arduino_response: Some(response),
                message: None,
                parameters: None,
                data: None,
            }))
        }
        Ok(_) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino".to_string(),
                }),
            ))
        }
        Err(e) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: e,
                }),
            ))
        }
    }
}
