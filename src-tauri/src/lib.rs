use tauri::Manager;
use std::process::Command;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_idle_time,
            set_dark_mode,
            get_dark_mode,
            apply_theme
        ])
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
    
    // Placeholder - in full implementation, this would:
    // 1. Load theme file from embedded resources
    // 2. Write to appropriate config file based on IDE/terminal
    // 3. Handle platform-specific paths
    
    // For now, just log
    if !ide.is_empty() {
        println!("Would apply {} theme to {} IDE", theme_name, ide);
    }
    
    if !terminal.is_empty() {
        println!("Would apply {} theme to {} terminal", theme_name, terminal);
    }
    
    Ok(())
}
