mod commands;
mod db;
mod models;
mod settings_commands;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    webview::WebviewWindowBuilder,
    Manager,
};

/// Show the main window and restore it in the app switcher (Cmd+Tab / Alt+Tab).
fn show_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        #[cfg(target_os = "macos")]
        if let Err(e) = app.set_activation_policy(tauri::ActivationPolicy::Regular) {
            eprintln!("Failed to set activation policy: {e}");
        }

        #[cfg(not(target_os = "macos"))]
        if let Err(e) = window.set_skip_taskbar(false) {
            eprintln!("Failed to restore taskbar: {e}");
        }

        if let Err(e) = window.show() {
            eprintln!("Failed to show window: {e}");
        }
        if let Err(e) = window.unminimize() {
            eprintln!("Failed to unminimize window: {e}");
        }
        if let Err(e) = window.set_focus() {
            eprintln!("Failed to focus window: {e}");
        }
    }
}

/// Hide the main window and remove it from the app switcher (Cmd+Tab / Alt+Tab).
fn hide_window(window: &tauri::Window) {
    if let Err(e) = window.hide() {
        eprintln!("Failed to hide window: {e}");
    }

    #[cfg(target_os = "macos")]
    if let Err(e) = window.app_handle().set_activation_policy(tauri::ActivationPolicy::Accessory) {
        eprintln!("Failed to set activation policy: {e}");
    }

    #[cfg(not(target_os = "macos"))]
    if let Err(e) = window.set_skip_taskbar(true) {
        eprintln!("Failed to skip taskbar: {e}");
    }
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
            let about = MenuItem::with_id(app, "about", "About", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &about, &sep, &quit])?;

            TrayIconBuilder::new()
                .icon(tauri::image::Image::from_bytes(
                    include_bytes!("../icons/tray-icon.png"),
                )?)
                .tooltip("Inkognito")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_window(app),
                    "about" => {
                        if let Some(window) = app.get_webview_window("about") {
                            if let Err(e) = window.show() {
                                eprintln!("Failed to show window: {e}");
                            }
                            if let Err(e) = window.set_focus() {
                                eprintln!("Failed to focus window: {e}");
                            }
                        } else if let Err(e) = WebviewWindowBuilder::new(
                            app,
                            "about",
                            tauri::WebviewUrl::App("index.html#/about".into()),
                        )
                        .title("About Inkognito")
                        .inner_size(360.0, 340.0)
                        .resizable(false)
                        .minimizable(false)
                        .maximizable(false)
                        .decorations(false)
                        .transparent(true)
                        .center()
                        .build()
                        {
                            eprintln!("Failed to create window: {e}");
                        }
                    }
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
                if window.label() == "main" {
                    api.prevent_close();
                    hide_window(window);
                }
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
