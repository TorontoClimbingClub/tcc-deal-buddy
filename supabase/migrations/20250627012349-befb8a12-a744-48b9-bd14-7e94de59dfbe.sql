
-- Add policy for anon role to insert price history records
CREATE POLICY "Anon can insert price_history" ON price_history
FOR INSERT TO anon
WITH CHECK (true);

-- Also allow anon role to update existing records
CREATE POLICY "Anon can update price_history" ON price_history
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Ensure anon role can read price history
CREATE POLICY "Anon can read price_history" ON price_history
FOR SELECT TO anon
USING (true);
