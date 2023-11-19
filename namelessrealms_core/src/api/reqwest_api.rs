use serde::de::DeserializeOwned;

#[tracing::instrument]
pub async fn request_json<T>(url: &str) -> crate::Result<T> where T: DeserializeOwned {
    tracing::debug!("Fetching URL: {}", url);
    let reqwest = reqwest::get(url).await?.error_for_status()?;
    let text = reqwest.text().await?;
    let json = serde_json::from_str::<T>(&text)?;
    Ok(json)
}