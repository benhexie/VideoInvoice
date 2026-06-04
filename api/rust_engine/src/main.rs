use axum::{
    extract::State,
    routing::{get, post},
    Router, Json,
};
use dotenvy::dotenv;
use futures::future::join_all;
use moka::future::Cache;
use serde::{Deserialize, Serialize};
use std::io::Write;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};
use std::env;

mod gemini;
mod models;
mod prompt;
mod media;
mod db;

use gemini::GeminiClient;
use models::{Invoice, LineItem, Part, FileData, InlineData};

use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64_STANDARD};

// ── Shared application state ──────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    gemini: GeminiClient,
    /// Caches raw price-list bytes keyed by download URL. TTL = 10 min.
    price_list_cache: Arc<Cache<String, Arc<Vec<u8>>>>,
}

// ── Startup ───────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    dotenv().ok();

    // Railway / Cloud deployment trick for serviceAccountKey.json
    if env::var("GOOGLE_APPLICATION_CREDENTIALS").is_err() {
        if let (Ok(project_id), Ok(client_email), Ok(private_key)) = (
            env::var("FIREBASE_PROJECT_ID"),
            env::var("FIREBASE_CLIENT_EMAIL"),
            env::var("FIREBASE_PRIVATE_KEY"),
        ) {
            let private_key = private_key.replace("\\n", "\n");
            let credentials_json = serde_json::json!({
                "type": "service_account",
                "project_id": project_id,
                "private_key_id": "dummy_private_key_id",
                "private_key": private_key,
                "client_email": &client_email,
                "client_id": "dummy_client_id",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": format!("https://www.googleapis.com/robot/v1/metadata/x509/{}", client_email)
            });

            let mut temp_file = tempfile::NamedTempFile::new().expect("Failed to create temp credentials file");
            write!(temp_file, "{}", credentials_json).expect("Failed to write temp credentials file");
            let (_, path) = temp_file.keep().expect("Failed to persist temp credentials file");
            unsafe {
                env::set_var("GOOGLE_APPLICATION_CREDENTIALS", path);
            }
            println!("Generated GOOGLE_APPLICATION_CREDENTIALS from env vars");
        }
    }

    let price_list_cache = Arc::new(
        Cache::builder()
            .time_to_live(Duration::from_secs(600))
            .max_capacity(50)
            .build(),
    );

    let state = Arc::new(AppState {
        gemini: GeminiClient::new().expect("Failed to create GeminiClient"),
        price_list_cache,
    });

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/ai/process", post(process_quote))
        .route("/api/ai/edit", post(edit_quote))
        .with_state(state);

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse::<u16>().unwrap()));
    println!("Rust AI Microservice listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "OK"
}

// ── Request / Response types ──────────────────────────────────────────────────

#[derive(Deserialize, Clone)]
struct ProcessQuoteRequest {
    user_id: String,
    media_urls: Vec<String>,
    prompt: String,
    project_name: String,
    currency: Option<String>,
    price_list_url: Option<String>,
}

#[derive(Serialize)]
struct ProcessQuoteResponse {
    status: String,
    invoice_id: String,
    message: String,
}

#[derive(Deserialize)]
struct EditQuoteRequest {
    user_id: String,
    invoice_id: String,
    prompt: String,
}

#[derive(Serialize)]
struct EditQuoteResponse {
    status: String,
    invoice_id: String,
    message: String,
}

// ── Media helpers ─────────────────────────────────────────────────────────────

fn is_video_url(url: &str) -> bool {
    let lower = url.to_lowercase();
    lower.contains(".mp4") || lower.contains(".mov") || lower.contains(".avi")
        || lower.contains(".wmv") || lower.contains(".mkv") || lower.contains(".webm")
}

