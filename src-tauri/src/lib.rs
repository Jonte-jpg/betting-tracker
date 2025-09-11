#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Enable debug tools in development
      #[cfg(debug_assertions)]
      {
        if let Some(window) = app.get_window("main") {
          // Open DevTools temporarily to help debug
          window.open_devtools();
        }
      }
      
      // Always log for debugging
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
