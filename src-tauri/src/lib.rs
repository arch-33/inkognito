mod commands;
mod db;
mod models;
mod settings_commands;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

/// Show the main window and restore it in the app switcher (Cmd+Tab / Alt+Tab).
fn show_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        #[cfg(target_os = "macos")]
        let _ = app.set_activation_policy(tauri::ActivationPolicy::Regular);

        #[cfg(not(target_os = "macos"))]
        let _ = window.set_skip_taskbar(false);

        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

/// Hide the main window and remove it from the app switcher (Cmd+Tab / Alt+Tab).
fn hide_window(window: &tauri::Window) {
    let _ = window.hide();

    #[cfg(target_os = "macos")]
    let _ = window.app_handle().set_activation_policy(tauri::ActivationPolicy::Accessory);

    #[cfg(not(target_os = "macos"))]
    let _ = window.set_skip_taskbar(true);
}

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
            // Database
            let db_path = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir")
                .join("inkognito.db");
            let database = db::init_db(&db_path).expect("failed to initialize database");
            app.manage(database);

            // System tray
            let show = MenuItem::with_id(app, "show", "Show Inkognito", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .icon(tauri::image::Image::from_bytes(
                    include_bytes!("../icons/tray-icon.png"),
                )?)
                .tooltip("Inkognito")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { .. } = event {
                        show_window(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                hide_window(window);
            }
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
