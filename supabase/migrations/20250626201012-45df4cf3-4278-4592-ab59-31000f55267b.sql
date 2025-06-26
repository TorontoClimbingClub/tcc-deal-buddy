
-- Drop ALL existing policies on price_history table
DROP POLICY IF EXISTS "Allow public read access to price_history" ON price_history;
DROP POLICY IF EXISTS "Allow authenticated read access to price_history" ON price_history;
DROP POLICY IF EXISTS "Allow service role full access to price_history" ON price_history;
DROP POLICY IF EXISTS "Service role can insert price_history" ON price_history;
DROP POLICY IF EXISTS "Service role can manage price_history" ON price_history;
DROP POLICY IF EXISTS "Users can read price_history" ON price_history;
DROP POLICY IF EXISTS "Service role can read products" ON price_history;

-- Now create the correct policies
CREATE POLICY "Allow service role full access to price_history"
ON price_history
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public read access to price_history"
ON price_history
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated read access to price_history"
ON price_history
FOR SELECT
TO authenticated
USING (true);
