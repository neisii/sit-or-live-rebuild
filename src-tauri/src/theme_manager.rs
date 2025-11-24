use std::fs;
use std::path::PathBuf;

pub fn get_theme_content(theme_name: &str, platform: &str) -> Option<String> {
    let theme_file = format!("{}.json", theme_name.to_lowercase().replace(" ", "-"));
    
    match platform {
        "vscode" => {
            match theme_name {
                "Daylight Survivor" => Some(include_str!("../themes/vscode/daylight-survivor.json").to_string()),
                "Vampire Night" => Some(include_str!("../themes/vscode/vampire-night.json").to_string()),
                "Silent Hill" => Some(include_str!("../themes/vscode/silent-hill.json").to_string()),
                "Rainy Cemetery" => Some(include_str!("../themes/vscode/rainy-cemetery.json").to_string()),
                "Frozen Dead" => Some(include_str!("../themes/vscode/frozen-dead.json").to_string()),
                "Frankenstein Lab" => Some(include_str!("../themes/vscode/frankenstein-lab.json").to_string()),
                _ => None,
            }
        }
        "kiro" => {
            match theme_name {
                "Daylight Survivor" => Some(include_str!("../themes/kiro/daylight-survivor.json").to_string()),
                "Vampire Night" => Some(include_str!("../themes/kiro/vampire-night.json").to_string()),
                "Silent Hill" => Some(include_str!("../themes/kiro/silent-hill.json").to_string()),
                "Rainy Cemetery" => Some(include_str!("../themes/kiro/rainy-cemetery.json").to_string()),
                "Frozen Dead" => Some(include_str!("../themes/kiro/frozen-dead.json").to_string()),
                "Frankenstein Lab" => Some(include_str!("../themes/kiro/frankenstein-lab.json").to_string()),
                _ => None,
            }
        }
        _ => None,
    }
}

pub fn get_settings_path(platform: &str) -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    
    match platform {
        "vscode" => {
            #[cfg(target_os = "macos")]
            return Some(home.join("Library/Application Support/Code/User/settings.json"));
            
            #[cfg(target_os = "windows")]
            return Some(home.join("AppData/Roaming/Code/User/settings.json"));
            
            #[cfg(target_os = "linux")]
            return Some(home.join(".config/Code/User/settings.json"));
        }
        "kiro" => {
            return Some(home.join(".kiro/settings/settings.json"));
        }
        _ => None,
    }
}

pub fn apply_theme_to_ide(theme_name: &str, ide: &str) -> Result<(), String> {
    if ide.is_empty() {
        return Ok(());
    }

    let theme_content = get_theme_content(theme_name, ide)
        .ok_or_else(|| format!("Theme not found: {} for {}", theme_name, ide))?;

    let settings_path = get_settings_path(ide)
        .ok_or_else(|| format!("Settings path not found for {}", ide))?;

    // Ensure directory exists
    if let Some(parent) = settings_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }

    // For now, just log the theme application
    // In full implementation, this would merge with existing settings
    println!("Would apply theme {} to {} at {:?}", theme_name, ide, settings_path);
    println!("Theme content length: {} bytes", theme_content.len());

    Ok(())
}

pub fn apply_theme_to_terminal(theme_name: &str, terminal: &str) -> Result<(), String> {
    if terminal.is_empty() {
        return Ok(());
    }

    // Placeholder for terminal theme application
    println!("Would apply theme {} to {} terminal", theme_name, terminal);

    Ok(())
}
