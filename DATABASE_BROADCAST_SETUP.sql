-- Create broadcast_message table
CREATE TABLE IF NOT EXISTS broadcast_message (
  id INTEGER PRIMARY KEY DEFAULT 1,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable Row Level Security
ALTER TABLE broadcast_message ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the broadcast message
CREATE POLICY "Anyone can view broadcast message"
  ON broadcast_message
  FOR SELECT
  USING (true);

-- Only allow authenticated users to update (admin check should be done in the app)
CREATE POLICY "Authenticated users can update broadcast message"
  ON broadcast_message
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default empty message
INSERT INTO broadcast_message (id, message) 
VALUES (1, '')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime
ALTER TABLE broadcast_message REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE broadcast_message;
