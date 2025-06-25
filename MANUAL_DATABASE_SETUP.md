# TCC Deal Buddy - Manual Database Setup Guide

Since the Supabase CLI requires authentication that I can't provide interactively, here's the manual setup process:

## Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard/project/owtcaztrzujjuwwuldhl
   - Navigate to **SQL Editor**

2. **Execute the Migration**
   - Copy the entire contents of `/mnt/ssd/Projects/tcc-deal-buddy/supabase/migrations/20250625000001_create_deal_intelligence_schema.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see 5 new tables:
     - `products`
     - `price_history`
     - `user_favorites`
     - `cart_items`
     - `sync_jobs`

4. **Check Views**
   - In SQL Editor, run: `SELECT * FROM current_deals LIMIT 1;`
   - Should work without errors

## Option 2: CLI Setup (Windows Terminal)

If you want to use the CLI, run these commands in Windows Terminal:

```bash
# Navigate to project
cd /mnt/c/Users/MateoGonzales/tcc-deal-buddy

# Login to Supabase (opens browser)
npx supabase login

# Link the project
npx supabase link --project-ref owtcaztrzujjuwwuldhl

# Push the migration
npx supabase db push
```

## What the Migration Creates

### Tables:
1. **products** - Daily sync of sale items from AvantLink API
2. **price_history** - Historical price tracking for trend analysis
3. **user_favorites** - User-selected products for monitoring
4. **cart_items** - User shopping cart with savings calculations
5. **sync_jobs** - Daily API operation monitoring

### Views:
1. **current_deals** - Today's sale items with calculated discount percentages
2. **user_cart_summary** - Aggregated cart totals and savings per user

### Security:
- Row Level Security (RLS) enabled on user-specific tables
- Proper indexes for performance
- Foreign key constraints for data integrity

## After Setup

Once the database schema is created, you can:

1. **Test the Schema**
   ```sql
   -- In Supabase SQL Editor
   SELECT COUNT(*) FROM products;
   SELECT * FROM current_deals LIMIT 5;
   ```

2. **Update TypeScript Types**
   ```bash
   # From project directory
   npx supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

3. **Deploy Edge Function** (for daily sync)
   ```bash
   npx supabase functions deploy daily-sync
   ```

## Verification Checklist

- [ ] 5 tables created successfully
- [ ] 2 views working
- [ ] RLS policies active
- [ ] Indexes created
- [ ] No errors in SQL execution

After completing the database setup, the enhanced cart and historical price tracking features will be ready for implementation!