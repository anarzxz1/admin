/*
  # Fix pallet_orders RLS policies

  Allow unauthenticated access to pallet_orders table for development purposes.
*/

DROP POLICY IF EXISTS "Anyone can view pallet orders" ON pallet_orders;
DROP POLICY IF EXISTS "Anyone can create pallet orders" ON pallet_orders;
DROP POLICY IF EXISTS "Anyone can update pallet orders" ON pallet_orders;

CREATE POLICY "Anyone can view pallet orders"
  ON pallet_orders
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create pallet orders"
  ON pallet_orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update pallet orders"
  ON pallet_orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);