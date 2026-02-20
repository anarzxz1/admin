/*
  # Create blacklist table

  1. New Tables
    - `blacklist`
      - `id` (uuid, primary key) - Unique identifier
      - `badge_number` (text, not null, unique) - Badge number in blacklist
      - `comment` (text) - Comment explaining why badge is blacklisted
      - `created_at` (timestamptz) - Timestamp of when added to blacklist
      
  2. Security
    - Enable RLS on `blacklist` table
    - Add policy for anyone to view blacklist
    - Add policy for anyone to add to blacklist
    - Add policy for anyone to remove from blacklist
    
  3. Constraints
    - Unique constraint on badge_number to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_number text NOT NULL UNIQUE,
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blacklist"
  ON blacklist
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add to blacklist"
  ON blacklist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can remove from blacklist"
  ON blacklist
  FOR DELETE
  USING (true);