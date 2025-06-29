
import { supabase } from '@/integrations/supabase/client';
import { avantLinkApiService, AvantLinkProduct } from './avantLinkApi';
import { SYNC_CONFIG } from '../config/syncConfig';

export interface SyncProgress {
  totalProducts: number;
  processedProducts: number;
  successfulProducts: number;
  failedProducts: number;
  apiCallsUsed: number;
  priceHistoryEntries: number;
  currentPhase: string;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

export interface SyncResult {
  success: boolean;
  progress: SyncProgress;
  errors: string[];
  syncJobId: string;
}

export class UnifiedSyncService {
  private progress: SyncProgress = {
    totalProducts: 0,
    processedProducts: 0,
    successfulProducts: 0,
    failedProducts: 0,
    apiCallsUsed: 0,
    priceHistoryEntries: 0,
    currentPhase: 'Initializing',
    timeElapsed: 0,
    estimatedTimeRemaining: 0
  };

  private startTime = 0;
  private errors: string[] = [];
  private syncJobId = '';

  async performComprehensiveSync(options: {
    merchantIds?: number[];
    maxProducts?: number;
    includePriceHistory?: boolean;
  } = {}): Promise<SyncResult> {
    this.startTime = Date.now();
    this.errors = [];
    
    try {
      // Create sync job record
      const syncJob = await this.createSyncJob('comprehensive_sync');
      this.syncJobId = syncJob.id;

      const merchantIds = options.merchantIds || [SYNC_CONFIG.MERCHANTS.MEC.id];
      const maxProducts = options.maxProducts || SYNC_CONFIG.SYNC.MAX_PRODUCTS_PER_SYNC;

      console.log(`🚀 Starting comprehensive sync for merchants: ${merchantIds.join(', ')}`);
      console.log(`📊 Max products: ${maxProducts}, Include price history: ${options.includePriceHistory}`);

      const allProducts: TransformedProduct[] = [];

      // Process each merchant
      for (const merchantId of merchantIds) {
        this.progress.currentPhase = `Processing merchant ${merchantId}`;
        console.log(`\n🏪 Processing merchant ${merchantId}`);

        const merchantProducts = await this.syncMerchantProducts(merchantId, maxProducts);
        allProducts.push(...merchantProducts);

        if (allProducts.length >= maxProducts) {
          console.log(`📊 Reached maximum product limit (${maxProducts}), stopping`);
          break;
        }
      }

      // Save products to database
      if (allProducts.length > 0) {
        this.progress.currentPhase = 'Saving products to database';
        await this.saveProductsToDatabase(allProducts);
        
        // Create price history if requested
        if (options.includePriceHistory) {
          this.progress.currentPhase = 'Creating price history';
          await this.createPriceHistory(allProducts);
        }
      }

      // Complete sync job
      await this.completeSyncJob(this.syncJobId, true);

      this.progress.currentPhase = 'Completed';
      console.log(`🎉 Comprehensive sync completed: ${this.progress.successfulProducts} products synced`);

      return {
        success: true,
        progress: this.calculateProgress(),
        errors: this.errors,
        syncJobId: this.syncJobId
      };

    } catch (error) {
      await this.completeSyncJob(this.syncJobId, false, error.message);
      this.errors.push(error.message);
      
      return {
        success: false,
        progress: this.calculateProgress(),
        errors: this.errors,
        syncJobId: this.syncJobId
      };
    }
  }

  private async syncMerchantProducts(merchantId: number, maxProducts: number): Promise<TransformedProduct[]> {
    const merchantProducts: TransformedProduct[] = [];
    
    // Process each search strategy
    for (const strategy of SYNC_CONFIG.SEARCH_STRATEGIES) {
      if (merchantProducts.length >= maxProducts) break;

      console.log(`\n🔍 Processing search: ${strategy.description} (${strategy.term})`);

      try {
        // Try basic search first
        const basicResults = await avantLinkApiService.searchProducts({
          searchTerm: strategy.term,
          merchantId,
          resultsPerPage: 200
        });

        this.progress.apiCallsUsed++;

        console.log(`📦 Basic search returned ${basicResults.products.length} products`);

        let searchResults = basicResults.products;

        // If we hit the 200-result limit, use price range subdivision
        if (basicResults.products.length === 200) {
          console.log(`🔄 Search hit limit, subdividing by price ranges`);
          searchResults = await this.searchWithPriceSubdivision(strategy.term, merchantId);
        }

        // Transform and deduplicate products
        const transformedProducts = searchResults
          .map(product => this.transformProduct(product))
          .filter(Boolean) as TransformedProduct[];

        const newProducts = transformedProducts.filter(p => 
          !merchantProducts.some(existing => existing.sku === p.sku)
        );

        merchantProducts.push(...newProducts);
        this.progress.processedProducts += newProducts.length;

        console.log(`✅ Search ${strategy.term}: ${newProducts.length} unique products`);

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.AVANTLINK.RATE_LIMIT.BATCH_DELAY_MS));

      } catch (error) {
        console.error(`❌ Error processing search ${strategy.term}:`, error);
        this.errors.push(`Search ${strategy.term}: ${error.message}`);
      }
    }

