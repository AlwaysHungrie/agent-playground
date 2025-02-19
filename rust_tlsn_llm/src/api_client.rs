// api_client.rs
use hyper::{Request, Method, body::Bytes, Uri};
use http_body_util::Full;
use serde_json::Value;
use std::collections::HashMap;

use crate::config::Config;

pub struct ApiClient {
    url: String,
    headers: HashMap<String, String>,
    host: String,
}

impl ApiClient {
    pub fn new(config: &Config) -> Self {
        Self {
            url: config.url.clone(),
            headers: config.parse_headers().unwrap(),
            host: config.get_server_domain(),
        }
    }

    pub fn build_request(&self, request_json: &str) -> Result<Request<Full<Bytes>>, Box<dyn std::error::Error>> {
        let mut builder = Request::builder()
            .uri(&self.url)
            .method(Method::POST)
            .header("Accept", "*/*")
            .header("Accept-Language", "en-US,en;q=0.5")
            .header("Accept-Encoding", "identity")
            .header("Content-Type", "application/json")
            .header("Connection", "close")
            .header("Host", &self.host);

        // Add custom headers
        for (key, value) in &self.headers {
            builder = builder.header(key, value);
        }

        let request = builder.body(Full::new(Bytes::from(request_json.to_string())))?;
        Ok(request)
    }
}

