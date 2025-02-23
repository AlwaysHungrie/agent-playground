// api_client.rs
use hyper::{Request, Method, body::Bytes, Uri};
use http_body_util::Full;
use serde_json::Value;
use std::collections::HashMap;

use crate::config::Config;

fn unescape_shell_string(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    
    while let Some(c) = chars.next() {
        if c == '\\' {
            if let Some(&next) = chars.peek() {
                // Skip the escape character and add the literal character
                chars.next();
                result.push(next);
            }
        } else {
            result.push(c);
        }
    }
    result
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

        let unescaped = unescape_shell_string(&request_json);
        println!("Request JSON: {:?}", unescaped);
        let parsed_json: serde_json::Value = serde_json::from_str(&unescaped)?;
        println!("Parsed JSON: {:?}", parsed_json);
        let request = builder.body(Full::new(Bytes::from(serde_json::to_string(&parsed_json)?)))?;
        
        Ok(request)
        // let request = builder.body(Full::anew(Bytes::from(request_json.to_string())))?;
        // Ok(request)
    }
}