    return merchantProducts;
  }

  private async searchWithPriceSubdivision(searchTerm: string, merchantId: number): Promise<AvantLinkProduct[]> {
    const allResults: AvantLinkProduct[] = [];

    for (const priceRange of SYNC_CONFIG.SYNC.PRICE_RANGES) {
      try {
        const rangeResults = await avantLinkApiService.searchProducts({
          searchTerm,
          merchantId,
          priceMin: priceRange.min,
          priceMax: priceRange.max,
          resultsPerPage: 200
        });

        this.progress.apiCallsUsed++;
        allResults.push(...rangeResults.products);

        console.log(`💰 Range ${priceRange.label}: ${rangeResults.products.length} products`);

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.AVANTLINK.RATE_LIMIT.REQUEST_DELAY_MS));

      } catch (error) {
        console.error(`❌ Error in price range ${priceRange.label}:`, error);
        this.errors.push(`Price range ${priceRange.label}: ${error.message}`);
      }
    }

    return allResults;
  }

  private transformProduct(product: AvantLinkProduct): TransformedProduct | null {
    if (!product.strProductSKU || !product.lngMerchantId) {
      return null;
    }

    const salePrice = product.dblProductSalePrice ? parseFloat(product.dblProductSalePrice) : null;
    const retailPrice = product.dblProductPrice ? parseFloat(product.dblProductPrice) : null;
    
    let discountPercent = null;
    if (salePrice && retailPrice && salePrice < retailPrice) {
      discountPercent = Math.round(((retailPrice - salePrice) / retailPrice) * 100);
    }

    return {
      sku: product.strProductSKU,
      merchant_id: parseInt(product.lngMerchantId),
      merchant_name: product.strMerchantName || '',
      name: product.strProductName || '',
      brand_name: product.strBrandName || null,
      sale_price: salePrice,
      retail_price: retailPrice,
      discount_percent: discountPercent,
      discount_amount: null,
      image_url: product.strThumbnailImage || product.strMediumImage || null,
      buy_url: product.strBuyURL || null,
      description: product.txtLongDescription || product.txtShortDescription || null,
      category: product.strCategoryName || null,
      subcategory: product.strSubCategoryName || null,
      sync_priority: 1,
      availability_score: 1.0
    };
  }

  private async saveProductsToDatabase(products: TransformedProduct[]): Promise<void> {
    console.log(`💾 Saving ${products.length} products to database...`);

    const batchSize = SYNC_CONFIG.SYNC.BATCH_SIZE;
    let successCount = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('products')
          .upsert(batch, {
            onConflict: 'sku,merchant_id,last_sync_date'
          });

        if (error) {
          throw error;
        }

        successCount += batch.length;
        this.progress.successfulProducts = successCount;

        console.log(`✅ Saved batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)} (${batch.length} products)`);

      } catch (error) {
        console.error(`❌ Error saving batch:`, error);
        this.errors.push(`Database batch save: ${error.message}`);
        this.progress.failedProducts += batch.length;
      }
    }

    console.log(`📊 Database save completed: ${successCount}/${products.length} products saved`);
  }

  private async createPriceHistory(products: TransformedProduct[]): Promise<void> {
    const priceHistoryRecords = products
      .filter(p => p.sale_price || p.retail_price)
      .map(p => ({
        product_sku: p.sku,
        merchant_id: p.merchant_id,
        price: p.sale_price || p.retail_price || 0,
        is_sale: !!p.sale_price && p.sale_price < (p.retail_price || Infinity),
        discount_percent: p.discount_percent || 0
      }));

    if (priceHistoryRecords.length > 0) {
      try {
        const { error } = await supabase
          .from('price_history')
          .upsert(priceHistoryRecords, {
            onConflict: 'product_sku,merchant_id,recorded_date'
          });

        if (error) {
          throw error;
        }

        this.progress.priceHistoryEntries = priceHistoryRecords.length;
        console.log(`📈 Created ${priceHistoryRecords.length} price history records`);

      } catch (error) {
        console.error(`❌ Error creating price history:`, error);
        this.errors.push(`Price history creation: ${error.message}`);
      }
    }
  }

  private async createSyncJob(jobType: string): Promise<any> {
    const { data, error } = await supabase
      .from('sync_jobs')
      .insert({
        job_type: jobType,
        status: 'running'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sync job: ${error.message}`);
    }

    return data;
  }

  private async completeSyncJob(jobId: string, success: boolean, errorMessage?: string): Promise<void> {
    await supabase
      .from('sync_jobs')
      .update({
        status: success ? 'completed' : 'failed',
        records_processed: this.progress.processedProducts,
        api_calls_used: this.progress.apiCallsUsed,
        products_added: this.progress.successfulProducts,
        price_history_entries: this.progress.priceHistoryEntries,
        error_message: errorMessage || null,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }

  private calculateProgress(): SyncProgress {
    const elapsed = Date.now() - this.startTime;
    const rate = this.progress.processedProducts / (elapsed / 60000); // products per minute
    const remaining = this.progress.totalProducts - this.progress.processedProducts;
    const estimatedTimeRemaining = rate > 0 ? (remaining / rate) * 60000 : 0;

    return {
      ...this.progress,
      timeElapsed: elapsed,
      estimatedTimeRemaining
    };
  }

  getProgress(): SyncProgress {
    return this.calculateProgress();
  }
}

interface TransformedProduct {
  sku: string;
  merchant_id: number;
  merchant_name: string;
  name: string;
  brand_name?: string;
  sale_price?: number;
  retail_price?: number;
  discount_percent?: number;
  discount_amount?: number;
  image_url?: string;
  buy_url?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  sync_priority: number;
  availability_score: number;
}

export const unifiedSyncService = new UnifiedSyncService();
