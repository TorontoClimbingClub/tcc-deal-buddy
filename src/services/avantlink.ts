// AvantLink API Service
// Handles all interactions with the AvantLink affiliate API

export interface AvantLinkProduct {
  // Actual API field names from AvantLink
  lngProductId: string;
  strProductSKU: string;
  strProductName: string;
  strBrandName: string;
  dblProductPrice: string;
  dblProductSalePrice: string;
  txtShortDescription: string;
  txtLongDescription: string;
  strThumbnailImage: string;
  strMediumImage: string;
  strLargeImage: string;
  strBuyURL: string;
  strDepartmentName: string;
  strCategoryName: string;
  intSearchResultScore: string;
  txtAbbreviatedDescription: string;
  strMerchantName: string;
  strProductURL: string;
  dblProductOnSalePercent: string;
  dblProductOnSaleAmount: string;
  
  // Legacy field names for backward compatibility (may not exist)
  'Product Id'?: string;
  'Product Name'?: string;
  'Description'?: string;
  'Abbreviated Description'?: string;
  'Short Description'?: string;
  'Retail Price'?: string;
  'Sale Price'?: string;
  'Medium Image'?: string;
  'Large Image'?: string;
  'Thumbnail Image'?: string;
  'Buy URL'?: string;
  'Product URL'?: string;
  'Merchant Name'?: string;
  'Category Name'?: string;
  'Department Name'?: string;
  'Brand Name'?: string;
  'Product SKU'?: string;
  'Match Score'?: string;
  'Price Discount Percent'?: string;
  'Price Discount Amount'?: string;
}

export interface AvantLinkApiResponse {
  products: AvantLinkProduct[];
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
}

export interface ProductSearchParams {
  searchTerm: string;
  category?: string;
  merchant?: string;
  merchantIds?: string[]; // Array of specific merchant IDs to filter by
  priceMin?: number;
  priceMax?: number;
  onSaleOnly?: boolean;
  sortBy?: 'Retail Price' | 'Product Name' | 'Merchant Name' | 'Match Score' | 'Price Discount Percent';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  resultsPerPage?: number;
}

// Input validation utilities
const validateSearchParams = (params: ProductSearchParams): ProductSearchParams => {
  const validated = { ...params };

  // Validate and sanitize search term
  if (!validated.searchTerm || typeof validated.searchTerm !== 'string') {
    throw new Error('Search term is required and must be a string');
  }
  validated.searchTerm = validated.searchTerm.trim().slice(0, 100); // Limit to 100 chars

  // Validate price ranges
  if (validated.priceMin !== undefined) {
    validated.priceMin = Math.max(0, Number(validated.priceMin) || 0);
  }
  if (validated.priceMax !== undefined) {
    validated.priceMax = Math.max(0, Number(validated.priceMax) || 10000);
    if (validated.priceMin && validated.priceMax < validated.priceMin) {
      validated.priceMax = validated.priceMin;
    }
  }

  // Validate pagination
  if (validated.page !== undefined) {
    validated.page = Math.max(1, Math.min(100, Number(validated.page) || 1)); // Max 100 pages
  }
  if (validated.resultsPerPage !== undefined) {
    validated.resultsPerPage = Math.max(1, Math.min(100, Number(validated.resultsPerPage) || 20)); // Max 100 results per page
  }

  // Validate merchant IDs
  if (validated.merchantIds) {
    validated.merchantIds = validated.merchantIds
      .filter(id => typeof id === 'string' && id.trim().length > 0)
      .slice(0, 10); // Max 10 merchant IDs
  }

  return validated;
};

class AvantLinkService {
  private baseUrl = 'https://www.avantlink.com/api.php';
  private affiliateId: string;
  private apiKey: string;
  private websiteId: string;
  private customTrackingCode?: string;

  constructor() {
    this.affiliateId = import.meta.env.VITE_AVANTLINK_AFFILIATE_ID;
    this.apiKey = import.meta.env.VITE_AVANTLINK_API_KEY;
    this.websiteId = import.meta.env.VITE_AVANTLINK_WEBSITE_ID;
    this.customTrackingCode = import.meta.env.VITE_AVANTLINK_CUSTOM_TRACKING_CODE;

    if (!this.affiliateId || !this.apiKey) {
      console.warn('AvantLink API credentials not configured. Please set VITE_AVANTLINK_AFFILIATE_ID, VITE_AVANTLINK_API_KEY, and VITE_AVANTLINK_WEBSITE_ID environment variables.');
    }
  }

