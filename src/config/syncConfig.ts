
export const SYNC_CONFIG = {
  // API Configuration
  AVANTLINK: {
    AFFILIATE_ID: '348445',
    BASE_URL: 'https://classic.avantlink.com/api.php',
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 60,
      BATCH_DELAY_MS: 1000,
      REQUEST_DELAY_MS: 500
    }
  },

  // Target Merchants
  MERCHANTS: {
    MEC: { id: 18557, name: 'MEC Mountain Equipment Company Ltd', priority: 1 }
  },

  // Sync Parameters
  SYNC: {
    BATCH_SIZE: 20,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 2000,
    MAX_PRODUCTS_PER_SYNC: 50000,
    PRICE_RANGES: [
      { min: 0, max: 25, label: 'Under $25' },
      { min: 25, max: 50, label: '$25-50' },
      { min: 50, max: 100, label: '$50-100' },
      { min: 100, max: 200, label: '$100-200' },
      { min: 200, max: 500, label: '$200-500' },
      { min: 500, max: 1000, label: '$500-1000' },
      { min: 1000, max: 9999, label: '$1000+' }
    ]
  },

  // Search Strategies
  SEARCH_STRATEGIES: [
    { term: '*', description: 'All products' },
    { term: 'jacket', description: 'Jackets' },
    { term: 'clothing', description: 'Clothing items' },
    { term: 'outdoor', description: 'Outdoor gear' },
    { term: 'equipment', description: 'Equipment' }
  ]
} as const;
