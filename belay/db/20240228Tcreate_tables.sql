CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(40) UNIQUE NOT NULL,
  password VARCHAR(40) NOT NULL,
  api_key VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY,
    name VARCHAR(40) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  reply_to INTEGER,
  user_id INTEGER NOT NULL,
  channel_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  FOREIGN KEY(reply_to) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS reactions (
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  emoji VARCHAR(40) NOT NULL,
  PRIMARY KEY(message_id, user_id, emoji),
  UNIQUE(message_id, user_id, emoji),
  FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS last_read_messages (
  user_id INTEGER NOT NULL,
  channel_id INTEGER NOT NULL,
  message_id INTEGER,
  PRIMARY KEY(user_id, channel_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
);
