-- Waitlist database schema
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'approved', 'rejected')),
  position INTEGER,
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_email ON waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status ON waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at ON waitlist_entries(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_entries_updated_at 
    BEFORE UPDATE ON waitlist_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 