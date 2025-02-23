// main.rs
mod config;
mod notary;
mod api_client;
mod storage;

use hyper::StatusCode;
use hyper_util::rt::TokioIo;
use tokio_util::compat::FuturesAsyncReadCompatExt;
use http_body_util::BodyExt;

use tracing::debug;
use tokio_util::compat::TokioAsyncReadCompatExt;

use config::Config;
use notary::NotaryService;
use api_client::ApiClient;
use storage::StorageService;

use utils::range::RangeSet;

use tlsn_prover::{state::Closed, Prover};
use tlsn_core::{presentation::Presentation, CryptoProvider};
use tlsn_core::{request::RequestConfig, transcript::TranscriptCommitConfig};


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::new();
    tracing_subscriber::fmt::init();

    debug!("Starting attested API calls...");

    // Setup notary service
    let notary_service = NotaryService::new(&config);
    let (prover, _session_id) = notary_service.setup_notary_session().await?;

    // Connect to server
    let client_socket = tokio::net::TcpStream::connect((config.get_server_domain().as_str(), 443)).await?;
    let (tls_connection, prover_fut) = prover.connect(client_socket.compat()).await?;
    let prover_task = tokio::spawn(prover_fut);

    // Setup API client
    // let api_client = ApiClient::new(&config);
    let (mut request_sender, connection) = hyper::client::conn::http1::handshake(
        TokioIo::new(tls_connection.compat())
    ).await?;

    tokio::spawn(connection);

    let api_client = ApiClient::new(&config);
    
    // Send request and get response
    let request = api_client.build_request(&config.request_json)?;
    let response = request_sender.send_request(request).await?;
    
    if response.status() != StatusCode::OK {
        return Err(format!("Request failed with status: {}", response.status()).into());
    }

    let payload = response.into_body().collect().await?.to_bytes();
    let parsed: serde_json::Value = serde_json::from_str(&String::from_utf8_lossy(&payload))?;
    
    // Process proof and generate presentation
    let prover = prover_task.await??;
    let presentation = generate_presentation(prover, &config).await?;

    // Upload to S3
    let storage = StorageService::new("tlsn-notary-test", "ap-south-1");
    let bucket_path = storage.upload_presentation(&presentation, &config.user_dir, &config.output_prefix).await?;

    // Prepare final response
    let response_json = serde_json::json!({
        "attestation_url": bucket_path,
        "llm_response": parsed,
    });

    println!("{}", serde_json::to_string(&response_json)?);
    Ok(())
}

async fn generate_presentation(prover: Prover<Closed>, config: &Config) -> Result<Presentation, Box<dyn std::error::Error>> {
    let mut prover = prover.start_notarize();
    
    // Get transcripts
    let sent_transcript = prover.transcript().sent();
    let recv_transcript = prover.transcript().received();

    // Set everything as public

    // println!("Sent transcript: {:?}", sent_transcript);
    // println!("Recv transcript: {:?}", recv_transcript);

    // let private_words_bytes = config.private_words.as_bytes();
    let private_words_bytes: Vec<Vec<u8>> = config.private_words
        .split(';')
        .map(|s| s.as_bytes().to_vec())
        .collect();

    // println!("Private words: {:?}", private_words_bytes);

    let private_word_refs: Vec<&[u8]> = private_words_bytes.iter()
        .map(|v| v.as_slice())
        .collect();

    let (sent_public_ranges, _) = find_ranges(&sent_transcript, &private_word_refs);
    let (recv_public_ranges, _) = find_ranges(&recv_transcript, &private_word_refs);

    // println!("Sent public ranges: {:?}", sent_public_ranges);
    // println!("Recv public ranges: {:?}", recv_public_ranges);

    // let sent_public_ranges = RangeSet::from([(0..sent_transcript.len())]);
    // let recv_public_ranges = RangeSet::from([(0..recv_transcript.len())]);

    let mut builder = TranscriptCommitConfig::builder(prover.transcript());
    builder.commit_sent(&sent_public_ranges).unwrap();
    builder.commit_recv(&recv_public_ranges).unwrap();

    let config = builder.build().unwrap();
    prover.transcript_commit(config);

    // Finalize
    let request_config = RequestConfig::default();
    let (attestation, secrets) = prover.finalize(&request_config).await.unwrap();
    debug!("Identity proof: {:?}", secrets.identity_proof());

    debug!("Notarization complete!");

    // Save intermediate files if requested
    // if args.save_intermediate {
    //     std::fs::create_dir_all(&args.user_dir)?;
        
    //     let attestation_path = args.user_dir.join(format!("{}.attestation.tlsn", args.output_prefix));
    //     let secrets_path = args.user_dir.join(format!("{}.secrets.tlsn", args.output_prefix));
        
    //     std::fs::write(&attestation_path, bincode::serialize(&attestation)?)?;
    //     std::fs::write(&secrets_path, bincode::serialize(&secrets)?)?;
        
    //     debug!("Saved intermediate files:");
    //     debug!("  Attestation: {}", attestation_path.display());
    //     debug!("  Secrets: {}", secrets_path.display());
    // }

    // Build presentation
    let mut builder = secrets.transcript_proof_builder();
    builder.reveal_recv(&recv_public_ranges)?;
    builder.reveal_sent(&sent_public_ranges)?;

    let transcript_proof = builder.build()?;
    let provider = CryptoProvider::default();

    let mut builder = attestation.presentation_builder(&provider);
    builder
        .identity_proof(secrets.identity_proof())
        .transcript_proof(transcript_proof);

    let presentation: Presentation = builder.build()?;
    
    Ok(presentation)
}

fn find_ranges(seq: &[u8], sub_seq: &[&[u8]]) -> (RangeSet<usize>, RangeSet<usize>) {
    let mut private_ranges = Vec::new();
    
    // Find all occurrences of each private word
    for s in sub_seq {
        let mut start_idx = 0;
        while let Some(idx) = find_subsequence(&seq[start_idx..], s) {
            let abs_idx = start_idx + idx;
            private_ranges.push(abs_idx..(abs_idx + s.len()));
            start_idx = abs_idx + 1; // Move past the current match to find next occurrence
        }
    }

    // Sort and merge overlapping ranges
    let mut sorted_ranges = private_ranges.clone();
    sorted_ranges.sort_by_key(|r| r.start);
    
    let mut merged_private = Vec::new();
    if !sorted_ranges.is_empty() {
        let mut current = sorted_ranges[0].clone();
        
        for range in sorted_ranges.iter().skip(1) {
            if range.start <= current.end {
                // Ranges overlap, merge them
                current.end = current.end.max(range.end);
            } else {
                // No overlap, push current range and start new one
                merged_private.push(current);
                current = range.clone();
            }
        }
        merged_private.push(current);
    }

    // Find public ranges (gaps between private ranges)
    let mut public_ranges = Vec::new();
    let mut last_end = 0;
    
    for r in &merged_private {
        if r.start > last_end {
            public_ranges.push(last_end..r.start);
        }
        last_end = r.end;
    }
    
    if last_end < seq.len() {
        public_ranges.push(last_end..seq.len());
    }

    (
        RangeSet::from(public_ranges),
        RangeSet::from(merged_private),
    )
}

fn find_subsequence(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len())
        .position(|window| window == needle)
}