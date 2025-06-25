// AvantLink API Service
// Handles all interactions with the AvantLink affiliate API

export interface AvantLinkProduct {
  'Product Id': string;
  'Product Name': string;
  'Description': string;
  'Abbreviated Description': string;
  'Short Description': string;
  'Retail Price': string;
  'Sale Price': string;
  'Medium Image': string;
  'Large Image': string;
  'Thumbnail Image': string;
  'Buy URL': string;
  'Product URL': string;
  'Merchant Name': string;
  'Category Name': string;
  'Department Name': string;
  'Brand Name': string;
  'Product SKU': string;
  'Match Score': string;
  'Price Discount Percent': string;
  'Price Discount Amount': string;
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
  priceMin?: number;
  priceMax?: number;
  onSaleOnly?: boolean;
  sortBy?: 'Retail Price' | 'Product Name' | 'Merchant Name' | 'Match Score';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  resultsPerPage?: number;
}

class AvantLinkService {
  private baseUrl = 'https://classic.avantlink.com/api.php';
  private affiliateId: string;
  private websiteId: string;
  private customTrackingCode?: string;

  constructor() {
    this.affiliateId = import.meta.env.VITE_AVANTLINK_AFFILIATE_ID;
    this.websiteId = import.meta.env.VITE_AVANTLINK_WEBSITE_ID;
    this.customTrackingCode = import.meta.env.VITE_AVANTLINK_CUSTOM_TRACKING_CODE;

    if (!this.affiliateId || !this.websiteId) {
      console.warn('AvantLink API credentials not configured. Please set VITE_AVANTLINK_AFFILIATE_ID and VITE_AVANTLINK_WEBSITE_ID environment variables.');
    }
  }

  /**
   * Search for products using the AvantLink ProductSearch API
   */
  async searchProducts(params: ProductSearchParams): Promise<AvantLinkApiResponse> {
    if (!this.affiliateId || !this.websiteId) {
      throw new Error('AvantLink API credentials not configured');
    }

    const searchParams = new URLSearchParams({
      module: 'ProductSearch',
      affiliate_id: this.affiliateId,
      website_id: this.websiteId,
      search_term: params.searchTerm,
      output: 'json',
      search_results_count: (params.resultsPerPage || 20).toString(),
      search_results_base: ((params.page || 1) - 1) * (params.resultsPerPage || 20)).toString(),
    });

    // Add optional search parameters
    if (params.category && params.category !== 'all') {
      searchParams.append('search_category', params.category);
    }

    if (params.priceMin) {
      searchParams.append('search_price_minimum', params.priceMin.toString());
    }

    if (params.priceMax) {
      searchParams.append('search_price_maximum', params.priceMax.toString());
    }

    if (params.onSaleOnly) {
      searchParams.append('search_on_sale_only', '1');
    }

    if (params.sortBy && params.sortOrder) {
      searchParams.append('search_results_sort_order', `${params.sortBy}|${params.sortOrder}`);
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

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`AvantLink API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the API response to our expected format
      return this.transformApiResponse(data, params);
    } catch (error) {
      console.error('Error fetching from AvantLink API:', error);
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
    return !!(this.affiliateId && this.websiteId);
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