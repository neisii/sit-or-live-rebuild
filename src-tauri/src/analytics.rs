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
