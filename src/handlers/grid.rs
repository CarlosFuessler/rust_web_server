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
        // Read the grid simulator Python code
        let grid_code = std::fs::read_to_string("src/python/grid_simulator.py")
            .map_err(|e| format!("Failed to read grid_simulator.py: {}", e))?;
        
        // Execute the Python code to define the GridSimulator class and create simulator instance
        py.run_bound(&grid_code, None, None)
            .map_err(|e| format!("Failed to execute grid_simulator.py: {}", e))?;

        // Get the __main__ module and extract globals
        let main = py.import_bound("__main__").map_err(|e| e.to_string())?;
        
        // Get the simulator from globals
        let simulator = main.getattr("simulator")
            .map_err(|e| format!("Simulator not found: {}", e))?;
        
        // Call the requested method
        let result = simulator.call_method0(method_name)
            .map_err(|e| format!("Failed to call {}: {}", method_name, e))?;
        
        // Convert to JSON string
        let json_module = py.import_bound("json").map_err(|e| e.to_string())?;
        let json_str = json_module
            .call_method1("dumps", (result,))
            .map_err(|e| format!("JSON dumps error: {}", e))?
            .extract::<String>()
            .map_err(|e| format!("JSON extraction error: {}", e))?;

        // Parse JSON
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