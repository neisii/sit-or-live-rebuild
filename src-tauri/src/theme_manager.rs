use std::fs;
use std::path::PathBuf;

pub fn get_theme_content(theme_name: &str, platform: &str) -> Option<String> {
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
        "iterm2" => {
            match theme_name {
                "Daylight Survivor" => Some(include_str!("../themes/iterm2/daylight-survivor.json").to_string()),
                "Vampire Night" => Some(include_str!("../themes/iterm2/vampire-night.json").to_string()),
                "Silent Hill" => Some(include_str!("../themes/iterm2/silent-hill.json").to_string()),
                "Rainy Cemetery" => Some(include_str!("../themes/iterm2/rainy-cemetery.json").to_string()),
                "Frozen Dead" => Some(include_str!("../themes/iterm2/frozen-dead.json").to_string()),
                "Frankenstein Lab" => Some(include_str!("../themes/iterm2/frankenstein-lab.json").to_string()),
                _ => None,
            }
        }
        "warp" => {
            match theme_name {
                "Daylight Survivor" => Some(include_str!("../themes/warp/daylight-survivor.yaml").to_string()),
                "Vampire Night" => Some(include_str!("../themes/warp/vampire-night.yaml").to_string()),
                "Silent Hill" => Some(include_str!("../themes/warp/silent-hill.yaml").to_string()),
                "Rainy Cemetery" => Some(include_str!("../themes/warp/rainy-cemetery.yaml").to_string()),
                "Frozen Dead" => Some(include_str!("../themes/warp/frozen-dead.yaml").to_string()),
                "Frankenstein Lab" => Some(include_str!("../themes/warp/frankenstein-lab.yaml").to_string()),
                _ => None,
            }
        }
        "kitty" => {
            match theme_name {
                "Daylight Survivor" => Some(include_str!("../themes/kitty/daylight-survivor.conf").to_string()),
                "Vampire Night" => Some(include_str!("../themes/kitty/vampire-night.conf").to_string()),
                "Silent Hill" => Some(include_str!("../themes/kitty/silent-hill.conf").to_string()),
                "Rainy Cemetery" => Some(include_str!("../themes/kitty/rainy-cemetery.conf").to_string()),
                "Frozen Dead" => Some(include_str!("../themes/kitty/frozen-dead.conf").to_string()),
                "Frankenstein Lab" => Some(include_str!("../themes/kitty/frankenstein-lab.conf").to_string()),
                _ => None,
            }
        }
        "hyper" => {
            match theme_name {
                "Daylight Survivor" => Some(include_str!("../themes/hyper/daylight-survivor.js").to_string()),
                "Vampire Night" => Some(include_str!("../themes/hyper/vampire-night.js").to_string()),
                "Silent Hill" => Some(include_str!("../themes/hyper/silent-hill.js").to_string()),
                "Rainy Cemetery" => Some(include_str!("../themes/hyper/rainy-cemetery.js").to_string()),
                "Frozen Dead" => Some(include_str!("../themes/hyper/frozen-dead.js").to_string()),
                "Frankenstein Lab" => Some(include_str!("../themes/hyper/frankenstein-lab.js").to_string()),
                _ => None,
            }
        }
        "terminal" => {
            match theme_name {
                "Daylight Survivor" => Some(include_str!("../themes/terminal/daylight-survivor.terminal").to_string()),
                "Vampire Night" => Some(include_str!("../themes/terminal/vampire-night.terminal").to_string()),
                "Silent Hill" => Some(include_str!("../themes/terminal/silent-hill.terminal").to_string()),
                "Rainy Cemetery" => Some(include_str!("../themes/terminal/rainy-cemetery.terminal").to_string()),
                "Frozen Dead" => Some(include_str!("../themes/terminal/frozen-dead.terminal").to_string()),
                "Frankenstein Lab" => Some(include_str!("../themes/terminal/frankenstein-lab.terminal").to_string()),
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
        "iterm2" => {
            #[cfg(target_os = "macos")]
            return Some(home.join("Library/Application Support/iTerm2/DynamicProfiles/sit-or-live.json"));
            
            #[cfg(not(target_os = "macos"))]
            return None;
        }
        "warp" => {
            return Some(home.join(".warp/themes/sit-or-live.yaml"));
        }
        "kitty" => {
            #[cfg(target_os = "macos")]
            return Some(home.join(".config/kitty/sit-or-live.conf"));
            
            #[cfg(target_os = "linux")]
            return Some(home.join(".config/kitty/sit-or-live.conf"));
            
            #[cfg(target_os = "windows")]
            return Some(home.join("AppData/Roaming/kitty/sit-or-live.conf"));
        }
        "hyper" => {
            return Some(home.join(".hyper.js"));
        }
        "terminal" => {
            #[cfg(target_os = "macos")]
            return Some(home.join("Library/Preferences/com.apple.Terminal.plist"));
            
            #[cfg(not(target_os = "macos"))]
            return None;
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

    let theme_content = get_theme_content(theme_name, terminal)
        .ok_or_else(|| format!("Theme not found: {} for {}", theme_name, terminal))?;

    let settings_path = get_settings_path(terminal)
        .ok_or_else(|| format!("Settings path not found for {}", terminal))?;

    // Ensure directory exists
    if let Some(parent) = settings_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }

    // Write theme file
    fs::write(&settings_path, theme_content)
        .map_err(|e| format!("Failed to write theme file: {}", e))?;

    println!("✅ Applied theme {} to {} at {:?}", theme_name, terminal, settings_path);

    Ok(())
}
