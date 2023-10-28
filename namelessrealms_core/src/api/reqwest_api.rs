use serde::de::DeserializeOwned;

#[tokio::main]
pub async fn request_json<T>(url: &str) -> Result<T, Box<dyn std::error::Error>> where T: DeserializeOwned {

    let reqwest = reqwest::get(url).await?;

    if reqwest.status().is_success() {
        Ok(reqwest.json::<T>().await?)
    } else {
        Err("request failed.".into())
    }
}