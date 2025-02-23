// api_client.rs
use hyper::{Request, Method, body::Bytes, Uri};
use http_body_util::Full;
use std::collections::HashMap;
use base64::{decode, encode};

use crate::config::Config;
use tracing::debug;

fn base64_to_json(base64_str: &str) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    // Decode base64 to bytes
    let bytes = decode(base64_str)?;
    
    // Convert bytes to string
    let json_str = String::from_utf8(bytes)?;
    
    // Parse JSON string to Value
    let json_value = serde_json::from_str(&json_str)?;
    
    Ok(json_value)
}


// Then in your code:
// let unescaped = unescape_shell_string(&request_json);
// let parsed_json: serde_json::Value = serde_json::from_str(&unescaped)?;
// let request = builder.body(Full::new(Bytes::from(serde_json::to_string(&parsed_json)?)))?;


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

        let parsed_json = base64_to_json(request_json)?;
        debug!("Parsed JSON: {:?}", parsed_json);

        let request = builder.body(Full::new(Bytes::from(serde_json::to_string(&parsed_json)?)))?;
        
        Ok(request)
        // let request = builder.body(Full::anew(Bytes::from(request_json.to_string())))?;
        // Ok(request)
    }
}

