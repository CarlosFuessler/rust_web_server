use crate::models::{AppState, ErrorResponse, SuccessResponse};
use crate::serial::send_data;
use crate::utils::format_response;
use axum::{extract::State, http::StatusCode, Json};
use std::time::Duration;

pub async fn scan(
    State(state): State<AppState>,
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

    let port = arduino.as_mut().unwrap();

    let response1 = match send_data(port, "SCAN()") {
        Ok(r) if !r.to_lowercase().starts_with("error") => r,
        Ok(_) | Err(_) => {
            *arduino = None;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino on first scan".to_string(),
                }),
            ));
        }
    };

    let formatted1 = format_response(&response1).ok();
    tokio::time::sleep(Duration::from_millis(100)).await;

    let response2 = match send_data(port, "SCAN()") {
        Ok(r) if !r.to_lowercase().starts_with("error") => r,
        Ok(_) | Err(_) => {
            *arduino = None;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino on second scan".to_string(),
                }),
            ));
        }
    };

    let formatted2 = format_response(&response2).ok();

    if formatted1 == formatted2 {
        return Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some(response1.clone()),
            message: None,
            parameters: None,
            data: formatted1,
        }));
    }

    let response3 = match send_data(port, "SCAN()") {
        Ok(r) if !r.to_lowercase().starts_with("error") => r,
        Ok(_) | Err(_) => {
            *arduino = None;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino on third scan".to_string(),
                }),
            ));
        }
    };

    let formatted3 = format_response(&response3).ok();

    if formatted1 == formatted3 {
        Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some(response1),
            message: None,
            parameters: None,
            data: formatted1,
        }))
    } else if formatted2 == formatted3 {
        Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some(response2),
            message: None,
            parameters: None,
            data: formatted2,
        }))
    } else {
        Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some("No consistent pair found".to_string()),
            message: None,
            parameters: None,
            data: Some(serde_json::json!([])),
        }))
    }
}
