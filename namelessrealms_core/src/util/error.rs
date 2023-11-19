use tracing_error::InstrumentError;

#[derive(Debug, thiserror::Error)]
pub enum ErrorKind {

    #[error("Error fetching URL: {0}")]
    FetchError(#[from] reqwest::Error),

    #[error("Serialization error (JSON): {0}")]
    JSONError(#[from] serde_json::Error),

    #[error("File SHA-1 hash does not match, expected: {0}")]
    FileSHA1Error(String),

    #[error("File Download error, expected: {0}")]
    DownloadFileError(String),

    #[error("Files Download error, failure: {0}")]
    DownloadFilesError(usize),

    #[error("I/O (std) error: {0}")]
    StdIOError(#[from] std::io::Error),

    #[error("Create file error, expected: {0}")]
    CreateFileIOError(String),

    #[error("Run future error: {0}")]
    FutureError(#[from] tokio::task::JoinError),

    #[error("Error launching Minecraft: {0}")]
    LauncherError(String),

    #[error("I/O error: {0}")]
    IOError(#[from] super::io::IOError),
}

#[derive(Debug)]
pub struct Error {
    source: tracing_error::TracedError<ErrorKind>,
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.source.source()
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, fmt: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(fmt, "{}", self.source)
    }
}

impl<E: Into<ErrorKind>> From<E> for Error {
    fn from(source: E) -> Self {
        Self {
            source: Into::<ErrorKind>::into(source).in_current_span(),
        }
    }
}

impl ErrorKind {
    pub fn as_error(self) -> Error {
        self.into()
    }
}

pub type Result<T> = core::result::Result<T, Error>;