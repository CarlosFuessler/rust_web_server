//! Grid Simulation Handlers
//!
//! This module provides HTTP handlers for pandapower grid simulations.
//! It interfaces with Python code via PyO3.

use axum::Json;
use serde_json::{json, Value};
use pyo3::prelude::*;

/// Load and execute Python grid simulator
fn execute_python_method(method_name: &str) -> Result<Value, String> {
    Python::with_gil(|py| {
        // Add current directory to Python path
        let sys = py.import_bound("sys").map_err(|e| e.to_string())?;
        let path = sys.getattr("path").map_err(|e| e.to_string())?;
        path.call_method1("insert", (0, "src")).map_err(|e| e.to_string())?;

        // Import the grid simulator module
        let module = py.import_bound("python.grid_simulator").map_err(|e| {
            format!("Failed to import grid_simulator: {}", e)
        })?;

        // Get the global simulator instance
        let simulator = module.getattr("simulator").map_err(|e| e.to_string())?;
        
        // Call the requested method
        let result = simulator.call_method0(method_name).map_err(|e| e.to_string())?;
        
        // Convert to JSON
        let json_module = py.import_bound("json").map_err(|e| e.to_string())?;
        let json_str = json_module
            .call_method1("dumps", (result,))
            .map_err(|e| e.to_string())?
            .extract::<String>()
            .map_err(|e| e.to_string())?;

        serde_json::from_str::<Value>(&json_str)
            .map_err(|e| format!("JSON parsing error: {}", e))
    })
}

/// Create a new electrical grid network
pub async fn create_network() -> Json<Value> {
    match execute_python_method("create_simple_network") {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": e
        })),
    }
}

/// Run power flow simulation
pub async fn run_simulation() -> Json<Value> {
    match execute_python_method("run_power_flow") {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": e
        })),
    }
}

/// Get bus voltage and power results
pub async fn get_bus_results() -> Json<Value> {
    match execute_python_method("get_bus_results") {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": e
        })),
    }
}

/// Get transmission line power flow results
pub async fn get_line_results() -> Json<Value> {
    match execute_python_method("get_line_results") {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": e
        })),
    }
}

/// Get network summary
pub async fn get_network_summary() -> Json<Value> {
    match execute_python_method("get_network_summary") {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": e
        })),
    }
}