use tracing_appender::non_blocking::WorkerGuard;

#[cfg(debug_assertions)]
pub fn init_logger() -> Option<WorkerGuard> {

    use tracing_subscriber::prelude::*;

    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| {
            tracing_subscriber::EnvFilter::new("namelessrealms_core=debug,namelessrealms_gui=debug")
        });

    let subscriber = tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(filter)
        .with(tracing_error::ErrorLayer::default());

    tracing::subscriber::set_global_default(subscriber)
        .expect("Setting default subscriber failed.");

    None
}

#[cfg(not(debug_assertions))]
pub fn init_logger() -> Option<WorkerGuard> {

    use crate::global_path;
    use tracing_subscriber::prelude::*;

    // Initialize and get logs directory path
    let logs_dir = global_path::get_logs_dir_path();

    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| {
            tracing_subscriber::EnvFilter::new("namelessrealms_core=info")
        });

    let file_appender = tracing_appender::rolling::daily(logs_dir, "namelessrealms_core.log");
    let (non_blocking_appender, guard) = tracing_appender::non_blocking(file_appender);

    let subscriber = tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer()
                .with_writer(non_blocking_appender)
                .with_ansi(false))
        .with(filter)
        .with(tracing_error::ErrorLayer::default());

    tracing::subscriber::set_global_default(subscriber)
        .expect("Setting default subscriber failed.");
    
    Some(guard)
}