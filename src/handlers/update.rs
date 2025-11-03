use crate::models::{AppState, ErrorResponse, SuccessResponse, UpdateRequest};
use crate::serial::send_data;
use crate::utils::make_update_string;
use axum::{extract::State, http::StatusCode, Json};

pub async fn update(
    State(state): State<AppState>,
    Json(payload): Json<UpdateRequest>,
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

    let data_string = make_update_string(
        payload.power,
        payload.charge,
        payload.time,
        payload.eeprom,
        payload.active,
    );

    let port = arduino.as_mut().unwrap();
    match send_data(port, &data_string) {
        Ok(response) if !response.to_lowercase().starts_with("error") => {
            Ok(Json(SuccessResponse {
                status: "success".to_string(),
                sent: Some(data_string),
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
