# AvantLink API Integration Setup - Merchant Sale Tracker

This guide explains how to set up the AvantLink API integration in your TCC Deal Buddy application for focused merchant sale tracking.

## Prerequisites

1. **AvantLink Affiliate Account**: You need an active AvantLink affiliate account
2. **Website Registration**: Your website must be registered and approved in AvantLink
3. **API Access**: Ensure your account has API access enabled

## Getting Your API Credentials

### Step 1: Get Your API Credentials
1. Log into your AvantLink account
2. Navigate to **Account** → **API Keys** (or similar section)
3. You'll see two important values:
   - **Affiliate ID**: Your unique affiliate identifier (e.g., 348445)
   - **API Authorization Key**: A long string (e.g., 52917e7babaeaba80c5b73e275d42186)

### Step 3: Find Merchant IDs for Tracking
1. Go to **Tools** → **Link Locator**
2. Search for merchants you want to track for sale items
3. Note down the **Merchant ID** for each merchant (usually 4-5 digit numbers)
4. You can track up to 2 merchants for focused monitoring

## Configuration

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your credentials:
   ```env
   VITE_AVANTLINK_AFFILIATE_ID=348445
   VITE_AVANTLINK_API_KEY=52917e7babaeaba80c5b73e275d42186
   VITE_AVANTLINK_CUSTOM_TRACKING_CODE=tcc-deal-buddy
   ```

3. Replace with your actual values:
   - Use your actual **Affiliate ID** (like 348445)
   - Use your actual **API Authorization Key** (the long string)
   - Keep the custom tracking code or change it to your preference

### Important Notes

- **Never commit your `.env` file** to version control
- The `.env.example` file shows the required format without real credentials
- Environment variables must start with `VITE_` to be accessible in the React app
- Restart your development server after changing environment variables

## Testing the Integration

### Step 1: Start the Development Server
```bash
npm run dev
```

### Step 2: Configure Merchants
1. Open the application and go to the **Merchant Setup** tab
2. Add your target merchant IDs (the ones you found in Step 3 above)
3. Enter both the Merchant ID and a friendly name for each merchant
4. You can add up to 2 merchants for focused tracking

### Step 3: Test Sale Tracking
1. Switch to the **Sale Tracker** tab
2. Click "Find Sale Items" to search for current deals
3. Use "Clearance Items" and "Discounted Items" for specific searches
4. Check browser console for any API errors

## API Rate Limits

AvantLink has the following rate limits for the ProductSearch API:
- **3,600 requests per hour**
- **15,000 requests per day**

The application automatically handles:
- Error responses from the API
- Loading states during requests
- Fallback to placeholder images

## Features Implemented

### Merchant Sale Tracking
- **Focused Monitoring**: Track up to 2 specific merchants for deals
- **Sale-Only Focus**: Automatically filters for discounted items
- **Merchant Configuration**: Easy setup interface for target merchants
- **Real-Time Tracking**: Live search for current sale items

### Sale Discovery
- **Find Sale Items**: Primary search for all current deals
- **Clearance Search**: Specific search for clearance inventory
- **Discount Search**: General discounted product discovery
- **Sort by Discount**: Products ordered by highest discounts first

### Product Display
- **Sale-Focused Cards**: Prominent display of discount percentages
- **Merchant Information**: Clear merchant identification
- **Affiliate Links**: Proper commission tracking for all clicks
- **Responsive Design**: Optimized for desktop and mobile

### Smart Configuration
- **Merchant Setup Tab**: Dedicated interface for merchant management
- **API Validation**: Automatic credential verification
- **Error Recovery**: Graceful handling of API issues
- **Usage Guidance**: Built-in help for finding merchant IDs

## Troubleshooting

### Common Issues

1. **"AvantLink API not configured" warning**
   - Check that your `.env` file exists and has the correct variables
   - Ensure variable names start with `VITE_`
   - Restart the development server

2. **"Setup Required" message on Sale Tracker tab**
   - Go to the Merchant Setup tab
   - Add at least one merchant ID and name
   - Merchant IDs should be 4-5 digit numbers from AvantLink

3. **No sale items found**
   - Verify your merchant IDs are correct and active
   - Some merchants may not have current sales
   - Try different search terms like "clearance" or "discount"

4. **"Failed to fetch products" error**
   - Verify your Affiliate ID and Website ID are correct
   - Check that your AvantLink account has API access
   - Ensure your website is approved in AvantLink
   - Confirm merchant IDs are valid and you're approved for those merchants

### Debug Mode

To see detailed API responses, open browser developer tools:
1. Go to the **Console** tab
2. Look for AvantLink API logs
3. Check the **Network** tab for API requests

## Next Steps

Once the basic integration is working, you can enhance it with:

1. **Product Details Modal**: Enhanced product information
2. **Favorites/Wishlist**: Save products for later
3. **Advanced Filtering**: More filter options
4. **Pagination**: Handle large result sets
5. **Caching**: Reduce API calls with local storage
6. **Analytics**: Track user interactions

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your AvantLink account status
3. Review the API documentation in the knowledge base
4. Contact AvantLink support for account-specific issues