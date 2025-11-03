use crate::models::{AppState, ErrorResponse, LedRequest, SuccessResponse};
use crate::serial::send_data;
use crate::utils::{hex_to_rgb, make_led_string};
use axum::{extract::State, http::StatusCode, Json};

pub async fn led(
    State(state): State<AppState>,
    Json(payload): Json<LedRequest>,
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

    println!("{:?}", payload);

    let rgb_color = match hex_to_rgb(&payload.color) {
        Ok(color) => color,
        Err(e) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: e,
                }),
            ))
        }
    };

    let data_string = make_led_string(
        payload.led_id,
        rgb_color,
        payload.forward,
        payload.pulse_frequenz,
    );

    let port = arduino.as_mut().unwrap();
    match send_data(port, &data_string) {
        Ok(response) if !response.to_lowercase().starts_with("error") => {
            Ok(Json(SuccessResponse {
                status: "success".to_string(),
                sent: None,
                arduino_response: None,
                message: Some("LED parameters received".to_string()),
                parameters: Some(serde_json::json!({
                    "ledID": payload.led_id,
                    "color": rgb_color,
                    "forward": payload.forward,
                    "pulseFrequenz": payload.pulse_frequenz,
                })),
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
