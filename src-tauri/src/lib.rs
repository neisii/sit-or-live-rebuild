use std::process::Command;
use log::info;

mod theme_manager;
mod analytics;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env file if it exists
    if let Err(e) = dotenv::dotenv() {
        info!("dotenv: {:?} (using default local Supabase)", e);
    } else {
        info!("dotenv: loaded .env file successfully");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
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
        .invoke_handler(tauri::generate_handler![
            get_idle_time,
            set_dark_mode,
            get_dark_mode,
            apply_theme,
            set_always_on_top,
            open_log_directory,
            analytics::report_theme_change,
            analytics::report_activity
        ])
        .setup(|_app| {
            info!("Sit or Live app started");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_idle_time() -> Result<u64, String> {
    #[cfg(target_os = "macos")]
    {
        // Use ioreg to get HIDIdleTime on macOS
        let output = Command::new("ioreg")
            .args(&["-c", "IOHIDSystem"])
            .output()
            .map_err(|e| format!("Failed to execute ioreg: {}", e))?;

        let output_str = String::from_utf8_lossy(&output.stdout);
        
        // Parse HIDIdleTime from output
        for line in output_str.lines() {
            if line.contains("HIDIdleTime") {
                // Extract the number (in nanoseconds)
                let parts: Vec<&str> = line.split('=').collect();
                if parts.len() >= 2 {
                    let ns_str = parts[1].trim();
                    if let Ok(ns) = ns_str.parse::<u64>() {
                        // Convert nanoseconds to seconds
                        return Ok(ns / 1_000_000_000);
                    }
                }
            }
        }
        
        Ok(0)
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        // On other platforms, return 0 (not implemented)
        Ok(0)
    }
}

#[tauri::command]
fn set_dark_mode(enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let mode = if enabled { "Dark" } else { "Light" };
        let script = format!(
            "tell application \"System Events\" to tell appearance preferences to set dark mode to {}",
            enabled
        );
        
        let output = Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .output()
            .map_err(|e| format!("Failed to execute osascript: {}", e))?;

        if !output.status.success() {
            return Err(format!("Failed to set dark mode: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        println!("Dark mode set to: {}", mode);
        Ok(())
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        // On other platforms, do nothing
        let _ = enabled; // Suppress unused variable warning
        println!("Dark mode not supported on this platform");
        Ok(())
    }
}

#[tauri::command]
fn get_dark_mode() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("defaults")
            .args(&["read", "-g", "AppleInterfaceStyle"])
            .output()
            .map_err(|e| format!("Failed to execute defaults: {}", e))?;

        // If the command succeeds and returns "Dark", dark mode is enabled
        let output_str = String::from_utf8_lossy(&output.stdout);
        Ok(output_str.trim() == "Dark")
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok(false)
    }
}

#[tauri::command]
fn apply_theme(theme_name: String, ide: String, terminal: String) -> Result<(), String> {
    println!("Applying theme: {} to IDE: {}, Terminal: {}", theme_name, ide, terminal);
    
    // Apply to IDE
    if !ide.is_empty() {
        theme_manager::apply_theme_to_ide(&theme_name, &ide)?;
    }
    
    // Apply to terminal
    if !terminal.is_empty() {
        theme_manager::apply_theme_to_terminal(&theme_name, &terminal)?;
    }
    
    Ok(())
}

#[tauri::command]
fn set_always_on_top(window: tauri::Window, enabled: bool) -> Result<(), String> {
    window.set_always_on_top(enabled)
        .map_err(|e| format!("Failed to set always on top: {}", e))?;
    
    info!("Always on top set to: {}", enabled);
    Ok(())
}

#[tauri::command]
fn open_log_directory() -> Result<String, String> {
    let log_dir = dirs::home_dir()
        .ok_or("Failed to get home directory")?
        .join(".sit-or-live")
        .join("logs");
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&log_dir)
            .spawn()
            .map_err(|e| format!("Failed to open log directory: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&log_dir)
            .spawn()
            .map_err(|e| format!("Failed to open log directory: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&log_dir)
            .spawn()
            .map_err(|e| format!("Failed to open log directory: {}", e))?;
    }
    
    Ok(log_dir.to_string_lossy().to_string())
}
