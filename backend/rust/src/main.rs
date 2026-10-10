use axum::{routing::get, Json, Router};
use serde_json::{json, Value};
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new().allow_origin(Any);

    let app = Router::new()
        .route("/api/hello", get(hello))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8001")
        .await
        .unwrap();
    println!("Rust backend running on http://localhost:8001");
    axum::serve(listener, app).await.unwrap();
}

async fn hello() -> Json<Value> {
    Json(json!({ "message": "Hello from Rust (Axum)" }))
}
