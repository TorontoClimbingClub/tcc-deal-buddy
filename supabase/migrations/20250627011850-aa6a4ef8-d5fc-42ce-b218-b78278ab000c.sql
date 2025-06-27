
-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow public read access to price_history" ON price_history;
DROP POLICY IF EXISTS "Allow authenticated read access to price_history" ON price_history;
DROP POLICY IF EXISTS "Allow service role full access to price_history" ON price_history;
DROP POLICY IF EXISTS "Service role can insert price_history" ON price_history;
DROP POLICY IF EXISTS "Service role can manage price_history" ON price_history;
DROP POLICY IF EXISTS "Users can read price_history" ON price_history;
DROP POLICY IF EXISTS "Service role can read products" ON price_history;

-- Ensure RLS is enabled
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role can manage price_history" ON price_history
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users (including anon key) to insert price history records
CREATE POLICY "Authenticated users can insert price_history" ON price_history
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update existing records
CREATE POLICY "Authenticated users can update price_history" ON price_history
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read price history
CREATE POLICY "Authenticated users can read price_history" ON price_history
FOR SELECT TO authenticated
USING (true);

-- Also allow public read access for the frontend
CREATE POLICY "Public can read price_history" ON price_history
FOR SELECT TO public
USING (true);
