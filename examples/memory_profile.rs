use std::sync::Arc;
use tokio::sync::Mutex;
use webserver::{serial::connect_arduino, AppState};

#[cfg(feature = "dhat-heap")]
#[global_allocator]
static ALLOC: dhat::Alloc = dhat::Alloc;

#[tokio::main]
async fn main() {
    #[cfg(feature = "dhat-heap")]
    let _profiler = dhat::Profiler::new_heap();

    println!("Starting memory profiling with optimizations...");

    // Simulate typical operations
    let arduino_port = connect_arduino().await;
    let state = AppState {
        arduino: Arc::new(Mutex::new(arduino_port)),
    };

    // Simulate workload
    for _ in 0..100 {
        let _lock = state.arduino.lock().await;
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
    }

    println!("Memory profiling complete. Check dhat-heap.json");
}