  /**
   * Search for products using the AvantLink ProductSearch API
   */
  async searchProducts(params: ProductSearchParams): Promise<AvantLinkApiResponse> {
    if (!this.affiliateId || !this.apiKey || !this.websiteId) {
      throw new Error('AvantLink API credentials not configured');
    }

    // Validate input parameters
    const validatedParams = validateSearchParams(params);

    const searchParams = new URLSearchParams({
      module: 'ProductSearch',
      affiliate_id: this.affiliateId,
      auth_key: this.apiKey,
      website_id: this.websiteId,
      search_term: validatedParams.searchTerm,
      output: 'json',
      search_results_count: (validatedParams.resultsPerPage || 20).toString(),
      search_results_base: (((validatedParams.page || 1) - 1) * (validatedParams.resultsPerPage || 20)).toString(),
    });

    // Add optional search parameters
    if (validatedParams.category && validatedParams.category !== 'all') {
      searchParams.append('search_category', validatedParams.category);
    }

    // Add merchant ID filtering if specified
    if (validatedParams.merchantIds && validatedParams.merchantIds.length > 0) {
      searchParams.append('merchant_ids', validatedParams.merchantIds.join(','));
    }

    if (validatedParams.priceMin) {
      searchParams.append('search_price_minimum', validatedParams.priceMin.toString());
    }

    if (validatedParams.priceMax) {
      searchParams.append('search_price_maximum', validatedParams.priceMax.toString());
    }

    if (validatedParams.onSaleOnly) {
      searchParams.append('search_on_sale_only', '1');
    }

    if (validatedParams.sortBy && validatedParams.sortOrder) {
      searchParams.append('search_results_sort_order', `${validatedParams.sortBy}|${validatedParams.sortOrder}`);
    }

    if (this.customTrackingCode) {
      searchParams.append('custom_tracking_code', this.customTrackingCode);
    }

    // Specify which fields we want in the response
    const searchResultsFields = [
      'Product Id',
      'Product Name', 
      'Description',
      'Abbreviated Description',
      'Short Description',
      'Retail Price',
      'Sale Price', 
      'Medium Image',
      'Large Image',
      'Thumbnail Image',
      'Buy URL',
      'Product URL',
      'Merchant Name',
      'Category Name',
      'Department Name',
      'Brand Name',
      'Product SKU',
      'Match Score',
      'Price Discount Percent',
      'Price Discount Amount'
    ].join('|');

    searchParams.append('search_results_fields', searchResultsFields);

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    // Only log in development mode without sensitive data
    if (import.meta.env.DEV) {
      console.log('🚀 AvantLink API Request initiated');
      console.log('📋 Search term:', validatedParams.searchTerm);
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'TCC-Deal-Buddy/1.0',
        }
      });

      clearTimeout(timeoutId);
      
      if (import.meta.env.DEV) {
        console.log('📡 API Response status:', response.status, response.statusText);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`AvantLink API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (import.meta.env.DEV) {
        console.log('✅ API Response received with', Array.isArray(data) ? data.length : 'unknown', 'items');
      }
      
      // Transform the API response to our expected format
      const result = this.transformApiResponse(data, validatedParams);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ Request timeout: AvantLink API took too long to respond');
        throw new Error('Request timeout - please try again');
      }
      console.error('💥 Error fetching from AvantLink API:', error);
      throw error;
    }
  }

  /**
   * Get popular products (using a generic search term)
   */
  async getPopularProducts(category?: string): Promise<AvantLinkApiResponse> {
    return this.searchProducts({
      searchTerm: category || 'popular',
      sortBy: 'Match Score',
      sortOrder: 'desc',
      resultsPerPage: 20
    });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, page = 1): Promise<AvantLinkApiResponse> {
    return this.searchProducts({
      searchTerm: category,
      category,
      page,
      resultsPerPage: 20,
      sortBy: 'Match Score',
      sortOrder: 'desc'
    });
  }

  /**
   * Get sale/discounted products
   */
  async getSaleProducts(searchTerm = 'sale'): Promise<AvantLinkApiResponse> {
    return this.searchProducts({
      searchTerm,
      onSaleOnly: true,
      sortBy: 'Retail Price',
      sortOrder: 'asc',
      resultsPerPage: 20
    });
  }

  /**
   * Get sale products from specific merchants
   */
  async getSaleProductsByMerchants(merchantIds: string[], searchTerm = 'sale'): Promise<AvantLinkApiResponse> {
    return this.searchProducts({
      searchTerm,
      merchantIds,
      onSaleOnly: true,
      sortBy: 'Price Discount Percent',
      sortOrder: 'desc',
      resultsPerPage: 50
    });
  }

  /**
   * Transform AvantLink API response to our internal format
   */
  private transformApiResponse(apiData: any, params: ProductSearchParams): AvantLinkApiResponse {
    // Handle different possible response formats from AvantLink
    let products: AvantLinkProduct[] = [];
    
    if (Array.isArray(apiData)) {
      products = apiData;
    } else if (apiData.data && Array.isArray(apiData.data)) {
      products = apiData.data;
    } else if (apiData.products && Array.isArray(apiData.products)) {
      products = apiData.products;
    } else {
      console.warn('Unexpected AvantLink API response format:', apiData);
      products = [];
    }

    return {
      products,
      totalResults: products.length,
      currentPage: params.page || 1,
      resultsPerPage: params.resultsPerPage || 20
    };
  }

  /**
   * Check if API credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.affiliateId && this.apiKey && this.websiteId);
  }

  /**
   * Test API connection with a simple search
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing AvantLink API connection...');
      const result = await this.searchProducts({
        searchTerm: 'test',
        resultsPerPage: 1
      });
      console.log('✅ API connection test successful!', result);
      return true;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get available categories (this would need to be enhanced with actual AvantLink categories)
   */
  getAvailableCategories(): string[] {
    return [
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Sports & Outdoors',
      'Health & Beauty',
      'Books',
      'Toys & Games',
      'Automotive',
      'Tools',
      'Food & Beverages'
    ];
  }
}

// Export a singleton instance
export const avantLinkService = new AvantLinkService();
export default avantLinkService;
