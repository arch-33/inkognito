use serde::{Deserialize, Serialize};

/// Note metadata — returned by list_notes (no content, for fast listing)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteMeta {
    pub id: String,
    pub date: String,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// Full note — metadata + content, returned by get_note
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    pub date: String,
    pub content: String,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// Tag entity — id is the same as name
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
}

/// Search result snippet
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub note_id: String,
    pub snippet: String,
}