fn mime_from_url(url: &str) -> String {
    let lower = url.to_lowercase();
    if lower.contains(".pdf") { return "application/pdf".to_string(); }
    if lower.contains(".png") { return "image/png".to_string(); }
    if lower.contains(".jpg") || lower.contains(".jpeg") { return "image/jpeg".to_string(); }
    if lower.contains(".txt") { return "text/plain".to_string(); }
    if lower.contains(".csv") { return "text/csv".to_string(); }
    if lower.contains(".rtf") { return "application/rtf".to_string(); }
    if lower.contains(".docx") { return "application/vnd.openxmlformats-officedocument.wordprocessingml.document".to_string(); }
    if lower.contains(".xlsx") { return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".to_string(); }
    if lower.contains(".xls")  { return "application/vnd.ms-excel".to_string(); }
    if lower.contains(".doc")  { return "application/msword".to_string(); }
    "application/pdf".to_string()
}

/// Downloads a single media URL and returns the Gemini Part(s) for it.
/// Videos are uploaded to the Gemini File API (no FFMPEG frame extraction).
/// Images / PDFs are sent as inline_data.
async fn process_single_media(url: String, gemini: GeminiClient) -> Vec<Part> {
    if is_video_url(&url) {
        println!("Uploading video to Gemini File API: {}", url);
        match reqwest::get(&url).await.and_then(|r| Ok(r)) {
            Ok(response) => {
                match response.bytes().await {
                    Ok(bytes) => {
                        let mime = if url.to_lowercase().contains(".mov") { "video/quicktime" }
                                   else if url.to_lowercase().contains(".webm") { "video/webm" }
                                   else { "video/mp4" };
                        match gemini.upload_to_file_api(bytes.to_vec(), mime, "job_site_video").await {
                            Ok(file_uri) => {
                                println!("Video uploaded to Gemini File API: {}", file_uri);
                                vec![Part {
                                    text: None,
                                    function_call: None,
                                    function_response: None,
                                    inline_data: None,
                                    file_data: Some(FileData {
                                        mime_type: mime.to_string(),
                                        file_uri,
                                    }),
                                }]
                            }
                            Err(e) => {
                                println!("Failed to upload video to File API: {}", e);
                                vec![]
                            }
                        }
                    }
                    Err(e) => { println!("Failed to read video bytes: {}", e); vec![] }
                }
            }
            Err(e) => { println!("Failed to download video: {}", e); vec![] }
        }
    } else {
        println!("Downloading document: {}", url);
        match reqwest::get(&url).await {
            Ok(response) => {
                let mut content_type = response.headers()
                    .get(reqwest::header::CONTENT_TYPE)
                    .and_then(|v| v.to_str().ok())
                    .unwrap_or("application/pdf")
                    .to_string();

                if content_type == "application/octet-stream"
                    || content_type.contains("application/x-www-form-urlencoded")
                {
                    content_type = mime_from_url(&url);
                }

                match response.bytes().await {
                    Ok(bytes) => vec![Part {
                        text: None,
                        function_call: None,
                        function_response: None,
                        file_data: None,
                        inline_data: Some(InlineData {
                            mime_type: content_type,
                            data: BASE64_STANDARD.encode(&bytes),
                        }),
                    }],
                    Err(e) => { println!("Failed to read document bytes: {}", e); vec![] }
                }
            }
            Err(e) => { println!("Failed to download document: {}", e); vec![] }
        }
    }
}

/// Downloads (or returns from cache) the user's price list and returns the
/// two Gemini Parts that introduce it (a label text part + the inline_data part).
async fn fetch_price_list(
    url: &str,
    cache: &Cache<String, Arc<Vec<u8>>>,
) -> Vec<Part> {
    if url.is_empty() { return vec![]; }

    let url_owned = url.to_string();
    let bytes = cache.get_with(url_owned.clone(), async {
        match reqwest::get(&url_owned).await {
            Ok(resp) => match resp.bytes().await {
                Ok(b) => { println!("Downloaded price list: {}", url_owned); Arc::new(b.to_vec()) }
                Err(e) => { println!("Failed to read price list bytes: {}", e); Arc::new(vec![]) }
            },
            Err(e) => { println!("Failed to download price list: {}", e); Arc::new(vec![]) }
        }
    }).await;

    if bytes.is_empty() { return vec![]; }

    let content_type = mime_from_url(url);
    println!("Injecting price list ({}) into context", content_type);

    vec![
        Part {
            text: Some("The following document is the user's price list. Use the prices from this document for any matching items in the invoice:".to_string()),
            function_call: None,
            function_response: None,
            file_data: None,
            inline_data: None,
        },
        Part {
            text: None,
            function_call: None,
            function_response: None,
            file_data: None,
            inline_data: Some(InlineData {
                mime_type: content_type,
                data: BASE64_STANDARD.encode(bytes.as_ref()),
            }),
        },
    ]
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async fn process_quote(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ProcessQuoteRequest>,
) -> Json<ProcessQuoteResponse> {
    let total_start = Instant::now();
    println!("Received quote request for user {} (Project: {})", payload.user_id, payload.project_name);

    let invoice_id = uuid::Uuid::new_v4().to_string();
    let current_timestamp = chrono::Utc::now().timestamp_millis();

    let stub_invoice = Invoice {
        user_id: None,
        project_name: payload.project_name.clone(),
        date: chrono::Local::now().format("%Y-%m-%d").to_string(),
        transcript: None,
        status: Some("processing".to_string()),
        media_url: payload.media_urls.first().cloned(),
        prompt: Some(payload.prompt.clone()),
        currency: payload.currency.clone(),
        created_at: Some(current_timestamp),
        line_items: vec![],
        subtotal: 0.0,
        taxes: 0.0,
        total: 0.0,
    };

    if let Err(e) = db::save_invoice_to_firestore(&payload.user_id, &invoice_id, &stub_invoice).await {
        println!("Failed to save stub to Firestore: {}", e);
    }

    let payload_clone = payload.clone();
    let invoice_id_clone = invoice_id.clone();
    let state_clone = state.clone();

    tokio::spawn(async move {
        println!("Background processing started for quote: {}", invoice_id_clone);
        let payload = payload_clone;
        let state = state_clone;

        // 1. Fetch all media + price list in parallel
        let media_start = Instant::now();

        let media_futs = payload.media_urls.iter().cloned().map(|url| {
            let gemini = state.gemini.clone();
            process_single_media(url, gemini)
        });
        let price_list_fut = fetch_price_list(
            payload.price_list_url.as_deref().unwrap_or(""),
            &state.price_list_cache,
        );

        let (media_results, price_list_parts) =
            tokio::join!(join_all(media_futs), price_list_fut);

        let mut parts: Vec<Part> = media_results.into_iter().flatten().collect();
        let has_video = parts.iter().any(|p| p.file_data.is_some());
        parts.extend(price_list_parts);

        println!("[TIMING] Step 1: Media Processing took {:?}", media_start.elapsed());

        // 2. Call Gemini API
        let gemini_start = Instant::now();
        let currency = payload.currency.clone().unwrap_or_else(|| "USD".to_string());
        let mut generated_invoice = match state.gemini.generate_invoice(
            &payload.prompt,
            &payload.project_name,
            &currency,
            parts,
        ).await {
            Ok(invoice) => invoice,
            Err(e) => {
                println!("Gemini API failed: {}", e);
                Invoice {
                    user_id: None,
                    project_name: payload.project_name.clone(),
                    date: chrono::Local::now().format("%Y-%m-%d").to_string(),
                    transcript: None,
                    status: Some("error".to_string()),
                    media_url: None,
                    prompt: None,
                    currency: payload.currency.clone(),
                    created_at: Some(current_timestamp),
                    line_items: vec![LineItem {
                        id: uuid::Uuid::new_v4().to_string(),
                        description: "Error generating quote. Please try again.".to_string(),
                        quantity: 1.0,
                        unit_price: 0.0,
                        discount: None,
                        discount_percentage: None,
                    }],
                    subtotal: 0.0,
                    taxes: 0.0,
                    total: 0.0,
                }
            }
        };

        println!("[TIMING] Step 2: Gemini API Call took {:?}", gemini_start.elapsed());

        generated_invoice.user_id = None;
        generated_invoice.date = chrono::Local::now().format("%Y-%m-%d").to_string();
        generated_invoice.media_url = payload.media_urls.first().cloned();
        generated_invoice.prompt = Some(payload.prompt.clone());
        generated_invoice.currency = payload.currency.clone();
        generated_invoice.created_at = Some(current_timestamp);

        if !has_video {
            generated_invoice.transcript = None;
        }

        if generated_invoice.status.is_none()
            || generated_invoice.status.as_deref() == Some("processing")
        {
            generated_invoice.status = Some("completed".to_string());
        }

        // 3. Save to Firestore
        let fs_start = Instant::now();
        if let Err(e) = db::save_invoice_to_firestore(
            &payload.user_id,
            &invoice_id_clone,
            &generated_invoice,
        ).await {
            println!("Failed to save to Firestore: {}", e);
        }
        println!("[TIMING] Step 3: Firestore Save took {:?}", fs_start.elapsed());
        println!("[TIMING] Background Processing Time: {:?}", total_start.elapsed());
    });

    Json(ProcessQuoteResponse {
        status: "processing".to_string(),
        invoice_id,
        message: "Invoice processing started in background".to_string(),
    })
}

async fn edit_quote(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<EditQuoteRequest>,
) -> Json<EditQuoteResponse> {
    println!("Editing quote {} for user {}", payload.invoice_id, payload.user_id);

    let current_invoice = match db::read_invoice_from_firestore(&payload.invoice_id).await {
        Ok(inv) => inv,
        Err(e) => {
            println!("Failed to read invoice from Firestore: {}", e);
            return Json(EditQuoteResponse {
                status: "error".to_string(),
                invoice_id: payload.invoice_id,
                message: format!("Failed to read invoice: {}", e),
            });
        }
    };

    if let Some(ref owner_id) = current_invoice.user_id {
        if owner_id != &payload.user_id {
            return Json(EditQuoteResponse {
                status: "error".to_string(),
                invoice_id: payload.invoice_id,
                message: "Unauthorized access to invoice".to_string(),
            });
        }
    }

    let mut updated_invoice = match state.gemini.edit_invoice(&payload.prompt, &current_invoice).await {
        Ok(inv) => inv,
        Err(e) => {
            println!("Gemini API failed during edit: {}", e);
            return Json(EditQuoteResponse {
                status: "error".to_string(),
                invoice_id: payload.invoice_id,
                message: format!("Gemini API failed: {}", e),
            });
        }
    };

    updated_invoice.user_id = current_invoice.user_id.clone();
    updated_invoice.date = current_invoice.date.clone();
    updated_invoice.media_url = current_invoice.media_url.clone();
    updated_invoice.currency = current_invoice.currency.clone();
    updated_invoice.created_at = current_invoice.created_at.clone();
    updated_invoice.prompt = Some(payload.prompt.clone());

    if let Err(e) = db::save_invoice_to_firestore(
        &payload.user_id,
        &payload.invoice_id,
        &updated_invoice,
    ).await {
        println!("Failed to save updated invoice to Firestore: {}", e);
        return Json(EditQuoteResponse {
            status: "error".to_string(),
            invoice_id: payload.invoice_id,
            message: format!("Failed to save to Firestore: {}", e),
        });
    }

    Json(EditQuoteResponse {
        status: "success".to_string(),
        invoice_id: payload.invoice_id,
        message: "Invoice updated and saved to Firestore".to_string(),
    })
}
