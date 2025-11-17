//! Grid Simulation Handlers
//!
//! This module provides HTTP handlers for pandapower grid simulations.
//! It interfaces with Python code via PyO3.

use axum::Json;
use serde_json::{json, Value};
use pyo3::prelude::*;

/// Create a new electrical grid network
pub async fn create_network() -> Json<Value> {
    match Python::with_gil(|py| {
        let grid_code = include_str!("../python/grid_simulator.py");
        let module = PyModule::from_code_bound(
            py,
            grid_code,
            "grid_simulator",
            "grid_simulator",
        )?;

        let simulator = module.getattr("simulator")?;
        let result = simulator.call_method0("create_simple_network")?;
        
        let json_module = py.import_bound("json")?;
        let json_str = json_module.call_method1("dumps", (result,))?;
        let json_data: Value = serde_json::from_str(&json_str.extract::<String>()?).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyException, _>(format!("JSON error: {}", e))
        })?;
        
        Ok::<Value, PyErr>(json_data)
    }) {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": format!("Python error: {}", e)
        })),
    }
}

/// Run power flow simulation
pub async fn run_simulation() -> Json<Value> {
    match Python::with_gil(|py| {
        let grid_code = include_str!("../python/grid_simulator.py");
        let module = PyModule::from_code_bound(
            py,
            grid_code,
            "grid_simulator",
            "grid_simulator",
        )?;

        let simulator = module.getattr("simulator")?;
        let result = simulator.call_method0("run_power_flow")?;
        
        let json_module = py.import_bound("json")?;
        let json_str = json_module.call_method1("dumps", (result,))?;
        let json_data: Value = serde_json::from_str(&json_str.extract::<String>()?).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyException, _>(format!("JSON error: {}", e))
        })?;
        
        Ok::<Value, PyErr>(json_data)
    }) {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": format!("Python error: {}", e)
        })),
    }
}

/// Get bus voltage and power results
pub async fn get_bus_results() -> Json<Value> {
    match Python::with_gil(|py| {
        let grid_code = include_str!("../python/grid_simulator.py");
        let module = PyModule::from_code_bound(
            py,
            grid_code,
            "grid_simulator",
            "grid_simulator",
        )?;

        let simulator = module.getattr("simulator")?;
        let result = simulator.call_method0("get_bus_results")?;
        
        let json_module = py.import_bound("json")?;
        let json_str = json_module.call_method1("dumps", (result,))?;
        let json_data: Value = serde_json::from_str(&json_str.extract::<String>()?).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyException, _>(format!("JSON error: {}", e))
        })?;
        
        Ok::<Value, PyErr>(json_data)
    }) {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": format!("Python error: {}", e)
        })),
    }
}

/// Get transmission line power flow results
pub async fn get_line_results() -> Json<Value> {
    match Python::with_gil(|py| {
        let grid_code = include_str!("../python/grid_simulator.py");
        let module = PyModule::from_code_bound(
            py,
            grid_code,
            "grid_simulator",
            "grid_simulator",
        )?;

        let simulator = module.getattr("simulator")?;
        let result = simulator.call_method0("get_line_results")?;
        
        let json_module = py.import_bound("json")?;
        let json_str = json_module.call_method1("dumps", (result,))?;
        let json_data: Value = serde_json::from_str(&json_str.extract::<String>()?).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyException, _>(format!("JSON error: {}", e))
        })?;
        
        Ok::<Value, PyErr>(json_data)
    }) {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": format!("Python error: {}", e)
        })),
    }
}

/// Get network summary
pub async fn get_network_summary() -> Json<Value> {
    match Python::with_gil(|py| {
        let grid_code = include_str!("../python/grid_simulator.py");
        let module = PyModule::from_code_bound(
            py,
            grid_code,
            "grid_simulator",
            "grid_simulator",
        )?;

        let simulator = module.getattr("simulator")?;
        let result = simulator.call_method0("get_network_summary")?;
        
        let json_module = py.import_bound("json")?;
        let json_str = json_module.call_method1("dumps", (result,))?;
        let json_data: Value = serde_json::from_str(&json_str.extract::<String>()?).map_err(|e| {
            PyErr::new::<pyo3::exceptions::PyException, _>(format!("JSON error: {}", e))
        })?;
        
        Ok::<Value, PyErr>(json_data)
    }) {
        Ok(data) => Json(data),
        Err(e) => Json(json!({
            "status": "error",
            "message": format!("Python error: {}", e)
        })),
    }
}