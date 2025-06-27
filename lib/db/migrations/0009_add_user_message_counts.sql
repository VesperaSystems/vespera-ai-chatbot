CREATE TABLE IF NOT EXISTS user_message_counts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "User"(id),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
lint);

CREATE INDEX IF NOT EXISTS user_message_counts_user_id_date_idx ON user_message_counts(user_id, date); 