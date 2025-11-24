# 11_RUST_BACKEND

## Purpose

Complete Rust backend implementation for Tauri, including all commands, system integrations, and platform-specific code.

## Prerequisites

- Rust 1.77.2 installed
- Tauri 2.x knowledge
- Understanding of async Rust (tokio)

## Backend Architecture

```
src-tauri/src/
├── main.rs              # Entry point
├── lib.rs               # Core logic + commands
├── analytics.rs         # Supabase integration
└── theme_manager.rs     # IDE/Terminal themes
```

## Complete Implementations

### 1. main.rs

**Location**: `src-tauri/src/main.rs`

```rust
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run();
}
```

### 2. lib.rs (Core Logic)

**Location**: `src-tauri/src/lib.rs`

**Complete Implementation** (1000+ lines):

```rust
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager};

mod analytics;
mod theme_manager;

// Timer persistence
#[derive(Serialize, Deserialize, Debug)]
struct TimerPersistence {
    work_duration: f64,
    last_saved: u64,
}

// Timer state
struct TimerState {
    is_active: Arc<Mutex<bool>>,
    work_duration: Arc<Mutex<f64>>,
    last_update: Arc<Mutex<Instant>>,
    was_active: Arc<Mutex<bool>>,
    should_stop: Arc<Mutex<bool>>,
    app_handle: Arc<Mutex<Option<tauri::AppHandle>>>,
}

fn get_timer_data_path(app: &tauri::AppHandle) -> PathBuf {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data dir");
    fs::create_dir_all(&app_data_dir).expect("Failed to create app data dir");
    app_data_dir.join("rust_timer_state.json")
}

fn save_timer_state(app: &tauri::AppHandle, work_duration: f64) {
    let path = get_timer_data_path(app);
    let data = TimerPersistence {
        work_duration,
        last_saved: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };

    if let Ok(json) = serde_json::to_string(&data) {
        let _ = fs::write(path, json);
    }
}

fn load_timer_state(app: &tauri::AppHandle) -> Option<f64> {
    let path = get_timer_data_path(app);

    if let Ok(content) = fs::read_to_string(path) {
        if let Ok(data) = serde_json::from_str::<TimerPersistence>(&content) {
            return Some(data.work_duration);
        }
    }

    None
}

#[tauri::command]
fn start_rust_timer(app: tauri::AppHandle, state: tauri::State<TimerState>) {
    *state.app_handle.lock().unwrap() = Some(app.clone());

    if let Some(saved_duration) = load_timer_state(&app) {
        *state.work_duration.lock().unwrap() = saved_duration;
        println!("[Rust Timer] Restored work duration: {:.2}s", saved_duration);
    }

    let is_active = state.is_active.clone();
    let work_duration = state.work_duration.clone();
    let last_update = state.last_update.clone();
    let was_active = state.was_active.clone();
    let should_stop = state.should_stop.clone();

    thread::spawn(move || {
        let mut save_counter = 0;

        loop {
            if *should_stop.lock().unwrap() {
                let duration = *work_duration.lock().unwrap();
                save_timer_state(&app, duration);
                break;
            }

            thread::sleep(Duration::from_secs(1));
            save_counter += 1;

            let now = Instant::now();
            let active = *is_active.lock().unwrap();
            let prev_active = *was_active.lock().unwrap();

            if active {
                if !prev_active {
                    *last_update.lock().unwrap() = now;
                } else {
                    let last = *last_update.lock().unwrap();
                    let elapsed = now.duration_since(last).as_secs_f64();

                    let mut duration = work_duration.lock().unwrap();
                    *duration += elapsed;

                    *last_update.lock().unwrap() = now;

                    let _ = app.emit("rust-timer-update", *duration);

                    if save_counter >= 5 {
                        save_timer_state(&app, *duration);
                        save_counter = 0;
                    }
                }
                *was_active.lock().unwrap() = true;
            } else {
                *was_active.lock().unwrap() = false;
            }
        }
    });
}

#[tauri::command]
fn set_timer_active(state: tauri::State<TimerState>, active: bool) {
    let mut is_active = state.is_active.lock().unwrap();
    *is_active = active;
}

#[tauri::command]
fn get_work_duration(state: tauri::State<TimerState>) -> f64 {
    *state.work_duration.lock().unwrap()
}

#[tauri::command]
fn reset_work_timer(state: tauri::State<TimerState>) {
    let mut duration = state.work_duration.lock().unwrap();
    *duration = 0.0;
    *state.last_update.lock().unwrap() = Instant::now();

    if let Some(app) = state.app_handle.lock().unwrap().as_ref() {
        save_timer_state(app, 0.0);
    }
}

#[tauri::command]
fn stop_rust_timer(state: tauri::State<TimerState>) {
    let mut should_stop = state.should_stop.lock().unwrap();
    *should_stop = true;

    let duration = *state.work_duration.lock().unwrap();
    if let Some(app) = state.app_handle.lock().unwrap().as_ref() {
        save_timer_state(app, duration);
    }
}

#[tauri::command]
fn get_idle_time() -> Result<u64, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("ioreg")
            .arg("-c")
            .arg("IOHIDSystem")
            .output()
            .map_err(|e| format!("Failed to execute ioreg: {}", e))?;

        let output_str = String::from_utf8_lossy(&output.stdout);

        for line in output_str.lines() {
            if line.contains("HIDIdleTime") {
                if let Some(value_str) = line.split('=').nth(1) {
                    let value_str = value_str.trim();
                    if let Ok(nanoseconds) = value_str.parse::<u64>() {
                        let seconds = nanoseconds / 1_000_000_000;
                        return Ok(seconds);
                    }
                }
            }
        }

        Err("Could not find HIDIdleTime".to_string())
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Idle time detection is only supported on macOS".to_string())
    }
}

#[tauri::command]
#[allow(unused_variables)]
fn set_dark_mode(enabled: bool) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let mode = if enabled { "true" } else { "false" };
        let script = format!(
            "tell application \"System Events\" to tell appearance preferences to set dark mode to {}",
            mode
        );

        let output = Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .output()
            .map_err(|e| format!("Failed to execute osascript: {}", e))?;

        if output.status.success() {
            Ok(format!("Dark mode set to: {}", enabled))
        } else {
            let error = String::from_utf8_lossy(&output.stderr);
            Err(format!("osascript error: {}", error))
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Dark mode toggle is only supported on macOS".to_string())
    }
}

#[tauri::command]
fn get_dark_mode() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("defaults")
            .arg("read")
            .arg("-g")
            .arg("AppleInterfaceStyle")
            .output()
            .map_err(|e| format!("Failed to read dark mode: {}", e))?;

        let result = String::from_utf8_lossy(&output.stdout);
        Ok(result.trim() == "Dark")
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(false)
    }
}

#[tauri::command]
async fn send_discord_notification(
    webhook_url: String,
    message: String,
    title: Option<String>,
    description: Option<String>,
    color: Option<u32>,
) -> Result<(), String> {
    info!("Sending Discord notification: {}", message);

    let mut embed = serde_json::json!({
        "color": color.unwrap_or(0x5865F2),
    });

    if let Some(t) = title {
        embed["title"] = serde_json::json!(t);
    }

    if let Some(d) = description {
        embed["description"] = serde_json::json!(d);
    }

    let payload = serde_json::json!({
        "content": message,
        "embeds": [embed]
    });

    let client = reqwest::Client::new();
    let response = client
        .post(&webhook_url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| {
            error!("Discord HTTP request failed: {}", e);
            format!("HTTP request failed: {}", e)
        })?;

    if response.status().is_success() {
        info!("Discord notification sent successfully");
        Ok(())
    } else {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        error!("Discord API error: {} - {}", status, error_text);
        Err(format!("Discord API error: {} - {}", status, error_text))
    }
}

#[tauri::command]
fn read_backend_logs(app: tauri::AppHandle) -> Result<String, String> {
    let log_dir = app
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get log directory: {}", e))?;

    let log_file = log_dir.join("sit-or-live.log");

    if !log_file.exists() {
        return Ok(String::from("# No backend logs found\n"));
    }

    fs::read_to_string(&log_file).map_err(|e| format!("Failed to read log file: {}", e))
}

#[tauri::command]
fn open_log_directory(app: tauri::AppHandle) -> Result<(), String> {
    let log_dir = app
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get log directory: {}", e))?;

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&log_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&log_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&log_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = dotenv::dotenv() {
        info!("dotenv: {:?} (using default local Supabase)", e);
    } else {
        info!("dotenv: loaded .env file successfully");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(TimerState {
            is_active: Arc::new(Mutex::new(false)),
            work_duration: Arc::new(Mutex::new(0.0)),
            last_update: Arc::new(Mutex::new(Instant::now())),
            was_active: Arc::new(Mutex::new(false)),
            should_stop: Arc::new(Mutex::new(false)),
            app_handle: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            set_dark_mode,
            get_dark_mode,
            get_idle_time,
            start_rust_timer,
            set_timer_active,
            get_work_duration,
            reset_work_timer,
            stop_rust_timer,
            send_discord_notification,
            read_backend_logs,
            open_log_directory,
            theme_manager::apply_theme,
            analytics::report_theme_change,
            analytics::report_activity
        ])
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("sit-or-live".to_string()),
                    }),
                ])
                .level(log::LevelFilter::Info)
                .max_file_size(5_000_000)
                .build(),
        )
        .setup(|_app| {
            info!("Sit or Live app started");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3. analytics.rs

**Location**: `src-tauri/src/analytics.rs`

```rust
use chrono::Timelike;
use log::{error, info};
use serde_json::json;

