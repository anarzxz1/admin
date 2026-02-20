/*
  # Create table reservations system

  1. New Tables
    - `table_reservations`
      - `id` (uuid, primary key) - Unique identifier for each reservation
      - `table_number` (integer, not null) - Table number from 1 to 208
      - `badge_number` (text, not null) - Badge number of the person reserving
      - `created_at` (timestamptz) - Timestamp of reservation creation
      
  2. Security
    - Enable RLS on `table_reservations` table
    - Add policy for anyone to view all reservations (to check availability)
    - Add policy for anyone to create new reservations
    
  3. Constraints
    - Unique constraint on table_number to ensure one reservation per table
    - Check constraint to ensure table_number is between 1 and 208
*/

CREATE TABLE IF NOT EXISTS table_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  badge_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_table_number UNIQUE (table_number),
  CONSTRAINT valid_table_number CHECK (table_number >= 1 AND table_number <= 208)
);

ALTER TABLE table_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view table reservations"
  ON table_reservations
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create table reservations"
  ON table_reservations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete table reservations"
  ON table_reservations
  FOR DELETE
  USING (true);