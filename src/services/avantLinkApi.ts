
import { SYNC_CONFIG } from '../config/syncConfig';

export interface AvantLinkProduct {
  // Standard field names from AvantLink API
  lngProductId: string;
  strProductSKU: string;
  strProductName: string;
  strBrandName?: string;
  dblProductPrice: string;
  dblProductSalePrice?: string;
  strThumbnailImage?: string;
  strMediumImage?: string;
  strLargeImage?: string;
  strBuyURL: string;
  txtShortDescription?: string;
  txtLongDescription?: string;
  strDepartmentName?: string;
  strCategoryName?: string;
  strSubCategoryName?: string;
  strMerchantName: string;
  lngMerchantId: string;
  intSearchResultScore?: string;
}

export interface ApiResponse {
  products: AvantLinkProduct[];
  totalFound: number;
  hasMorePages: boolean;
}

export class AvantLinkApiService {
  private rateLimiter = new RateLimiter(SYNC_CONFIG.AVANTLINK.RATE_LIMIT.REQUESTS_PER_MINUTE);

  async searchProducts(params: {
    searchTerm: string;
    merchantId: number;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    resultsPerPage?: number;
  }): Promise<ApiResponse> {
    await this.rateLimiter.wait();

    const apiUrl = new URL(SYNC_CONFIG.AVANTLINK.BASE_URL);
    apiUrl.searchParams.set('module', 'ProductSearch');
    apiUrl.searchParams.set('affiliate_id', SYNC_CONFIG.AVANTLINK.AFFILIATE_ID);
    apiUrl.searchParams.set('search_term', params.searchTerm);
    apiUrl.searchParams.set('merchant_ids', params.merchantId.toString());
    apiUrl.searchParams.set('search_results_count', (params.resultsPerPage || 200).toString());
    apiUrl.searchParams.set('search_results_base', ((params.page || 1 - 1) * (params.resultsPerPage || 200)).toString());
    apiUrl.searchParams.set('output', 'json');

    if (params.priceMin !== undefined) {
      apiUrl.searchParams.set('search_price_minimum', params.priceMin.toString());
    }
    if (params.priceMax !== undefined) {
      apiUrl.searchParams.set('search_price_maximum', params.priceMax.toString());
    }

    const response = await this.fetchWithRetry(apiUrl.toString());
    const data = await response.json();

    return {
      products: Array.isArray(data) ? data : [],
      totalFound: Array.isArray(data) ? data.length : 0,
      hasMorePages: Array.isArray(data) && data.length === (params.resultsPerPage || 200)
    };
  }

  async fetchPriceHistory(sku: string, merchantId: number): Promise<any[]> {
    await this.rateLimiter.wait();

    const apiUrl = new URL(SYNC_CONFIG.AVANTLINK.BASE_URL);
    apiUrl.searchParams.set('module', 'ProductPriceCheck');
    apiUrl.searchParams.set('affiliate_id', SYNC_CONFIG.AVANTLINK.AFFILIATE_ID);
    apiUrl.searchParams.set('merchant_id', merchantId.toString());
    apiUrl.searchParams.set('sku', sku);
    apiUrl.searchParams.set('show_pricing_history', '1');
    apiUrl.searchParams.set('show_retail_price', '1');
    apiUrl.searchParams.set('output', 'xml');

    const response = await this.fetchWithRetry(apiUrl.toString());
    const xmlText = await response.text();
    
    return this.parseXMLPriceHistory(xmlText);
  }

  private async fetchWithRetry(url: string, maxRetries = SYNC_CONFIG.SYNC.MAX_RETRIES): Promise<Response> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = SYNC_CONFIG.SYNC.RETRY_DELAY_MS * attempt;
          console.log(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`API call failed after ${maxRetries} attempts: ${lastError!.message}`);
  }

  private parseXMLPriceHistory(xmlText: string): any[] {
    const priceHistory = [];
    
    try {
      if (xmlText.includes('No pricing history found') || xmlText.includes('Error:') || xmlText.length < 200) {
        return [];
      }

      const table1Regex = /<Table1>(.*?)<\/Table1>/gs;
      let match;
      
      while ((match = table1Regex.exec(xmlText)) !== null) {
        const tableContent = match[1];
        
        const dateMatch = tableContent.match(/<Date>(.*?)<\/Date>/);
        const retailPriceMatch = tableContent.match(/<Retail_Price>(.*?)<\/Retail_Price>/);
        const salePriceMatch = tableContent.match(/<Sale_Price>(.*?)<\/Sale_Price>/);
        
        if (dateMatch && retailPriceMatch && salePriceMatch) {
          const dateStr = dateMatch[1].trim();
          const retailPriceStr = retailPriceMatch[1].trim();
          const salePriceStr = salePriceMatch[1].trim();
          
          const retailPrice = parseFloat(retailPriceStr);
          const salePrice = parseFloat(salePriceStr);
          
          if (!isNaN(retailPrice) && !isNaN(salePrice) && retailPrice > 0 && salePrice > 0) {
            const recordedDate = dateStr.split(' ')[0];
            
            if (/^\d{4}-\d{2}-\d{2}$/.test(recordedDate)) {
              const isSale = salePrice < retailPrice;
              const discountPercent = isSale ? Math.round(((retailPrice - salePrice) / retailPrice) * 100) : 0;
              
              priceHistory.push({
                date: recordedDate,
                price: salePrice,
                is_sale: isSale,
                discount_percent: discountPercent
              });
            }
          }
        }
      }
      
      return priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    } catch (error) {
      console.error('Error parsing XML:', error);
      return [];
    }
  }
}

class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;

  constructor(maxRequestsPerMinute: number) {
    this.maxRequests = maxRequestsPerMinute;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

export const avantLinkApiService = new AvantLinkApiService();
