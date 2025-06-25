# AvantLink API Integration Setup

This guide explains how to set up the AvantLink API integration in your TCC Deal Buddy application.

## Prerequisites

1. **AvantLink Affiliate Account**: You need an active AvantLink affiliate account
2. **Website Registration**: Your website must be registered and approved in AvantLink
3. **API Access**: Ensure your account has API access enabled

## Getting Your API Credentials

### Step 1: Get Your Affiliate ID
1. Log into your AvantLink account
2. Navigate to **Account** → **Account Settings**
3. Your **Affiliate ID** will be displayed in your account information

### Step 2: Get Your Website ID
1. Go to **Tools** → **Websites**
2. Find your website in the list
3. The **Website ID** is shown in the website details

## Configuration

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your credentials:
   ```env
   VITE_AVANTLINK_AFFILIATE_ID=your_affiliate_id_here
   VITE_AVANTLINK_WEBSITE_ID=your_website_id_here
   VITE_AVANTLINK_CUSTOM_TRACKING_CODE=tcc-deal-buddy
   ```

3. Replace the placeholder values:
   - `your_affiliate_id_here` → Your actual AvantLink Affiliate ID
   - `your_website_id_here` → Your actual AvantLink Website ID
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

### Step 2: Verify Configuration
1. Open the application in your browser
2. If configured correctly, you should see:
   - Quick search buttons (Electronics, Clothing, etc.)
   - No "API not configured" warning messages
   - Products should load when searching

### Step 3: Test API Calls
1. Try the quick search buttons
2. Use the search bar to look for specific products
3. Check browser console for any API errors

## API Rate Limits

AvantLink has the following rate limits for the ProductSearch API:
- **3,600 requests per hour**
- **15,000 requests per day**

The application automatically handles:
- Error responses from the API
- Loading states during requests
- Fallback to placeholder images

## Features Implemented

### Product Search
- **Text Search**: Search products by name, description, brand
- **Category Filtering**: Filter by product categories
- **Price Filtering**: Filter by price ranges
- **Merchant Filtering**: Filter by specific merchants
- **Quick Search**: Pre-defined category buttons

### Product Display
- **Product Cards**: Show image, name, price, merchant, description
- **Discount Badges**: Display sale percentages
- **Affiliate Links**: Proper tracking for commissions
- **Responsive Grid**: Works on desktop and mobile

### Error Handling
- **API Errors**: User-friendly error messages
- **Missing Images**: Automatic fallback to placeholder
- **Loading States**: Visual feedback during API calls
- **Configuration Checks**: Warns if API credentials are missing

## Troubleshooting

### Common Issues

1. **"AvantLink API not configured" warning**
   - Check that your `.env` file exists and has the correct variables
   - Ensure variable names start with `VITE_`
   - Restart the development server

2. **"Failed to fetch products" error**
   - Verify your Affiliate ID and Website ID are correct
   - Check that your AvantLink account has API access
   - Ensure your website is approved in AvantLink

3. **No products returned**
   - Try different search terms
   - Some categories may have limited products
   - Check the browser console for API response details

4. **Images not loading**
   - AvantLink image URLs may sometimes be broken
   - The app automatically falls back to placeholder images
   - This is normal and expected behavior

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