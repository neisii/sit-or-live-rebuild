use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_idle_time,
            set_dark_mode,
            get_dark_mode
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_idle_time() -> Result<u64, String> {
    // Placeholder - returns 0 for now
    // Full implementation would use platform-specific APIs
    Ok(0)
}

#[tauri::command]
fn set_dark_mode(_enabled: bool) -> Result<(), String> {
    // Placeholder - does nothing for now
    // Full implementation would use AppleScript on macOS
    Ok(())
}

#[tauri::command]
fn get_dark_mode() -> Result<bool, String> {
    // Placeholder - returns false for now
    Ok(false)
}
