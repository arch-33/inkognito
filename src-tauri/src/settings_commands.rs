use tauri::State;

use crate::db::Db;

const SETTINGS_KEY: &str = "app_settings";

#[tauri::command]
pub fn get_settings(db: State<Db>) -> Result<serde_json::Value, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let result: Result<String, _> = conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        [SETTINGS_KEY],
        |row| row.get(0),
    );
    match result {
        Ok(json_str) => serde_json::from_str(&json_str).map_err(|e| e.to_string()),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(default_settings()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn save_settings(db: State<Db>, settings: serde_json::Value) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let json_str = serde_json::to_string(&settings).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        rusqlite::params![SETTINGS_KEY, json_str],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_setting(db: State<Db>, key: String) -> Result<serde_json::Value, String> {
    let data = get_settings_inner(&db)?;
    let mut current = &data;
    for part in key.split('.') {
        current = current
            .get(part)
            .ok_or_else(|| format!("setting not found: {}", key))?;
    }
    Ok(current.clone())
}

#[tauri::command]
pub fn save_setting(db: State<Db>, key: String, value: serde_json::Value) -> Result<(), String> {
    let mut data = get_settings_inner(&db)?;
    let parts: Vec<&str> = key.split('.').collect();
    let mut current = &mut data;
    for &part in &parts[..parts.len() - 1] {
        current = current
            .get_mut(part)
            .ok_or_else(|| format!("setting path not found: {}", key))?;
    }
    if let Some(last) = parts.last() {
        current[*last] = value;
    }
    // Write back
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let json_str = serde_json::to_string(&data).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        rusqlite::params![SETTINGS_KEY, json_str],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Internal helper to load settings (reuses Db state without State wrapper)
fn get_settings_inner(db: &State<Db>) -> Result<serde_json::Value, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let result: Result<String, _> = conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        [SETTINGS_KEY],
        |row| row.get(0),
    );
    match result {
        Ok(json_str) => serde_json::from_str(&json_str).map_err(|e| e.to_string()),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(default_settings()),
        Err(e) => Err(e.to_string()),
    }
}

pub fn default_settings() -> serde_json::Value {
    serde_json::json!({
        "general": {
            "launchAtLogin": true,
            "alwaysOnTop": true,
            "weekStartsOn": 1,
            "defaultNoteDate": "today"
        },
        "appearance": {
            "theme": "system",
            "editorFont": "Berkeley Mono",
            "fontSize": 13,
            "windowOpacity": 95
        },
        "privacy": {
            "contentProtection": true,
            "showProtectedBadge": true,
            "autoProtectOnMinimize": false
        },
        "editor": {
            "spellCheck": false,
            "lineNumbers": false,
            "fontLigatures": true,
            "lineWrap": true,
            "autoSaveInterval": 5
        },
        "shortcuts": {
            "toggleProtection": "meta+shift+h",
            "toggleFloat": "meta+shift+f",
            "toggleSidebar": "meta+b",
            "toggleSettings": "meta+,",
            "toggleEditorMode": "meta+shift+e"
        },
        "sync": {
            "enabled": false
        }
    })
}
