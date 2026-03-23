CREATE TABLE IF NOT EXISTS board_columns (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS board_columns_board_id_position_key ON board_columns (board_id, position);
