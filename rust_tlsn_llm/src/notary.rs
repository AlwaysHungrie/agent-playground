// notary.rs

use notary_client::{Accepted, NotarizationRequest, NotaryClient};
use tlsn_prover::{Prover, ProverConfig, state::Setup};
use tlsn_common::config::ProtocolConfig;
use tracing::debug;

use tokio_util::compat::TokioAsyncReadCompatExt;

use crate::config::Config;

pub struct NotaryService {
    host: String,
    server_name: String,
    port: u16,
    tls_enabled: bool,
    max_sent_data: usize,
    max_recv_data: usize,
}

impl NotaryService {
    pub fn new(config: &Config) -> Self {
        Self {
            host: config.notary_host.clone(),
            server_name: config.get_server_domain(),
            port: config.notary_port,
            tls_enabled: config.notary_tls,
            max_sent_data: config.max_sent_data,
            max_recv_data: config.max_recv_data,
        }
    }

    pub async fn setup_notary_session(&self) -> Result<(Prover<Setup>, String), Box<dyn std::error::Error>> {
        let notary_client = NotaryClient::builder()
            .host(self.host.as_str())
            .port(self.port)
            .enable_tls(self.tls_enabled)
            .build()?;

        let notarization_request = NotarizationRequest::builder()
            .max_sent_data(self.max_sent_data)
            .max_recv_data(self.max_recv_data)
            .build()?;

        let Accepted {
            io: notary_connection,
            id: session_id,
            ..
        } = notary_client.request_notarization(notarization_request).await?;

        debug!("Notary session ID: {}", session_id);

        let protocol_config = ProtocolConfig::builder()
            .max_sent_data(self.max_sent_data)
            .max_recv_data(self.max_recv_data)
            .build()?;

        let prover_config = ProverConfig::builder()
            .server_name(self.server_name.as_str())
            .protocol_config(protocol_config)
            .build()?;

        let prover = Prover::new(prover_config)
            .setup(notary_connection.compat())
            .await?;

        Ok((prover, session_id))
    }
}