/*
  # Create pallet orders table

  1. New Tables
    - `pallet_orders`
      - `id` (uuid, primary key)
      - `table_number` (integer, references table number)
      - `badge_number` (text, references badge from table_reservations)
      - `status` (text, enum: 'pending', 'completed')
      - `created_at` (timestamp)
      - `completed_at` (timestamp, nullable)

  2. Security
    - Enable RLS on `pallet_orders` table
    - Add policy for authenticated users to read all orders
    - Add policy for authenticated users to create orders
    - Add policy for authenticated users to update orders
*/

CREATE TABLE IF NOT EXISTS pallet_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer NOT NULL,
  badge_number text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE pallet_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pallet orders"
  ON pallet_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create pallet orders"
  ON pallet_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update pallet orders"
  ON pallet_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);