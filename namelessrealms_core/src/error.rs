use tracing_error::InstrumentError;

#[derive(Debug, thiserror::Error)]
pub enum ErrorKind {

    #[error("Error fetching URL: {0}")]
    FetchError(#[from] reqwest::Error),

    #[error("Fetching serialization error (JSON): {0}")]
    FetchJSONError(#[from] serde_json::Error),

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