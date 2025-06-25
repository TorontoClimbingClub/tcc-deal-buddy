# Post-Migration Steps for TCC Deal Buddy Enhanced Features

After successfully running `npx supabase db push`, follow these steps:

## 1. Verify Database Setup

Run in Windows Terminal:
```bash
# Check if migration was applied
npx supabase db diff

# Should show no differences if successful
```

Or run the verification script in Supabase Dashboard SQL Editor:
```sql
-- Copy and run: /verify-database-setup.sql
```

## 2. Update TypeScript Types

Generate new types that include our enhanced schema:
```bash
# In Windows Terminal from project directory
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## 3. Deploy Edge Function (Optional - for daily sync)

```bash
# Deploy the daily sync function
npx supabase functions deploy daily-sync

# Set environment variables in Supabase Dashboard
# Go to Edge Functions > daily-sync > Settings
# Add these environment variables:
# AVANTLINK_AFFILIATE_ID=348445
# AVANTLINK_API_KEY=52917e7babaeaba80c5b73e275d42186
# AVANTLINK_WEBSITE_ID=406357
```

## 4. Test the New Schema

In Supabase Dashboard SQL Editor, test these queries:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'price_history', 'user_favorites', 'cart_items', 'sync_jobs');

-- Test current_deals view
SELECT * FROM current_deals LIMIT 1;

-- Test user_cart_summary view  
SELECT * FROM user_cart_summary LIMIT 1;
```

## 5. What's Ready for Implementation

After successful migration, you'll have:

✅ **Database Schema**
- 5 tables for enhanced functionality
- 2 views for optimized queries
- Row Level Security policies
- Performance indexes

✅ **Daily API Sync Infrastructure**
- Edge Function ready for deployment
- Sync job tracking
- Error monitoring

✅ **Enhanced Features Ready**
- User cart with savings calculations
- Historical price tracking
- User favorites system
- Real-time product data

## 6. Next Development Steps

1. **Cart Implementation** - Build UI components for cart functionality
2. **Historical Charts** - Create price history visualization
3. **User Favorites** - Add favorite/unfavorite buttons
4. **Daily Sync Setup** - Configure automated API sync
5. **Enhanced Analytics** - Build dashboard with savings metrics

## 7. Testing Commands

Use the Supabase manager for ongoing development:
```bash
# From WSL in project directory
node /mnt/ssd/Projects/claude/tools/supabase-manager.js status
node /mnt/ssd/Projects/claude/tools/supabase-manager.js studio
```

## 8. Troubleshooting

If you encounter issues:
- Check Supabase Dashboard logs
- Verify all tables were created
- Ensure RLS policies are active
- Test basic CRUD operations

The database is now ready for the enhanced TCC Deal Buddy features!