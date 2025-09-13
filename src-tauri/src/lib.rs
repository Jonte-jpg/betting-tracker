#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Enable devtools only in debug AND when env flag set (opt-in)
      #[cfg(debug_assertions)]
      {
        if std::env::var("BETTINGTRACKER_DEVTOOLS").as_deref() == Ok("1") {
          if let Some(window) = app.get_window("main") {
            window.open_devtools();
            println!("[tauri] DevTools opened (BETTINGTRACKER_DEVTOOLS=1)");
          }
        } else {
          println!("[tauri] DevTools disabled (set BETTINGTRACKER_DEVTOOLS=1 to enable)");
        }
      }

      // Logging plugin only in debug
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