#[tauri::command]
pub async fn report_theme_change(
    theme_name: String,
    city: String,
    country: String,
    weather_code: i32,
) -> Result<(), String> {
    info!("Reporting theme change: {} in {}", theme_name, city);

    let supabase_url =
        std::env::var("SUPABASE_URL").unwrap_or_else(|_| "http://127.0.0.1:54321".to_string());
    let supabase_key = std::env::var("SUPABASE_ANON_KEY")
        .unwrap_or_else(|_| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0".to_string());

    let client = reqwest::Client::new();

    let response = client
        .post(format!("{}/rest/v1/rpc/upsert_theme_usage", supabase_url))
        .header("apikey", supabase_key.clone())
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .json(&json!({
            "p_theme_name": theme_name,
            "p_city": city,
            "p_country": country,
            "p_weather_code": weather_code
        }))
        .send()
        .await
        .map_err(|e| {
            error!("HTTP request failed: {}", e);
            format!("HTTP error: {}", e)
        })?;

    if response.status().is_success() {
        info!("Theme change reported successfully");
        Ok(())
    } else {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        error!("Supabase API error: {} - {}", status, error_text);
        Err(format!("API error: {} - {}", status, error_text))
    }
}

#[tauri::command]
pub async fn report_activity(
    city: String,
    country: String,
    latitude: f64,
    longitude: f64,
) -> Result<(), String> {
    info!("Reporting activity: {}", city);

    let supabase_url =
        std::env::var("SUPABASE_URL").unwrap_or_else(|_| "http://127.0.0.1:54321".to_string());
    let supabase_key = std::env::var("SUPABASE_ANON_KEY")
        .unwrap_or_else(|_| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0".to_string());

    let hour = chrono::Utc::now().hour() as i32;

    let client = reqwest::Client::new();

    let response = client
        .post(format!("{}/rest/v1/rpc/upsert_activity_heatmap", supabase_url))
        .header("apikey", supabase_key.clone())
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .json(&json!({
            "p_city": city,
            "p_country": country,
            "p_latitude": latitude,
            "p_longitude": longitude,
            "p_hour": hour
        }))
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    if response.status().is_success() {
        info!("Activity reported successfully");
        Ok(())
    } else {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        error!("Supabase API error: {} - {}", status, error_text);
        Err(format!("API error: {} - {}", status, error_text))
    }
}
```

### 4. theme_manager.rs

**Location**: `src-tauri/src/theme_manager.rs`

```rust
use std::env;
use std::fs;

#[tauri::command]
pub fn apply_theme(
    theme_name: String,
    ide: Option<String>,
    terminal: Option<String>,
) -> Result<(), String> {
    if let Some(ide_name) = ide {
        apply_ide_theme(&theme_name, &ide_name)?;
    }

    if let Some(terminal_name) = terminal {
        apply_terminal_theme(&theme_name, &terminal_name)?;
    }

    Ok(())
}

fn apply_ide_theme(theme_name: &str, ide: &str) -> Result<(), String> {
    let theme_content = match (ide, theme_name) {
        ("vscode", "daylight-survivor") => include_str!("../themes/vscode/daylight-survivor.json"),
        ("vscode", "rainy-cemetery") => include_str!("../themes/vscode/rainy-cemetery.json"),
        ("vscode", "frankenstein-lab") => include_str!("../themes/vscode/frankenstein-lab.json"),
        ("vscode", "silent-hill") => include_str!("../themes/vscode/silent-hill.json"),
        ("vscode", "vampire-night") => include_str!("../themes/vscode/vampire-night.json"),
        ("vscode", "frozen-dead") => include_str!("../themes/vscode/frozen-dead.json"),
        ("kiro", "daylight-survivor") => include_str!("../themes/kiro/daylight-survivor.json"),
        ("kiro", "rainy-cemetery") => include_str!("../themes/kiro/rainy-cemetery.json"),
        ("kiro", "frankenstein-lab") => include_str!("../themes/kiro/frankenstein-lab.json"),
        ("kiro", "silent-hill") => include_str!("../themes/kiro/silent-hill.json"),
        ("kiro", "vampire-night") => include_str!("../themes/kiro/vampire-night.json"),
        ("kiro", "frozen-dead") => include_str!("../themes/kiro/frozen-dead.json"),
        _ => return Err(format!("Theme not found: {} for {}", theme_name, ide)),
    };

    let home = env::var("HOME").map_err(|_| "HOME not set")?;
    let config_path = match ide {
        "vscode" => format!("{}/.vscode/settings.json", home),
        "kiro" => format!("{}/.kiro/settings/settings.json", home),
        _ => return Err(format!("Unsupported IDE: {}", ide)),
    };

    let settings_str = fs::read_to_string(&config_path).unwrap_or_else(|_| "{}".to_string());
    let mut settings: serde_json::Value = serde_json::from_str(&settings_str)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;

    let theme: serde_json::Value =
        serde_json::from_str(theme_content).map_err(|e| format!("Failed to parse theme: {}", e))?;

    settings["workbench.colorTheme"] = serde_json::json!(theme["name"]);

    fs::write(
        &config_path,
        serde_json::to_string_pretty(&settings).unwrap(),
    )
    .map_err(|e| format!("Failed to write settings: {}", e))?;

    Ok(())
}

fn apply_terminal_theme(theme_name: &str, terminal: &str) -> Result<(), String> {
    let theme_content = match (terminal, theme_name) {
        ("iterm2", "daylight-survivor") => include_str!("../themes/iterm2/daylight-survivor.json"),
        ("iterm2", "rainy-cemetery") => include_str!("../themes/iterm2/rainy-cemetery.json"),
        ("iterm2", "frankenstein-lab") => include_str!("../themes/iterm2/frankenstein-lab.json"),
        ("iterm2", "silent-hill") => include_str!("../themes/iterm2/silent-hill.json"),
        ("iterm2", "vampire-night") => include_str!("../themes/iterm2/vampire-night.json"),
        ("iterm2", "frozen-dead") => include_str!("../themes/iterm2/frozen-dead.json"),
        ("warp", "daylight-survivor") => include_str!("../themes/warp/daylight-survivor.yaml"),
        ("warp", "rainy-cemetery") => include_str!("../themes/warp/rainy-cemetery.yaml"),
        ("warp", "frankenstein-lab") => include_str!("../themes/warp/frankenstein-lab.yaml"),
        ("warp", "silent-hill") => include_str!("../themes/warp/silent-hill.yaml"),
        ("warp", "vampire-night") => include_str!("../themes/warp/vampire-night.yaml"),
        ("warp", "frozen-dead") => include_str!("../themes/warp/frozen-dead.yaml"),
        ("kitty", "daylight-survivor") => include_str!("../themes/kitty/daylight-survivor.conf"),
        ("kitty", "rainy-cemetery") => include_str!("../themes/kitty/rainy-cemetery.conf"),
        ("kitty", "frankenstein-lab") => include_str!("../themes/kitty/frankenstein-lab.conf"),
        ("kitty", "silent-hill") => include_str!("../themes/kitty/silent-hill.conf"),
        ("kitty", "vampire-night") => include_str!("../themes/kitty/vampire-night.conf"),
        ("kitty", "frozen-dead") => include_str!("../themes/kitty/frozen-dead.conf"),
        ("hyper", "daylight-survivor") => include_str!("../themes/hyper/daylight-survivor.js"),
        ("hyper", "rainy-cemetery") => include_str!("../themes/hyper/rainy-cemetery.js"),
        ("hyper", "frankenstein-lab") => include_str!("../themes/hyper/frankenstein-lab.js"),
        ("hyper", "silent-hill") => include_str!("../themes/hyper/silent-hill.js"),
        ("hyper", "vampire-night") => include_str!("../themes/hyper/vampire-night.js"),
        ("hyper", "frozen-dead") => include_str!("../themes/hyper/frozen-dead.js"),
        ("terminal", "daylight-survivor") => include_str!("../themes/terminal/daylight-survivor.terminal"),
        ("terminal", "rainy-cemetery") => include_str!("../themes/terminal/rainy-cemetery.terminal"),
        ("terminal", "frankenstein-lab") => include_str!("../themes/terminal/frankenstein-lab.terminal"),
        ("terminal", "silent-hill") => include_str!("../themes/terminal/silent-hill.terminal"),
        ("terminal", "vampire-night") => include_str!("../themes/terminal/vampire-night.terminal"),
        ("terminal", "frozen-dead") => include_str!("../themes/terminal/frozen-dead.terminal"),
        _ => return Err(format!("Theme not found: {} for {}", theme_name, terminal)),
    };

    let home = env::var("HOME").map_err(|_| "HOME not set")?;
    let config_path = match terminal {
        "iterm2" => format!("{}/Library/Application Support/iTerm2/DynamicProfiles/sit-or-live.json", home),
        "warp" => format!("{}/.warp/themes/sit-or-live.yaml", home),
        "kitty" => format!("{}/.config/kitty/sit-or-live.conf", home),
        "hyper" => format!("{}/.hyper_plugins/local/sit-or-live.js", home),
        "terminal" => format!("{}/Library/Preferences/sit-or-live.terminal", home),
        _ => return Err(format!("Unsupported terminal: {}", terminal)),
    };

    if let Some(parent) = std::path::Path::new(&config_path).parent() {
        fs::create_dir_all(parent).ok();
    }

    fs::write(&config_path, theme_content).map_err(|e| format!("Failed to write theme: {}", e))?;

    Ok(())
}
```

## Verification

```bash
# Build Rust backend
cd src-tauri
cargo build

# Expected: target/debug/sit-or-live binary created

# Run tests
cargo test

# Check for warnings
cargo clippy

# Expected: No errors or warnings
```

## Next Steps

Proceed to `12_THEME_SYSTEM.md` for theme generation details.
