use std::path::Path;

use serde::{Serialize, de::DeserializeOwned};
use tokio::{fs::File, io::AsyncWriteExt};

#[derive(Debug, thiserror::Error)]
pub enum IOError {

    #[error("{source}, path: {path}")]
    IOPathError {
        #[source]
        source: std::io::Error,
        path: String,
    },

    #[error(transparent)]
    IOError(#[from] std::io::Error),
}

impl IOError {

    pub fn from(source: std::io::Error) -> Self {
        Self::IOError(source)
    }

    pub fn with_path(source: std::io::Error, path: impl AsRef<std::path::Path>) -> Self {
        let path = path.as_ref();
        Self::IOPathError {
            source,
            path: path.to_string_lossy().to_string(),
        }
    }
}

#[tracing::instrument(skip(struct_objects, path))]
pub async fn write_struct_file<T>(path: &Path, struct_objects: &T) -> crate::Result<()> where T: ?Sized + Serialize {
    let bytes = serde_json::to_vec(struct_objects).map_err(|e| IOError::with_path(e.into(), path))?;
    self::write_file(&path, &bytes).await?;
    Ok(())
}

#[tracing::instrument(skip(bytes, path))]
pub async fn write_file(path: &Path, bytes: &[u8]) -> crate::Result<()> {

    // create all dir 
    if let Some(parent) = path.parent() {
        self::create_dir_all(parent).await?;
    }

    let mut file = File::create(path).await.map_err(|e| IOError::with_path(e, path))?;
    file.write_all(bytes).await.map_err(|e| IOError::with_path(e, path))?;

    tracing::debug!("Done writing file: {}", path.display());

    Ok(())
}

#[tracing::instrument(skip(path))]
pub async fn read_json_file<T>(path: &Path) -> crate::Result<T> where T: DeserializeOwned {
    let json = self::read(path).await?;
    let json = serde_json::from_slice::<T>(&json)?;
    tracing::debug!("Done reading file: {}", path.display());
    Ok(json)
}

#[tracing::instrument]
pub fn is_path_exists(path: &Path) -> bool {
    match Path::try_exists(path) {
        Ok(value) => value,
        Err(_) => false
    }
}

pub async fn create_dir_all(path: impl AsRef<std::path::Path>) -> Result<(), IOError> {
    let path = path.as_ref();
    tokio::fs::create_dir_all(path).await.map_err(|e| IOError::IOPathError {
            source: e,
            path: path.to_string_lossy().to_string(),
    })
}

pub async fn read(path: impl AsRef<std::path::Path>) -> Result<Vec<u8>, IOError> {
    let path = path.as_ref();
    tokio::fs::read(path).await.map_err(|e| IOError::IOPathError {
            source: e,
            path: path.to_string_lossy().to_string(),
    })
}

// pub async fn write(path: impl AsRef<std::path::Path>, data: impl AsRef<[u8]>) -> Result<(), IOError> {
//     let path = path.as_ref();
//     tokio::fs::write(path, data).await.map_err(|e| IOError::IOPathError {
//             source: e,
//             path: path.to_string_lossy().to_string(),
//     })
// }