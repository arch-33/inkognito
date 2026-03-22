mod commands;
mod db;
mod models;
mod settings_commands;

#[tauri::command]
fn set_content_protection(window: tauri::Window, enabled: bool) -> Result<(), String> {
    window.set_content_protected(enabled).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            use tauri::Manager;
            let db_path = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir")
                .join("inkognito.db");
            let database = db::init_db(&db_path).expect("failed to initialize database");
            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_content_protection,
            // Notes
            commands::get_all_notes,
            commands::list_notes,
            commands::get_note,
            commands::get_note_content,
            commands::create_note,
            commands::save_note_content,
            commands::delete_note,
            commands::toggle_favorite,
            // Tags
            commands::list_tags,
            commands::create_tag,
            commands::delete_tag,
            commands::add_tag_to_note,
            commands::remove_tag_from_note,
            // Search
            commands::search_notes,
            // Settings
            settings_commands::get_settings,
            settings_commands::save_settings,
            settings_commands::get_setting,
            settings_commands::save_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
