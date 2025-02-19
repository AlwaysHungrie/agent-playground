// storage.rs
use aws_sdk_s3::{Client, config::Region, primitives::ByteStream};
use aws_config::meta::region::RegionProviderChain;
use std::path::PathBuf;
use tlsn_core::presentation::Presentation;

pub struct StorageService {
    bucket_name: String,
    region: String,
}

impl StorageService {
    pub fn new(bucket_name: &str, region: &str) -> Self {
        Self {
            bucket_name: bucket_name.to_string(),
            region: region.to_string(),
        }
    }

    pub async fn upload_presentation(
        &self,
        presentation: &Presentation,
        user_dir: &PathBuf,
        key_prefix: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let serialized_data = bincode::serialize(&presentation)?;
        
        let region_provider = RegionProviderChain::first_try(Region::new(self.region.clone()))
            .or_default_provider()
            .or_else(Region::new("ap-south-1"));

        let config = aws_config::from_env()
            .credentials_provider(get_aws_credentials().await?)
            .region(region_provider)
            .load()
            .await;

        let client = Client::new(&config);
        let key = format!("{}/{}.presentation.tlsn", 
            user_dir.as_path().to_str().unwrap(), 
            key_prefix
        );

        client
            .put_object()
            .bucket(&self.bucket_name)
            .key(&key)
            .body(ByteStream::from(serialized_data))
            .send()
            .await?;

        Ok(format!("s3://{}/{}", self.bucket_name, key))
    }
}

async fn get_aws_credentials() -> Result<aws_sdk_s3::config::Credentials, Box<dyn std::error::Error>> {
    dotenv::dotenv()?;

    let access_key = std::env::var("AWS_ACCESS_KEY_ID")?;
    let secret_key = std::env::var("AWS_SECRET_ACCESS_KEY")?;

    Ok(aws_sdk_s3::config::Credentials::new(
        access_key,
        secret_key,
        None,
        None,
        "EnvironmentVariableCredentialsProvider",
    ))
}