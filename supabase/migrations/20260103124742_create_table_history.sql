/*
  # Create table history

  1. New Tables
    - `table_history`
      - `id` (uuid, primary key) - Unique identifier
      - `table_number` (integer, not null) - Table number
      - `badge_number` (text, not null) - Badge number
      - `started_at` (timestamptz, not null) - When reservation started
      - `completed_at` (timestamptz, not null) - When reservation ended
      - `created_at` (timestamptz) - Record creation timestamp
      
  2. Security
    - Enable RLS on `table_history` table
    - Add policy for anyone to view history
    - Add policy for anyone to insert history records
    
  3. Indexes
    - Index on table_number for faster searches
    - Index on badge_number for faster searches
*/

CREATE TABLE IF NOT EXISTS table_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  badge_number text NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_table_history_table_number ON table_history(table_number);
CREATE INDEX IF NOT EXISTS idx_table_history_badge_number ON table_history(badge_number);

ALTER TABLE table_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view table history"
  ON table_history
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert table history"
  ON table_history
  FOR INSERT
  WITH CHECK (true);