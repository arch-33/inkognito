use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

pub struct Db(pub Mutex<Connection>);

const SCHEMA_SQL: &str = r#"
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS notes (
    id          TEXT PRIMARY KEY,
    date        TEXT NOT NULL,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS note_content (
    note_id     TEXT PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
    content     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS tags (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS note_tags (
    note_id     TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id      TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    content,
    content='note_content',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date);
CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite) WHERE is_favorite = 1;
CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);

CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);

-- FTS5 sync triggers (external-content table uses delete+reinsert pattern)
CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON note_content BEGIN
    INSERT INTO notes_fts(rowid, content) VALUES (NEW.rowid, NEW.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON note_content BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, content) VALUES('delete', OLD.rowid, OLD.content);
    INSERT INTO notes_fts(rowid, content) VALUES (NEW.rowid, NEW.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON note_content BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, content) VALUES('delete', OLD.rowid, OLD.content);
END;
"#;

pub fn init_db(path: &Path) -> Result<Db, String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute_batch(SCHEMA_SQL).map_err(|e| e.to_string())?;
    Ok(Db(Mutex::new(conn)))
}
