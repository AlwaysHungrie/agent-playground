# Rust TLSN LLM

This is a rust wrapper create tlsn attestations while making requests to llm providers like `api.openai.com` etc.
It also uploads generated attestations to an S3 bucket.

## Setup

This requires a notary server running. Follow instructions on [tlsn](https://github.com/tlsnotary/tlsn) to run your own notary server locally. However only attestations signed by publicly available trusted notaries will be accepted by the Constella wallet.

## Usage

```
cargo build --release

target/release/rust_tlsn_llm --url 'http://localhost:3000/hello-world' \
--headers '{"Authorization": "Bearer <OPENAI_API_KEY>"}' \
--request-json '{"messages":[{"role":"user","content":"Hello, how are you?"}], "model": "gpt-4" }' \
--user-dir agent \
--output-prefix test-run
```
