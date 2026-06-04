use crate::models::{GeminiRequest, GeminiResponse, Content, Part, SystemInstruction, GenerationConfig, Invoice};
use reqwest::Client;
use std::env;
use std::time::Duration;

const GEMINI_API_URL: &str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

#[derive(Clone)]
pub struct GeminiClient {
    api_key: String,
    client: Client,
}

impl GeminiClient {
    pub fn new() -> Result<Self, anyhow::Error> {
        let api_key = env::var("GEMINI_API_KEY").unwrap_or_else(|_| "MOCK_KEY".to_string());
        
        Ok(Self {
            api_key,
            client: Client::new(),
        })
    }

    pub async fn generate_content(&self, request: GeminiRequest) -> Result<GeminiResponse, anyhow::Error> {
        let url = format!("{}?key={}", GEMINI_API_URL, self.api_key);
        
        let response = match self.client.post(&url).json(&request).send().await {
            Ok(res) => res,
            Err(e) => return Err(anyhow::anyhow!("Network request failed: {}", e.without_url())),
        };

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Gemini API Error: {}", error_text));
        }

        let result = response.json::<GeminiResponse>().await?;
        Ok(result)
    }

    /// Uploads raw bytes to the Gemini File API using the resumable upload protocol.
    /// This works for any file size and is what Google recommends for media files.
    pub async fn upload_to_file_api(
        &self,
        bytes: Vec<u8>,
        mime_type: &str,
        display_name: &str,
    ) -> Result<String, anyhow::Error> {
        let file_size = bytes.len();
        let metadata = serde_json::json!({"file": {"display_name": display_name}}).to_string();

        // Step 1: Initiate the resumable upload session.
        let init_url = format!(
            "https://generativelanguage.googleapis.com/upload/v1beta/files?key={}",
            self.api_key
        );
        let init_response = self.client
            .post(&init_url)
            .header("X-Goog-Upload-Protocol", "resumable")
            .header("X-Goog-Upload-Command", "start")
            .header("X-Goog-Upload-Header-Content-Length", file_size.to_string())
            .header("X-Goog-Upload-Header-Content-Type", mime_type)
            .header("Content-Type", "application/json")
            .body(metadata)
            .send()
            .await?;

        if !init_response.status().is_success() {
            let err = init_response.text().await?;
            return Err(anyhow::anyhow!("File API initiation failed: {}", err));
        }

        // The upload URL comes back in a response header.
        let upload_url = init_response
            .headers()
            .get("X-Goog-Upload-URL")
            .ok_or_else(|| anyhow::anyhow!("No X-Goog-Upload-URL in initiation response"))?
            .to_str()?
            .to_string();

        // Step 2: Upload all bytes in one shot and finalize.
        let upload_response = self.client
            .post(&upload_url)
            .header("Content-Length", file_size.to_string())
            .header("X-Goog-Upload-Offset", "0")
            .header("X-Goog-Upload-Command", "upload, finalize")
            .body(bytes)
            .send()
            .await?;

        if !upload_response.status().is_success() {
            let err = upload_response.text().await?;
            return Err(anyhow::anyhow!("File API upload failed: {}", err));
        }

        let resp: serde_json::Value = upload_response.json().await?;
        let file_uri = resp["file"]["uri"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("No file URI in upload response"))?
            .to_string();
        let file_name = resp["file"]["name"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("No file name in upload response"))?
            .to_string();

        // Videos need processing time before Gemini can use them.
        if resp["file"]["state"].as_str().unwrap_or("") != "ACTIVE" {
            self.wait_for_file_active(&file_name).await?;
        }
        Ok(file_uri)
    }

    /// Polls the Gemini File API until the uploaded file reaches ACTIVE state.
    async fn wait_for_file_active(&self, file_name: &str) -> Result<(), anyhow::Error> {
        for _ in 0..15 {
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/{}?key={}",
                file_name, self.api_key
            );
            let resp: serde_json::Value = self.client.get(&url).send().await?.json().await?;
            match resp["state"].as_str().unwrap_or("PROCESSING") {
                "ACTIVE" => return Ok(()),
                "FAILED" => return Err(anyhow::anyhow!("Gemini file processing failed")),
                _ => tokio::time::sleep(Duration::from_secs(2)).await,
            }
        }
        Err(anyhow::anyhow!("Gemini file did not become ACTIVE within timeout"))
    }

    pub async fn generate_invoice(&self, prompt: &str, project_name: &str, currency: &str, mut parts: Vec<Part>) -> Result<Invoice, anyhow::Error> {
        let system_instruction = format!(
            "You are an expert construction estimator. The user has submitted a job site video in which \
            they narrate the work to be done out loud. \
            STEP 1 — Transcribe: listen carefully to the spoken audio and write out the full narration \
            verbatim into the `transcript` field. Do not summarise or paraphrase. \
            STEP 2 — Build the invoice: use the transcript as your PRIMARY source of line items. \
            Every task, material, or scope item the user mentions must become a line item. \
            Only fall back to visual analysis of the video frames if the audio track is silent or absent. \
            STEP 3 — Price: calculate realistic quantities, unit prices, and totals. All currency values must be in {}. \
            If a price list document is included, you MUST use those prices for any matching items — do not override them. \
            Output ONLY valid JSON matching the exact structure requested, with no markdown formatting or backticks.",
            currency
        );

        let json_schema = serde_json::json!({
            "type": "object",
            "properties": {
                "project_name": { "type": "string" },
                "date": { "type": "string", "description": "YYYY-MM-DD" },
                "transcript": { "type": "string", "description": "The exact transcribed text from the audio, if provided" },
                "subtotal": { "type": "number" },
                "taxes": { "type": "number" },
                "total": { "type": "number" },
                "line_items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "string", "description": "A UUID" },
                            "description": { "type": "string" },
                            "quantity": { "type": "number", "description": "Quantity of the item (e.g., units, bags, square feet). For labor, hours, or days, this MUST be 1." },
                            "unit_price": { "type": "number", "description": "Price per single unit, or total labor cost if quantity is 1." },
                            "discount": { "type": "number", "description": "Optional flat discount amount applied to this item." },
                            "discount_percentage": { "type": "number", "description": "Optional percentage discount applied to this item (e.g., 10 for 10%)." }
                        },
                        "required": ["id", "description", "quantity", "unit_price"]
                    }
                }
            },
            "required": ["project_name", "date", "subtotal", "taxes", "total", "line_items"]
        });

        let project_context = if project_name == "New Project" || project_name.trim().is_empty() {
            "Please generate a short, descriptive project name based on the provided details and media.".to_string()
        } else {
            format!("Project Name: {}", project_name)
        };

        // Add the prompt text part at the beginning
        parts.insert(0, Part {
            text: Some(format!("{}\nDetails: {}", project_context, prompt)),
            function_call: None,
            function_response: None,
            file_data: None,
            inline_data: None,
        });

        let request = GeminiRequest {
            contents: vec![Content {
                role: "user".to_string(),
                parts,
            }],
            system_instruction: Some(SystemInstruction {
                parts: vec![Part {
                    text: Some(system_instruction.to_string()),
                    function_call: None,
                    function_response: None,
                    file_data: None,
                    inline_data: None,
                }],
            }),
            tools: None,
            generation_config: Some(GenerationConfig {
                response_mime_type: Some("application/json".to_string()),
                response_schema: Some(json_schema),
            }),
        };

        let response = self.generate_content(request).await?;

        let candidates = response.candidates.ok_or_else(|| anyhow::anyhow!("No candidates returned"))?;
        let first_candidate = candidates.first().ok_or_else(|| anyhow::anyhow!("Empty candidates array"))?;
        let text = first_candidate.content.parts.first()
            .and_then(|p| p.text.as_ref())
            .ok_or_else(|| anyhow::anyhow!("No text found in response"))?;

        // Gemini sometimes includes markdown formatting even with response_mime_type, so we strip it just in case
        let clean_text = text.trim().trim_start_matches("```json").trim_start_matches("```").trim_end_matches("```").trim();
        
        let invoice: Invoice = serde_json::from_str(clean_text)?;
        Ok(invoice)
    }

    pub async fn edit_invoice(&self, prompt: &str, current_invoice: &Invoice) -> Result<Invoice, anyhow::Error> {
        let system_instruction = "You are an expert construction estimator AI. \
            The user will provide a command to edit an existing invoice. \
            Apply the changes carefully and realistically. Ensure the math (subtotal, taxes, total) is correct. \
            Output ONLY valid JSON matching the exact structure requested, with no markdown formatting.";

        let json_schema = serde_json::json!({
            "type": "object",
            "properties": {
                "project_name": { "type": "string" },
                "date": { "type": "string", "description": "YYYY-MM-DD" },
                "transcript": { "type": "string", "description": "The exact transcribed text from the audio, if provided" },
                "subtotal": { "type": "number" },
                "taxes": { "type": "number" },
                "total": { "type": "number" },
                "line_items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "string", "description": "A UUID" },
                            "description": { "type": "string" },
                            "quantity": { "type": "number", "description": "Quantity of the item (e.g., units, bags, square feet). For labor, hours, or days, this MUST be 1." },
                            "unit_price": { "type": "number", "description": "Price per single unit, or total labor cost if quantity is 1." },
                            "discount": { "type": "number", "description": "Optional flat discount amount applied to this item." },
                            "discount_percentage": { "type": "number", "description": "Optional percentage discount applied to this item (e.g., 10 for 10%)." }
                        },
                        "required": ["id", "description", "quantity", "unit_price"]
                    }
                }
            },
            "required": ["project_name", "date", "subtotal", "taxes", "total", "line_items"]
        });

        let current_invoice_json = serde_json::to_string(current_invoice)?;
        let user_text = format!("Current Invoice:\n{}\n\nUser Command to Apply:\n{}", current_invoice_json, prompt);

        let parts = vec![Part {
            text: Some(user_text),
            function_call: None,
            function_response: None,
            file_data: None,
            inline_data: None,
        }];

        let request = GeminiRequest {
            contents: vec![Content {
                role: "user".to_string(),
                parts,
            }],
            system_instruction: Some(SystemInstruction {
                parts: vec![Part {
                    text: Some(system_instruction.to_string()),
                    function_call: None,
                    function_response: None,
                    file_data: None,
                    inline_data: None,
                }],
            }),
            tools: None,
            generation_config: Some(GenerationConfig {
                response_mime_type: Some("application/json".to_string()),
                response_schema: Some(json_schema),
            }),
        };

        let response = self.generate_content(request).await?;

        let candidates = response.candidates.ok_or_else(|| anyhow::anyhow!("No candidates returned"))?;
        let first_candidate = candidates.first().ok_or_else(|| anyhow::anyhow!("Empty candidates array"))?;
        let text = first_candidate.content.parts.first()
            .and_then(|p| p.text.as_ref())
            .ok_or_else(|| anyhow::anyhow!("No text found in response"))?;

        let clean_text = text.trim().trim_start_matches("```json").trim_start_matches("```").trim_end_matches("```").trim();
        
        let invoice: Invoice = serde_json::from_str(clean_text)?;
        Ok(invoice)
    }
}
