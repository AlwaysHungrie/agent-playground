use clap::Parser;
use std::path::PathBuf;
use std::collections::HashMap;
use hyper::Uri;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Config {
    #[arg(long)]
    pub url: String,

    #[arg(long)]
    pub request_json: String,

    #[arg(long)]
    pub headers: Option<String>,

    #[arg(long, default_value = "127.0.0.1")]
    pub notary_host: String,

    #[arg(long, default_value_t = 7047)]
    pub notary_port: u16,

    #[arg(long, default_value_t = false)]
    pub notary_tls: bool,

    #[arg(long, default_value_t = 1 << 12)]
    pub max_sent_data: usize,

    #[arg(long, default_value_t = 1 << 14)]
    pub max_recv_data: usize,

    #[arg(long, default_value = "test-user")]
    pub user_dir: PathBuf,

    #[arg(long, default_value = "output")]
    pub output_prefix: String,

    #[arg(long)]
    pub save_intermediate: bool,

    #[arg(long)]
    pub private_words: String,
}

impl Config {
    pub fn new() -> Self {
        let config = Config::parse();
        config
    }

    pub fn parse_headers(&self) -> Result<HashMap<String, String>, serde_json::Error> {
        match &self.headers {
            Some(headers_str) => serde_json::from_str(headers_str),
            None => Ok(HashMap::new()),
        }
    }

    pub fn get_server_domain(&self) -> String {
        let uri: Uri = self.url.parse().unwrap();
        let host = uri.host().unwrap_or("").to_string();
        host
    }
}
