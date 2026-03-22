use std::collections::HashMap;
use tauri::State;

use crate::db::Db;
use crate::models::{Note, NoteMeta, SearchResult, Tag};

fn now_rfc3339() -> String {
    chrono::Local::now().to_rfc3339()
}

/// Build a map of note_id -> Vec<tag_id> for all notes
fn load_all_tags(conn: &rusqlite::Connection) -> Result<HashMap<String, Vec<String>>, String> {
    let mut stmt = conn
        .prepare("SELECT note_id, tag_id FROM note_tags ORDER BY note_id, tag_id")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?;
    let mut map: HashMap<String, Vec<String>> = HashMap::new();
    for row in rows {
        let (note_id, tag_id) = row.map_err(|e| e.to_string())?;
        map.entry(note_id).or_default().push(tag_id);
    }
    Ok(map)
}

/// Load tags for a single note
fn load_note_tags(conn: &rusqlite::Connection, note_id: &str) -> Result<Vec<String>, String> {
    let mut stmt = conn
        .prepare("SELECT tag_id FROM note_tags WHERE note_id = ?1 ORDER BY tag_id")
        .map_err(|e| e.to_string())?;
    let tags = stmt
        .query_map([note_id], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(tags)
}

// ── Notes ──────────────────────────────────────────────

#[tauri::command]
pub fn get_all_notes(db: State<Db>) -> Result<Vec<Note>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let tag_map = load_all_tags(&conn)?;

    let mut stmt = conn
        .prepare(
            "SELECT n.id, n.date, COALESCE(nc.content, '') as content,
                    n.is_favorite, n.created_at, n.updated_at
             FROM notes n
             LEFT JOIN note_content nc ON nc.note_id = n.id
             ORDER BY n.date DESC",
        )
        .map_err(|e| e.to_string())?;

    let notes = stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            Ok((id.clone(), row.get(1)?, row.get(2)?, row.get::<_, bool>(3)?, row.get(4)?, row.get(5)?))
        })
        .map_err(|e| e.to_string())?
        .map(|r| {
            let (id, date, content, is_favorite, created_at, updated_at) = r.map_err(|e| e.to_string())?;
            Ok(Note {
                tags: tag_map.get(&id).cloned().unwrap_or_default(),
                id, date, content, is_favorite, created_at, updated_at,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    Ok(notes)
}

#[tauri::command]
pub fn list_notes(db: State<Db>) -> Result<Vec<NoteMeta>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let tag_map = load_all_tags(&conn)?;

    let mut stmt = conn
        .prepare("SELECT id, date, is_favorite, created_at, updated_at FROM notes ORDER BY date DESC")
        .map_err(|e| e.to_string())?;

    let metas = stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            Ok((id.clone(), row.get(1)?, row.get::<_, bool>(2)?, row.get(3)?, row.get(4)?))
        })
        .map_err(|e| e.to_string())?
        .map(|r| {
            let (id, date, is_favorite, created_at, updated_at) = r.map_err(|e| e.to_string())?;
            Ok(NoteMeta {
                tags: tag_map.get(&id).cloned().unwrap_or_default(),
                id, date, is_favorite, created_at, updated_at,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    Ok(metas)
}

#[tauri::command]
pub fn get_note(db: State<Db>, note_id: String) -> Result<Note, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let tags = load_note_tags(&conn, &note_id)?;

    conn.query_row(
        "SELECT n.id, n.date, COALESCE(nc.content, '') as content,
                n.is_favorite, n.created_at, n.updated_at
         FROM notes n
         LEFT JOIN note_content nc ON nc.note_id = n.id
         WHERE n.id = ?1",
        [&note_id],
        |row| {
            Ok(Note {
                id: row.get(0)?,
                date: row.get(1)?,
                content: row.get(2)?,
                is_favorite: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                tags: tags.clone(),
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => format!("note not found: {}", note_id),
        _ => e.to_string(),
    })
}

#[tauri::command]
pub fn get_note_content(db: State<Db>, note_id: String) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT COALESCE(nc.content, '') FROM notes n
         LEFT JOIN note_content nc ON nc.note_id = n.id
         WHERE n.id = ?1",
        [&note_id],
        |row| row.get(0),
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => format!("note not found: {}", note_id),
        _ => e.to_string(),
    })
}

#[tauri::command]
pub fn create_note(db: State<Db>, id: String, date: String) -> Result<Note, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = now_rfc3339();

    // Check for duplicate
    let exists: bool = conn
        .query_row("SELECT COUNT(*) > 0 FROM notes WHERE id = ?1", [&id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if exists {
        return Err(format!("note already exists: {}", id));
    }

    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;
    tx.execute(
        "INSERT INTO notes (id, date, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)",
        rusqlite::params![id, date, now],
    )
    .map_err(|e| e.to_string())?;
    tx.execute(
        "INSERT INTO note_content (note_id, content) VALUES (?1, '')",
        [&id],
    )
    .map_err(|e| e.to_string())?;
    tx.commit().map_err(|e| e.to_string())?;

    Ok(Note {
        id,
        date,
        content: String::new(),
        tags: vec![],
        is_favorite: false,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn save_note_content(db: State<Db>, note_id: String, content: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = now_rfc3339();

    let changed = conn
        .execute(
            "UPDATE note_content SET content = ?2 WHERE note_id = ?1",
            rusqlite::params![note_id, content],
        )
        .map_err(|e| e.to_string())?;
    if changed == 0 {
        return Err(format!("note not found: {}", note_id));
    }

    conn.execute(
        "UPDATE notes SET updated_at = ?2 WHERE id = ?1",
        rusqlite::params![note_id, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_note(db: State<Db>, note_id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let changed = conn
        .execute("DELETE FROM notes WHERE id = ?1", [&note_id])
        .map_err(|e| e.to_string())?;
    if changed == 0 {
        return Err(format!("note not found: {}", note_id));
    }
    Ok(())
}

#[tauri::command]
pub fn toggle_favorite(db: State<Db>, note_id: String) -> Result<bool, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = now_rfc3339();

    conn.execute(
        "UPDATE notes SET is_favorite = 1 - is_favorite, updated_at = ?2 WHERE id = ?1",
        rusqlite::params![note_id, now],
    )
    .map_err(|e| e.to_string())?;

    conn.query_row(
        "SELECT is_favorite FROM notes WHERE id = ?1",
        [&note_id],
        |row| row.get::<_, bool>(0),
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => format!("note not found: {}", note_id),
        _ => e.to_string(),
    })
}

// ── Tags ───────────────────────────────────────────────

#[tauri::command]
pub fn list_tags(db: State<Db>) -> Result<Vec<Tag>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name FROM tags ORDER BY id")
        .map_err(|e| e.to_string())?;
    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(tags)
}

#[tauri::command]
pub fn create_tag(db: State<Db>, tag: String) -> Result<Tag, String> {
    let normalized = tag.trim().to_lowercase();
    if normalized.is_empty() {
        return Err("tag name cannot be empty".into());
    }
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR IGNORE INTO tags (id, name) VALUES (?1, ?1)",
        [&normalized],
    )
    .map_err(|e| e.to_string())?;
    Ok(Tag {
        id: normalized.clone(),
        name: normalized,
    })
}

#[tauri::command]
pub fn delete_tag(db: State<Db>, tag: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = now_rfc3339();

    // Update timestamps on affected notes before CASCADE deletes the join rows
    conn.execute(
        "UPDATE notes SET updated_at = ?2 WHERE id IN (SELECT note_id FROM note_tags WHERE tag_id = ?1)",
        rusqlite::params![tag, now],
    )
    .map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM tags WHERE id = ?1", [&tag])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn add_tag_to_note(db: State<Db>, note_id: String, tag: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = now_rfc3339();

    // Ensure tag exists
    conn.execute(
        "INSERT OR IGNORE INTO tags (id, name) VALUES (?1, ?1)",
        [&tag],
    )
    .map_err(|e| e.to_string())?;

    // Insert relationship
    conn.execute(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
        rusqlite::params![note_id, tag],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE notes SET updated_at = ?2 WHERE id = ?1",
        rusqlite::params![note_id, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn remove_tag_from_note(db: State<Db>, note_id: String, tag: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = now_rfc3339();

    conn.execute(
        "DELETE FROM note_tags WHERE note_id = ?1 AND tag_id = ?2",
        rusqlite::params![note_id, tag],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE notes SET updated_at = ?2 WHERE id = ?1",
        rusqlite::params![note_id, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// ── Search ─────────────────────────────────────────────

#[tauri::command]
pub fn search_notes(db: State<Db>, query: String) -> Result<Vec<SearchResult>, String> {
    let q = query.trim().to_string();
    if q.is_empty() {
        return Ok(vec![]);
    }

    // Sanitize for FTS5: wrap each token in quotes to avoid syntax errors
    let fts_query = q
        .split_whitespace()
        .map(|t| format!("\"{}\"", t.replace('"', "\"\"")))
        .collect::<Vec<_>>()
        .join(" ");

    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT nc.note_id, snippet(notes_fts, 0, '', '', '...', 40) as snippet
             FROM notes_fts
             JOIN note_content nc ON nc.rowid = notes_fts.rowid
             WHERE notes_fts MATCH ?1
             ORDER BY rank
             LIMIT 50",
        )
        .map_err(|e| e.to_string())?;

    let results = stmt
        .query_map([&fts_query], |row| {
            Ok(SearchResult {
                note_id: row.get(0)?,
                snippet: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(results)
}
