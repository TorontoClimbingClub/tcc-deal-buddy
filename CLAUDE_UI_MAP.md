# CLAUDE UI MAP
*Auto-generated component mapping for precise UI editing*

**Last Updated:** 2025-06-26T16:07:27.550Z
**Project:** tcc-deal-buddy
**Components Scanned:** 61

## 🗺️ COMPONENT HIERARCHY

### 📁 src/components/

#### Header
**File:** `src/components/Header.tsx`
**Lines:** 76

**Key Elements:**
- **HeaderProps** (line 12) - `headerprops`
  - Context: `const Header: React.FC<HeaderProps> = ({`
- **Clock** (line 27) - `clock`
  - Context: `<Clock className="w-4 h-4" />`
- **Target** (line 42) - `target`
  - Context: `<Target className="w-8 h-8 text-blue-200" />`
- **TrendingUp** (line 54) - `trendingup`
  - Context: `<TrendingUp className="w-8 h-8 text-green-300" />`
- **Zap** (line 66) - `zap`
  - Context: `<Zap className="w-8 h-8 text-yellow-300" />`

#### addMerchant
**File:** `src/components/MerchantConfig.tsx`
**Lines:** 132

**Key Elements:**
- **Record** (line 22) - `record`
  - Context: `const [merchantNames, setMerchantNames] = useState<Record<string, string>>({`
- **Card** (line 46) - `card`
  - Context: `<Card className="w-full">`
- **CardHeader** (line 47) - `cardheader`
  - Context: `<CardHeader>`
- **Settings** (line 49) - `settings`
  - Context: `<Settings className="h-5 w-5" />`
- **CardTitle** (line 50) - `cardtitle`
  - Context: `<CardTitle>Merchant Configuration</CardTitle>`
- **CardDescription** (line 52) - `carddescription`
  - Context: `<CardDescription>`
- **CardContent** (line 56) - `cardcontent`
  - Context: `<CardContent className="space-y-4">`
- **Label** (line 59) - `label`
  - Context: `<Label className="text-sm font-medium">Selected Merchants ({selectedMerchants.le...`
- **Badge** (line 65) - `badge`
  - Context: `<Badge key={merchantId} variant="secondary" className="flex items-center gap-2 p...`
- **Button** (line 69) - `button`
  - Context: `<Button`
- **Trash2** (line 75) - `trash2`
  - Context: `<Trash2 className="h-3 w-3" />`
- **Label** (line 86) - `label`
  - Context: `<Label className="text-sm font-medium">Add New Merchant</Label>`
- **Label** (line 89) - `label`
  - Context: `<Label htmlFor="merchant-id" className="text-xs">Merchant ID</Label>`
- **Input** (line 90) - `input`
  - Context: `<Input`
- **Label** (line 99) - `label`
  - Context: `<Label htmlFor="merchant-name" className="text-xs">Merchant Name</Label>`
- **Input** (line 100) - `input`
  - Context: `<Input`
- **Button** (line 108) - `button`
  - Context: `<Button`
- **Plus** (line 113) - `plus`
  - Context: `<Plus className="h-4 w-4 mr-2" />`

#### PriceAlertModal
**File:** `src/components/PriceAlertModal.tsx`
**Lines:** 261

**Key Elements:**
- **PriceAlertModalProps** (line 46) - `pricealertmodalprops`
  - Context: `export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({`
- **Dialog** (line 126) - `dialog`
  - Context: `<Dialog open={open} onOpenChange={setOpen}>`
- **DialogTrigger** (line 127) - `dialogtrigger`
  - Context: `<DialogTrigger asChild>`
- **DialogContent** (line 130) - `dialogcontent`
  - Context: `<DialogContent className="sm:max-w-[425px]">`
- **DialogHeader** (line 131) - `dialogheader`
  - Context: `<DialogHeader>`
- **DialogTitle** (line 132) - `dialogtitle`
  - Context: `<DialogTitle className="flex items-center gap-2">`
- **Bell** (line 133) - `bell`
  - Context: `<Bell className="h-5 w-5" />`
- **Label** (line 150) - `label`
  - Context: `<Label htmlFor="alertType">Alert Type</Label>`
- **Select** (line 151) - `select`
  - Context: `<Select value={formData.alertType} onValueChange={(value: CreatePriceAlertData['...`
- **SelectTrigger** (line 154) - `selecttrigger`
  - Context: `<SelectTrigger>`
- **SelectValue** (line 155) - `selectvalue`
  - Context: `<SelectValue placeholder="Select alert type" />`
- **SelectContent** (line 157) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 161) - `selectitem`
  - Context: `<SelectItem key={option.value} value={option.value}>`
- **Icon** (line 163) - `icon`
  - Context: `<Icon className="h-4 w-4" />`
- **Label** (line 179) - `label`
  - Context: `<Label htmlFor="targetPrice">Target Price ($)</Label>`
- **Input** (line 180) - `input`
  - Context: `<Input`
- **Label** (line 199) - `label`
  - Context: `<Label htmlFor="targetDiscount">Minimum Discount (% off)</Label>`
- **Input** (line 200) - `input`
  - Context: `<Input`
- **Label** (line 216) - `label`
  - Context: `<Label>Notification Methods</Label>`
- **Checkbox** (line 220) - `checkbox`
  - Context: `<Checkbox`
- **Label** (line 228) - `label`
  - Context: `<Label`
- **Button** (line 241) - `button`
  - Context: `<Button`
- **Button** (line 249) - `button`
  - Context: `<Button`

#### PriceHistoryChart
**File:** `src/components/PriceHistoryChart.tsx`
**Lines:** 208

**Key Elements:**
- **PriceHistoryChartProps** (line 12) - `pricehistorychartprops`
  - Context: `export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ priceHisto...`
- **Card** (line 54) - `card`
  - Context: `<Card className="w-full">`
- **CardHeader** (line 55) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 58) - `cardtitle`
  - Context: `<CardTitle className="text-lg">{priceHistory.productName}</CardTitle>`
- **CardDescription** (line 59) - `carddescription`
  - Context: `<CardDescription className="flex items-center gap-2 mt-1">`
- **CardContent** (line 70) - `cardcontent`
  - Context: `<CardContent>`
- **TrendingUp** (line 89) - `trendingup`
  - Context: `<TrendingUp className="h-4 w-4 text-red-600" />`
- **TrendingDown** (line 91) - `trendingdown`
  - Context: `<TrendingDown className="h-4 w-4 text-green-600" />`
- **Calendar** (line 185) - `calendar`
  - Context: `<Calendar className="h-3 w-3 text-gray-400" />`
- **Badge** (line 191) - `badge`
  - Context: `<Badge variant="secondary" className="text-xs bg-green-50 text-green-700">`
- **Badge** (line 196) - `badge`
  - Context: `<Badge variant="secondary" className="text-xs">`

#### PriceIntelligenceDashboard
**File:** `src/components/PriceIntelligenceDashboard.tsx`
**Lines:** 489

**Key Elements:**
- **PriceIntelligenceDashboardProps** (line 20) - `priceintelligencedashboardprops`
  - Context: `export const PriceIntelligenceDashboard: React.FC<PriceIntelligenceDashboardProp...`
- **Badge** (line 102) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-100 text-green-800">`
- **TrendingDown** (line 103) - `trendingdown`
  - Context: `<TrendingDown className="h-3 w-3 mr-1" />`
- **Badge** (line 109) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-100 text-blue-800">`
- **Target** (line 110) - `target`
  - Context: `<Target className="h-3 w-3 mr-1" />`
- **Badge** (line 116) - `badge`
  - Context: `<Badge variant="outline">`
- **TrendingUp** (line 117) - `trendingup`
  - Context: `<TrendingUp className="h-3 w-3 mr-1" />`
- **Badge** (line 123) - `badge`
  - Context: `<Badge variant="secondary" className="bg-purple-100 text-purple-800">`
- **Star** (line 124) - `star`
  - Context: `<Star className="h-3 w-3 mr-1" />`
- **Card** (line 167) - `card`
  - Context: `<Card key={i}>`
- **CardContent** (line 168) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Tabs** (line 183) - `tabs`
  - Context: `<Tabs defaultValue="all-products" className="w-full">`
- **TabsList** (line 184) - `tabslist`
  - Context: `<TabsList className="grid w-full grid-cols-4">`
- **TabsTrigger** (line 185) - `tabstrigger`
  - Context: `<TabsTrigger value="all-products">All Products</TabsTrigger>`
- **TabsTrigger** (line 186) - `tabstrigger`
  - Context: `<TabsTrigger value="deals">Smart Deals</TabsTrigger>`
- **TabsTrigger** (line 187) - `tabstrigger`
  - Context: `<TabsTrigger value="categories">Category Insights</TabsTrigger>`
- **TabsTrigger** (line 188) - `tabstrigger`
  - Context: `<TabsTrigger value="trends">Market Trends</TabsTrigger>`
- **TabsContent** (line 191) - `tabscontent`
  - Context: `<TabsContent value="all-products" className="space-y-4">`
- **Card** (line 193) - `card`
  - Context: `<Card>`
- **CardHeader** (line 194) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 195) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **Search** (line 196) - `search`
  - Context: `<Search className="h-5 w-5" />`
- **CardDescription** (line 199) - `carddescription`
  - Context: `<CardDescription>`
- **CardContent** (line 203) - `cardcontent`
  - Context: `<CardContent>`
- **Search** (line 206) - `search`
  - Context: `<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-...`
- **Input** (line 207) - `input`
  - Context: `<Input`
- **Button** (line 215) - `button`
  - Context: `<Button onClick={handleSearch} disabled={productsLoading}>`
- **PriceHistoryChart** (line 224) - `pricehistorychart`
  - Context: `<PriceHistoryChart`
- **Card** (line 245) - `card`
  - Context: `<Card`
- **CardContent** (line 250) - `cardcontent`
  - Context: `<CardContent className="p-4">`
- **Button** (line 253) - `button`
  - Context: `<Button`
- **History** (line 262) - `history`
  - Context: `<History className="h-4 w-4" />`
- **Badge** (line 284) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-50 text-green-700">`
- **TabsContent** (line 306) - `tabscontent`
  - Context: `<TabsContent value="deals" className="space-y-4">`
- **Card** (line 308) - `card`
  - Context: `<Card>`
- **CardHeader** (line 309) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 310) - `cardtitle`
  - Context: `<CardTitle>Filter Deals</CardTitle>`
- **CardDescription** (line 311) - `carddescription`
  - Context: `<CardDescription>`
- **CardContent** (line 315) - `cardcontent`
  - Context: `<CardContent>`
- **Select** (line 317) - `select`
  - Context: `<Select value={selectedCategory} onValueChange={setSelectedCategory}>`
- **SelectTrigger** (line 318) - `selecttrigger`
  - Context: `<SelectTrigger className="w-[200px]">`
- **SelectValue** (line 319) - `selectvalue`
  - Context: `<SelectValue placeholder="Category" />`
- **SelectContent** (line 321) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 322) - `selectitem`
  - Context: `<SelectItem value="all">All Categories</SelectItem>`
- **SelectItem** (line 324) - `selectitem`
  - Context: `<SelectItem key={category.category} value={category.category}>`
- **Select** (line 331) - `select`
  - Context: `<Select value={dealQualityFilter} onValueChange={setDealQualityFilter}>`
- **SelectTrigger** (line 332) - `selecttrigger`
  - Context: `<SelectTrigger className="w-[200px]">`
- **SelectValue** (line 333) - `selectvalue`
  - Context: `<SelectValue placeholder="Deal Quality" />`
- **SelectContent** (line 335) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 336) - `selectitem`
  - Context: `<SelectItem value="all">All Qualities</SelectItem>`
- **SelectItem** (line 337) - `selectitem`
  - Context: `<SelectItem value="excellent">Excellent Deals (80%+)</SelectItem>`
- **SelectItem** (line 338) - `selectitem`
  - Context: `<SelectItem value="good">Good Deals (60%+)</SelectItem>`
- **SelectItem** (line 339) - `selectitem`
  - Context: `<SelectItem value="great_price">Great Prices Only</SelectItem>`
- **Card** (line 349) - `card`
  - Context: `<Card key={`${deal.sku}-${deal.merchant_id}`} className="overflow-hidden">`
- **PriceTrendIndicator** (line 360) - `pricetrendindicator`
  - Context: `<PriceTrendIndicator status={deal.price_trend_status} />`
- **CardContent** (line 364) - `cardcontent`
  - Context: `<CardContent className="p-4">`
- **Badge** (line 386) - `badge`
  - Context: `<Badge variant="destructive" className="text-xs">`
- **DealQualityIndicator** (line 392) - `dealqualityindicator`
  - Context: `<DealQualityIndicator score={deal.deal_quality_score} />`
- **Button** (line 402) - `button`
  - Context: `<Button size="sm" className="w-full" asChild>`
- **TabsContent** (line 415) - `tabscontent`
  - Context: `<TabsContent value="categories" className="space-y-4">`
- **Card** (line 418) - `card`
  - Context: `<Card key={`${category.category}-${category.subcategory}`}>`
- **CardHeader** (line 419) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 420) - `cardtitle`
  - Context: `<CardTitle className="text-lg">{category.category}</CardTitle>`
- **CardDescription** (line 422) - `carddescription`
  - Context: `<CardDescription>{category.subcategory}</CardDescription>`
- **CardContent** (line 425) - `cardcontent`
  - Context: `<CardContent>`
- **Badge** (line 436) - `badge`
  - Context: `<Badge variant="outline">`
- **TabsContent** (line 469) - `tabscontent`
  - Context: `<TabsContent value="trends" className="space-y-4">`
- **Card** (line 470) - `card`
  - Context: `<Card>`
- **CardHeader** (line 471) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 472) - `cardtitle`
  - Context: `<CardTitle>Market Trends</CardTitle>`
- **CardDescription** (line 473) - `carddescription`
  - Context: `<CardDescription>`
- **CardContent** (line 477) - `cardcontent`
  - Context: `<CardContent>`
- **Clock** (line 479) - `clock`
  - Context: `<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />`

#### ProductCard
**File:** `src/components/ProductCard.tsx`
**Lines:** 388

**Key Elements:**
- **ProductCardProps** (line 48) - `productcardprops`
  - Context: `const ProductCard: React.FC<ProductCardProps> = ({`
- **Badge** (line 99) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">`
- **TrendingDown** (line 100) - `trendingdown`
  - Context: `<TrendingDown className="h-3 w-3 mr-1" />`
- **Badge** (line 106) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">`
- **Target** (line 107) - `target`
  - Context: `<Target className="h-3 w-3 mr-1" />`
- **Badge** (line 113) - `badge`
  - Context: `<Badge variant="outline" className="text-xs">`
- **TrendingUp** (line 114) - `trendingup`
  - Context: `<TrendingUp className="h-3 w-3 mr-1" />`
- **Badge** (line 120) - `badge`
  - Context: `<Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">`
- **Star** (line 121) - `star`
  - Context: `<Star className="h-3 w-3 mr-1" />`
- **Badge** (line 178) - `badge`
  - Context: `<Badge variant="destructive" className="text-xs absolute -top-2 -right-2">`
- **DealQualityIndicator** (line 206) - `dealqualityindicator`
  - Context: `<DealQualityIndicator />`
- **PriceTrendIndicator** (line 207) - `pricetrendindicator`
  - Context: `<PriceTrendIndicator />`
- **Button** (line 228) - `button`
  - Context: `<Button`
- **Heart** (line 233) - `heart`
  - Context: `<Heart`
- **PriceAlertModal** (line 238) - `pricealertmodal`
  - Context: `<PriceAlertModal`
- **Button** (line 244) - `button`
  - Context: `<Button size="sm" variant="outline">`
- **Bell** (line 245) - `bell`
  - Context: `<Bell className="h-4 w-4 text-gray-500" />`
- **Button** (line 251) - `button`
  - Context: `<Button`
- **Badge** (line 283) - `badge`
  - Context: `<Badge variant="destructive" className="text-xs">`
- **PriceTrendIndicator** (line 287) - `pricetrendindicator`
  - Context: `<PriceTrendIndicator />`
- **Button** (line 294) - `button`
  - Context: `<Button`
- **Heart** (line 300) - `heart`
  - Context: `<Heart`
- **PriceAlertModal** (line 305) - `pricealertmodal`
  - Context: `<PriceAlertModal`
- **Button** (line 311) - `button`
  - Context: `<Button`
- **Bell** (line 316) - `bell`
  - Context: `<Bell className="h-4 w-4 text-gray-500" />`
- **DealQualityIndicator** (line 345) - `dealqualityindicator`
  - Context: `<DealQualityIndicator />`
- **Button** (line 374) - `button`
  - Context: `<Button`

#### ProductGrid
**File:** `src/components/ProductGrid.tsx`
**Lines:** 453

**Key Elements:**
- **ProductGridProps** (line 31) - `productgridprops`
  - Context: `const ProductGrid: React.FC<ProductGridProps> = ({ showPriceIntelligence = false...`
- **Product** (line 36) - `product`
  - Context: `const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);`
- **Card** (line 179) - `card`
  - Context: `<Card className="border-red-200 bg-red-50">`
- **CardContent** (line 180) - `cardcontent`
  - Context: `<CardContent className="p-4">`
- **Card** (line 188) - `card`
  - Context: `<Card>`
- **CardContent** (line 189) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Package** (line 195) - `package`
  - Context: `<Package className="h-8 w-8 text-blue-500" />`
- **Card** (line 200) - `card`
  - Context: `<Card>`
- **CardContent** (line 201) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Percent** (line 207) - `percent`
  - Context: `<Percent className="h-8 w-8 text-green-500" />`
- **Card** (line 212) - `card`
  - Context: `<Card>`
- **CardContent** (line 213) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Filter** (line 219) - `filter`
  - Context: `<Filter className="h-8 w-8 text-purple-500" />`
- **Card** (line 224) - `card`
  - Context: `<Card>`
- **CardContent** (line 225) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Star** (line 231) - `star`
  - Context: `<Star className="h-8 w-8 text-red-500" />`
- **Card** (line 238) - `card`
  - Context: `<Card>`
- **CardHeader** (line 239) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 240) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **Search** (line 241) - `search`
  - Context: `<Search className="h-5 w-5" />`
- **CardContent** (line 245) - `cardcontent`
  - Context: `<CardContent>`
- **Search** (line 249) - `search`
  - Context: `<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-...`
- **Input** (line 250) - `input`
  - Context: `<Input`
- **Select** (line 261) - `select`
  - Context: `<Select value={selectedCategory} onValueChange={setSelectedCategory}>`
- **SelectTrigger** (line 262) - `selecttrigger`
  - Context: `<SelectTrigger>`
- **SelectValue** (line 263) - `selectvalue`
  - Context: `<SelectValue placeholder="Category" />`
- **SelectContent** (line 265) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 266) - `selectitem`
  - Context: `<SelectItem value="all">All Categories</SelectItem>`
- **SelectItem** (line 268) - `selectitem`
  - Context: `<SelectItem key={cat} value={cat}>{cat}</SelectItem>`
- **Select** (line 273) - `select`
  - Context: `<Select value={selectedBrand} onValueChange={setSelectedBrand}>`
- **SelectTrigger** (line 274) - `selecttrigger`
  - Context: `<SelectTrigger>`
- **SelectValue** (line 275) - `selectvalue`
  - Context: `<SelectValue placeholder="Brand" />`
- **SelectContent** (line 277) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 278) - `selectitem`
  - Context: `<SelectItem value="all">All Brands</SelectItem>`
- **SelectItem** (line 280) - `selectitem`
  - Context: `<SelectItem key={brand} value={brand}>{brand}</SelectItem>`
- **Select** (line 285) - `select`
  - Context: `<Select value={priceRange} onValueChange={setPriceRange}>`
- **SelectTrigger** (line 286) - `selecttrigger`
  - Context: `<SelectTrigger>`
- **SelectValue** (line 287) - `selectvalue`
  - Context: `<SelectValue placeholder="Price Range" />`
- **SelectContent** (line 289) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 290) - `selectitem`
  - Context: `<SelectItem value="all">All Prices</SelectItem>`
- **SelectItem** (line 291) - `selectitem`
  - Context: `<SelectItem value="0-25">$0 - $25</SelectItem>`
- **SelectItem** (line 292) - `selectitem`
  - Context: `<SelectItem value="25-50">$25 - $50</SelectItem>`
- **SelectItem** (line 293) - `selectitem`
  - Context: `<SelectItem value="50-100">$50 - $100</SelectItem>`
- **SelectItem** (line 294) - `selectitem`
  - Context: `<SelectItem value="100-200">$100 - $200</SelectItem>`
- **SelectItem** (line 295) - `selectitem`
  - Context: `<SelectItem value="200+">$200+</SelectItem>`
- **Select** (line 299) - `select`
  - Context: `<Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>`
- **SelectTrigger** (line 300) - `selecttrigger`
  - Context: `<SelectTrigger>`
- **SelectValue** (line 301) - `selectvalue`
  - Context: `<SelectValue placeholder="Sort By" />`
- **SelectContent** (line 303) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 304) - `selectitem`
  - Context: `<SelectItem value="discount">Best Discount</SelectItem>`
- **SelectItem** (line 305) - `selectitem`
  - Context: `<SelectItem value="price">Lowest Price</SelectItem>`
- **SelectItem** (line 306) - `selectitem`
  - Context: `<SelectItem value="name">Name A-Z</SelectItem>`
- **Button** (line 311) - `button`
  - Context: `<Button`
- **Loader2** (line 317) - `loader2`
  - Context: `{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4...`
- **Search** (line 317) - `search`
  - Context: `{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4...`
- **Button** (line 319) - `button`
  - Context: `<Button`
- **RefreshCw** (line 324) - `refreshcw`
  - Context: `<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />`
- **Button** (line 344) - `button`
  - Context: `<Button`
- **Grid3X3** (line 349) - `grid3x3`
  - Context: `<Grid3X3 className="w-4 h-4" />`
- **Button** (line 351) - `button`
  - Context: `<Button`
- **List** (line 356) - `list`
  - Context: `<List className="w-4 h-4" />`
- **Card** (line 363) - `card`
  - Context: `<Card>`
- **CardContent** (line 364) - `cardcontent`
  - Context: `<CardContent className="py-24">`
- **Loader2** (line 366) - `loader2`
  - Context: `<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />`
- **ProductCard** (line 380) - `productcard`
  - Context: `<ProductCard`
- **Card** (line 393) - `card`
  - Context: `<Card>`
- **CardContent** (line 394) - `cardcontent`
  - Context: `<CardContent className="py-12">`
- **ShoppingBag** (line 396) - `shoppingbag`
  - Context: `<ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />`
- **Button** (line 399) - `button`
  - Context: `<Button`
- **Card** (line 417) - `card`
  - Context: `<Card>`
- **CardHeader** (line 418) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 419) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **TrendingUp** (line 420) - `trendingup`
  - Context: `<TrendingUp className="h-5 w-5" />`
- **CardContent** (line 424) - `cardcontent`
  - Context: `<CardContent>`
- **ProductModal** (line 444) - `productmodal`
  - Context: `<ProductModal`

#### ProductModal
**File:** `src/components/ProductModal.tsx`
**Lines:** 125

**Key Elements:**
- **ProductModalProps** (line 15) - `productmodalprops`
  - Context: `const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose })...`
- **Dialog** (line 23) - `dialog`
  - Context: `<Dialog open={isOpen} onOpenChange={onClose}>`
- **DialogContent** (line 24) - `dialogcontent`
  - Context: `<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">`
- **DialogHeader** (line 25) - `dialogheader`
  - Context: `<DialogHeader>`
- **DialogTitle** (line 26) - `dialogtitle`
  - Context: `<DialogTitle className="text-2xl font-bold text-gray-900">`
- **Badge** (line 40) - `badge`
  - Context: `<Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1"...`
- **Badge** (line 49) - `badge`
  - Context: `<Badge variant="outline" className="mb-2">`
- **Badge** (line 52) - `badge`
  - Context: `<Badge variant="secondary" className="ml-2">`
- **Star** (line 62) - `star`
  - Context: `<Star`
- **Button** (line 96) - `button`
  - Context: `<Button`
- **ShoppingCart** (line 101) - `shoppingcart`
  - Context: `<ShoppingCart className="w-5 h-5 mr-2" />`
- **Button** (line 104) - `button`
  - Context: `<Button`
- **ExternalLink** (line 109) - `externallink`
  - Context: `<ExternalLink className="w-5 h-5 mr-2" />`

#### SearchFilters
**File:** `src/components/SearchFilters.tsx`
**Lines:** 128

**Key Elements:**
- **SearchFiltersProps** (line 25) - `searchfiltersprops`
  - Context: `const SearchFilters: React.FC<SearchFiltersProps> = ({`
- **Card** (line 46) - `card`
  - Context: `<Card className="mb-6 shadow-sm">`
- **CardContent** (line 47) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Search** (line 51) - `search`
  - Context: `<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-...`
- **Input** (line 52) - `input`
  - Context: `<Input`
- **Button** (line 64) - `button`
  - Context: `<Button`
- **Loader2** (line 70) - `loader2`
  - Context: `<Loader2 className="w-4 h-4 animate-spin" />`
- **Select** (line 78) - `select`
  - Context: `<Select value={selectedCategory} onValueChange={onCategoryChange} disabled={disa...`
- **SelectTrigger** (line 79) - `selecttrigger`
  - Context: `<SelectTrigger className="h-10">`
- **SelectValue** (line 80) - `selectvalue`
  - Context: `<SelectValue placeholder="All Categories" />`
- **SelectContent** (line 82) - `selectcontent`
  - Context: `<SelectContent className="bg-white border shadow-lg z-50">`
- **SelectItem** (line 83) - `selectitem`
  - Context: `<SelectItem value="all">All Categories</SelectItem>`
- **SelectItem** (line 85) - `selectitem`
  - Context: `<SelectItem key={category} value={category}>`
- **Select** (line 93) - `select`
  - Context: `<Select value={selectedMerchant} onValueChange={onMerchantChange} disabled={disa...`
- **SelectTrigger** (line 94) - `selecttrigger`
  - Context: `<SelectTrigger className="h-10">`
- **SelectValue** (line 95) - `selectvalue`
  - Context: `<SelectValue placeholder="All Merchants" />`
- **SelectContent** (line 97) - `selectcontent`
  - Context: `<SelectContent className="bg-white border shadow-lg z-50">`
- **SelectItem** (line 98) - `selectitem`
  - Context: `<SelectItem value="all">All Merchants</SelectItem>`
- **SelectItem** (line 100) - `selectitem`
  - Context: `<SelectItem key={merchant} value={merchant}>`
- **Select** (line 108) - `select`
  - Context: `<Select value={priceRange} onValueChange={onPriceRangeChange} disabled={disabled...`
- **SelectTrigger** (line 109) - `selecttrigger`
  - Context: `<SelectTrigger className="h-10">`
- **SelectValue** (line 110) - `selectvalue`
  - Context: `<SelectValue placeholder="All Prices" />`
- **SelectContent** (line 112) - `selectcontent`
  - Context: `<SelectContent className="bg-white border shadow-lg z-50">`
- **SelectItem** (line 113) - `selectitem`
  - Context: `<SelectItem value="all">All Prices</SelectItem>`
- **SelectItem** (line 114) - `selectitem`
  - Context: `<SelectItem value="0-25">$0 - $25</SelectItem>`
- **SelectItem** (line 115) - `selectitem`
  - Context: `<SelectItem value="25-50">$25 - $50</SelectItem>`
- **SelectItem** (line 116) - `selectitem`
  - Context: `<SelectItem value="50-100">$50 - $100</SelectItem>`
- **SelectItem** (line 117) - `selectitem`
  - Context: `<SelectItem value="100-200">$100 - $200</SelectItem>`
- **SelectItem** (line 118) - `selectitem`
  - Context: `<SelectItem value="200+">$200+</SelectItem>`

#### Sidebar
**File:** `src/components/Sidebar.tsx`
**Lines:** 242

**Key Elements:**
- **SidebarProps** (line 40) - `sidebarprops`
  - Context: `const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onFilterSel...`
- **SavedFilter** (line 42) - `savedfilter`
  - Context: `const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([`
- **Search** (line 85) - `search`
  - Context: `<Search className="h-5 w-5 text-white" />`
- **ScrollArea** (line 94) - `scrollarea`
  - Context: `<ScrollArea className="flex-1">`
- **Button** (line 106) - `button`
  - Context: `<Button`
- **Icon** (line 116) - `icon`
  - Context: `<Icon className="h-4 w-4 mr-3" />`
- **Badge** (line 119) - `badge`
  - Context: `<Badge variant="secondary" className="text-xs">`
- **Separator** (line 129) - `separator`
  - Context: `<Separator className="mx-4" />`
- **Button** (line 137) - `button`
  - Context: `<Button`
- **Plus** (line 143) - `plus`
  - Context: `<Plus className="h-3 w-3" />`
- **Card** (line 149) - `card`
  - Context: `<Card className="mb-3 border-dashed">`
- **CardContent** (line 150) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Input** (line 152) - `input`
  - Context: `<Input`
- **Button** (line 159) - `button`
  - Context: `<Button size="sm" onClick={handleSaveCurrentFilter} className="h-8 px-2">`
- **Plus** (line 160) - `plus`
  - Context: `<Plus className="h-3 w-3" />`
- **Card** (line 173) - `card`
  - Context: `<Card key={filter.id} className="border-gray-100 hover:border-blue-200 transitio...`
- **CardContent** (line 174) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Filter** (line 182) - `filter`
  - Context: `<Filter className="h-3 w-3 text-gray-400" />`
- **Tag** (line 188) - `tag`
  - Context: `<Tag className="h-3 w-3" />`
- **Badge** (line 191) - `badge`
  - Context: `<Badge variant="outline" className="text-xs h-4">Sale</Badge>`
- **Button** (line 196) - `button`
  - Context: `<Button`
- **X** (line 202) - `x`
  - Context: `<X className="h-3 w-3" />`
- **Separator** (line 211) - `separator`
  - Context: `<Separator className="mx-4" />`
- **Badge** (line 221) - `badge`
  - Context: `<Badge variant="secondary">{dashboardStats.loading ? '...' : dashboardStats.tota...`
- **Badge** (line 225) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-50 text-green-700">{dashboardStat...`
- **Badge** (line 229) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700">0</Badge>`
- **Badge** (line 233) - `badge`
  - Context: `<Badge variant="secondary" className="bg-purple-50 text-purple-700">{dashboardSt...`

### 📁 src/components/ui/

#### accordion
**File:** `src/components/ui/accordion.tsx`
**Lines:** 57

**Key Elements:**
- **AccordionPrimitive** (line 13) - `accordionprimitive`
  - Context: `<AccordionPrimitive.Item`
- **AccordionPrimitive** (line 25) - `accordionprimitive`
  - Context: `<AccordionPrimitive.Header className="flex">`
- **AccordionPrimitive** (line 26) - `accordionprimitive`
  - Context: `<AccordionPrimitive.Trigger`
- **ChevronDown** (line 35) - `chevrondown`
  - Context: `<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />`
- **AccordionPrimitive** (line 45) - `accordionprimitive`
  - Context: `<AccordionPrimitive.Content`

#### alert-dialog
**File:** `src/components/ui/alert-dialog.tsx`
**Lines:** 140

**Key Elements:**
- **AlertDialogPrimitive** (line 17) - `alertdialogprimitive`
  - Context: `<AlertDialogPrimitive.Overlay`
- **AlertDialogPortal** (line 32) - `alertdialogportal`
  - Context: `<AlertDialogPortal>`
- **AlertDialogOverlay** (line 33) - `alertdialogoverlay`
  - Context: `<AlertDialogOverlay />`
- **AlertDialogPrimitive** (line 34) - `alertdialogprimitive`
  - Context: `<AlertDialogPrimitive.Content`
- **HTMLDivElement** (line 49) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **HTMLDivElement** (line 63) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **AlertDialogPrimitive** (line 78) - `alertdialogprimitive`
  - Context: `<AlertDialogPrimitive.Title`
- **AlertDialogPrimitive** (line 90) - `alertdialogprimitive`
  - Context: `<AlertDialogPrimitive.Description`
- **AlertDialogPrimitive** (line 103) - `alertdialogprimitive`
  - Context: `<AlertDialogPrimitive.Action`
- **AlertDialogPrimitive** (line 115) - `alertdialogprimitive`
  - Context: `<AlertDialogPrimitive.Cancel`

#### alert
**File:** `src/components/ui/alert.tsx`
**Lines:** 60

**Key Elements:**
- **HTMLDivElement** (line 24) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>`
- **HTMLHeadingElement** (line 37) - `htmlheadingelement`
  - Context: `React.HTMLAttributes<HTMLHeadingElement>`
- **HTMLParagraphElement** (line 49) - `htmlparagraphelement`
  - Context: `React.HTMLAttributes<HTMLParagraphElement>`

#### aspect-ratio
**File:** `src/components/ui/aspect-ratio.tsx`
**Lines:** 6

#### avatar
**File:** `src/components/ui/avatar.tsx`
**Lines:** 49

**Key Elements:**
- **AvatarPrimitive** (line 10) - `avatarprimitive`
  - Context: `<AvatarPrimitive.Root`
- **AvatarPrimitive** (line 25) - `avatarprimitive`
  - Context: `<AvatarPrimitive.Image`
- **AvatarPrimitive** (line 37) - `avatarprimitive`
  - Context: `<AvatarPrimitive.Fallback`

#### badge
**File:** `src/components/ui/badge.tsx`
**Lines:** 37

**Key Elements:**
- **HTMLDivElement** (line 27) - `htmldivelement`
  - Context: `extends React.HTMLAttributes<HTMLDivElement>,`

#### breadcrumb
**File:** `src/components/ui/breadcrumb.tsx`
**Lines:** 116

**Key Elements:**
- **Comp** (line 51) - `comp`
  - Context: `<Comp`
- **ChevronRight** (line 86) - `chevronright`
  - Context: `{children ?? <ChevronRight />}`
- **MoreHorizontal** (line 101) - `morehorizontal`
  - Context: `<MoreHorizontal className="h-4 w-4" />`

#### button
**File:** `src/components/ui/button.tsx`
**Lines:** 57

**Key Elements:**
- **HTMLButtonElement** (line 37) - `htmlbuttonelement`
  - Context: `extends React.ButtonHTMLAttributes<HTMLButtonElement>,`
- **HTMLButtonElement** (line 42) - `htmlbuttonelement`
  - Context: `const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(`
- **Comp** (line 46) - `comp`
  - Context: `<Comp`

#### calendar
**File:** `src/components/ui/calendar.tsx`
**Lines:** 65

**Key Elements:**
- **DayPicker** (line 17) - `daypicker`
  - Context: `<DayPicker`
- **ChevronLeft** (line 55) - `chevronleft`
  - Context: `IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,`
- **ChevronRight** (line 56) - `chevronright`
  - Context: `IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,`

#### card
**File:** `src/components/ui/card.tsx`
**Lines:** 80

**Key Elements:**
- **HTMLDivElement** (line 7) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement>`
- **HTMLDivElement** (line 22) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement>`
- **HTMLHeadingElement** (line 34) - `htmlheadingelement`
  - Context: `React.HTMLAttributes<HTMLHeadingElement>`
- **HTMLParagraphElement** (line 49) - `htmlparagraphelement`
  - Context: `React.HTMLAttributes<HTMLParagraphElement>`
- **HTMLDivElement** (line 61) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement>`
- **HTMLDivElement** (line 69) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement>`

#### onSelect
**File:** `src/components/ui/carousel.tsx`
**Lines:** 261

**Key Elements:**
- **CarouselContextProps** (line 31) - `carouselcontextprops`
  - Context: `const CarouselContext = React.createContext<CarouselContextProps | null>(null)`
- **Carousel** (line 37) - `carousel`
  - Context: `throw new Error("useCarousel must be used within a <Carousel />")`
- **HTMLDivElement** (line 45) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement> & CarouselProps`
- **HTMLDivElement** (line 87) - `htmldivelement`
  - Context: `(event: React.KeyboardEvent<HTMLDivElement>) => {`
- **CarouselContext** (line 122) - `carouselcontext`
  - Context: `<CarouselContext.Provider`
- **HTMLDivElement** (line 153) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement>`
- **HTMLDivElement** (line 175) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement>`
- **Button** (line 202) - `button`
  - Context: `<Button`
- **ArrowLeft** (line 217) - `arrowleft`
  - Context: `<ArrowLeft className="h-4 w-4" />`
- **Button** (line 231) - `button`
  - Context: `<Button`
- **ArrowRight** (line 246) - `arrowright`
  - Context: `<ArrowRight className="h-4 w-4" />`

#### uniqueId
**File:** `src/components/ui/chart.tsx`
**Lines:** 364

**Key Elements:**
- **ChartContextProps** (line 23) - `chartcontextprops`
  - Context: `const ChartContext = React.createContext<ChartContextProps | null>(null)`
- **ChartContainer** (line 29) - `chartcontainer`
  - Context: `throw new Error("useChart must be used within a <ChartContainer />")`
- **ChartContext** (line 48) - `chartcontext`
  - Context: `<ChartContext.Provider value={{ config }}>`
- **ChartStyle** (line 58) - `chartstyle`
  - Context: `<ChartStyle id={chartId} config={config} />`
- **RechartsPrimitive** (line 59) - `rechartsprimitive`
  - Context: `<RechartsPrimitive.ResponsiveContainer>`
- **RechartsPrimitive** (line 262) - `rechartsprimitive`
  - Context: `Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {`

#### checkbox
**File:** `src/components/ui/checkbox.tsx`
**Lines:** 29

**Key Elements:**
- **CheckboxPrimitive** (line 11) - `checkboxprimitive`
  - Context: `<CheckboxPrimitive.Root`
- **CheckboxPrimitive** (line 19) - `checkboxprimitive`
  - Context: `<CheckboxPrimitive.Indicator`
- **Check** (line 22) - `check`
  - Context: `<Check className="h-4 w-4" />`

#### collapsible
**File:** `src/components/ui/collapsible.tsx`
**Lines:** 10

#### CommandDialog
**File:** `src/components/ui/command.tsx`
**Lines:** 154

**Key Elements:**
- **CommandPrimitive** (line 13) - `commandprimitive`
  - Context: `<CommandPrimitive`
- **Dialog** (line 28) - `dialog`
  - Context: `<Dialog {...props}>`
- **DialogContent** (line 29) - `dialogcontent`
  - Context: `<DialogContent className="overflow-hidden p-0 shadow-lg">`
- **Command** (line 30) - `command`
  - Context: `<Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-...`
- **Search** (line 43) - `search`
  - Context: `<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />`
- **CommandPrimitive** (line 44) - `commandprimitive`
  - Context: `<CommandPrimitive.Input`
- **CommandPrimitive** (line 61) - `commandprimitive`
  - Context: `<CommandPrimitive.List`
- **CommandPrimitive** (line 74) - `commandprimitive`
  - Context: `<CommandPrimitive.Empty`
- **CommandPrimitive** (line 87) - `commandprimitive`
  - Context: `<CommandPrimitive.Group`
- **CommandPrimitive** (line 103) - `commandprimitive`
  - Context: `<CommandPrimitive.Separator`
- **CommandPrimitive** (line 115) - `commandprimitive`
  - Context: `<CommandPrimitive.Item`
- **HTMLSpanElement** (line 130) - `htmlspanelement`
  - Context: `}: React.HTMLAttributes<HTMLSpanElement>) => {`

#### context-menu
**File:** `src/components/ui/context-menu.tsx`
**Lines:** 199

**Key Elements:**
- **ContextMenuPrimitive** (line 25) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.SubTrigger`
- **ChevronRight** (line 35) - `chevronright`
  - Context: `<ChevronRight className="ml-auto h-4 w-4" />`
- **ContextMenuPrimitive** (line 44) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.SubContent`
- **ContextMenuPrimitive** (line 59) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.Portal>`
- **ContextMenuPrimitive** (line 60) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.Content`
- **ContextMenuPrimitive** (line 78) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.Item`
- **ContextMenuPrimitive** (line 94) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.CheckboxItem`
- **ContextMenuPrimitive** (line 104) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.ItemIndicator>`
- **Check** (line 105) - `check`
  - Context: `<Check className="h-4 w-4" />`
- **ContextMenuPrimitive** (line 118) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.RadioItem`
- **ContextMenuPrimitive** (line 127) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.ItemIndicator>`
- **Circle** (line 128) - `circle`
  - Context: `<Circle className="h-2 w-2 fill-current" />`
- **ContextMenuPrimitive** (line 142) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.Label`
- **ContextMenuPrimitive** (line 158) - `contextmenuprimitive`
  - Context: `<ContextMenuPrimitive.Separator`
- **HTMLSpanElement** (line 169) - `htmlspanelement`
  - Context: `}: React.HTMLAttributes<HTMLSpanElement>) => {`

#### dialog
**File:** `src/components/ui/dialog.tsx`
**Lines:** 121

**Key Elements:**
- **DialogPrimitive** (line 19) - `dialogprimitive`
  - Context: `<DialogPrimitive.Overlay`
- **DialogPortal** (line 34) - `dialogportal`
  - Context: `<DialogPortal>`
- **DialogOverlay** (line 35) - `dialogoverlay`
  - Context: `<DialogOverlay />`
- **DialogPrimitive** (line 36) - `dialogprimitive`
  - Context: `<DialogPrimitive.Content`
- **DialogPrimitive** (line 45) - `dialogprimitive`
  - Context: `<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 r...`
- **X** (line 46) - `x`
  - Context: `<X className="h-4 w-4" />`
- **HTMLDivElement** (line 57) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **HTMLDivElement** (line 71) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **DialogPrimitive** (line 86) - `dialogprimitive`
  - Context: `<DialogPrimitive.Title`
- **DialogPrimitive** (line 101) - `dialogprimitive`
  - Context: `<DialogPrimitive.Description`

#### drawer
**File:** `src/components/ui/drawer.tsx`
**Lines:** 117

**Key Elements:**
- **DrawerPrimitive** (line 10) - `drawerprimitive`
  - Context: `<DrawerPrimitive.Root`
- **DrawerPrimitive** (line 27) - `drawerprimitive`
  - Context: `<DrawerPrimitive.Overlay`
- **DrawerPortal** (line 39) - `drawerportal`
  - Context: `<DrawerPortal>`
- **DrawerOverlay** (line 40) - `draweroverlay`
  - Context: `<DrawerOverlay />`
- **DrawerPrimitive** (line 41) - `drawerprimitive`
  - Context: `<DrawerPrimitive.Content`
- **HTMLDivElement** (line 59) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **HTMLDivElement** (line 70) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **DrawerPrimitive** (line 82) - `drawerprimitive`
  - Context: `<DrawerPrimitive.Title`
- **DrawerPrimitive** (line 97) - `drawerprimitive`
  - Context: `<DrawerPrimitive.Description`

#### dropdown-menu
**File:** `src/components/ui/dropdown-menu.tsx`
**Lines:** 199

**Key Elements:**
- **DropdownMenuPrimitive** (line 25) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.SubTrigger`
- **ChevronRight** (line 35) - `chevronright`
  - Context: `<ChevronRight className="ml-auto h-4 w-4" />`
- **DropdownMenuPrimitive** (line 45) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.SubContent`
- **DropdownMenuPrimitive** (line 61) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.Portal>`
- **DropdownMenuPrimitive** (line 62) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.Content`
- **DropdownMenuPrimitive** (line 81) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.Item`
- **DropdownMenuPrimitive** (line 97) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.CheckboxItem`
- **DropdownMenuPrimitive** (line 107) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.ItemIndicator>`
- **Check** (line 108) - `check`
  - Context: `<Check className="h-4 w-4" />`
- **DropdownMenuPrimitive** (line 121) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.RadioItem`
- **DropdownMenuPrimitive** (line 130) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.ItemIndicator>`
- **Circle** (line 131) - `circle`
  - Context: `<Circle className="h-2 w-2 fill-current" />`
- **DropdownMenuPrimitive** (line 145) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.Label`
- **DropdownMenuPrimitive** (line 161) - `dropdownmenuprimitive`
  - Context: `<DropdownMenuPrimitive.Separator`
- **HTMLSpanElement** (line 172) - `htmlspanelement`
  - Context: `}: React.HTMLAttributes<HTMLSpanElement>) => {`

#### useFormField
**File:** `src/components/ui/form.tsx`
**Lines:** 177

**Key Elements:**
- **TFieldValues** (line 20) - `tfieldvalues`
  - Context: `TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>`
- **TFieldValues** (line 20) - `tfieldvalues`
  - Context: `TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>`
- **FormFieldContextValue** (line 25) - `formfieldcontextvalue`
  - Context: `const FormFieldContext = React.createContext<FormFieldContextValue>(`
- **TFieldValues** (line 31) - `tfieldvalues`
  - Context: `TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>`
- **TFieldValues** (line 31) - `tfieldvalues`
  - Context: `TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>`
- **TFieldValues** (line 34) - `tfieldvalues`
  - Context: `}: ControllerProps<TFieldValues, TName>) => {`
- **FormFieldContext** (line 36) - `formfieldcontext`
  - Context: `<FormFieldContext.Provider value={{ name: props.name }}>`
- **Controller** (line 37) - `controller`
  - Context: `<Controller {...props} />`
- **FormField** (line 50) - `formfield`
  - Context: `throw new Error("useFormField should be used within <FormField>")`
- **FormItemContextValue** (line 69) - `formitemcontextvalue`
  - Context: `const FormItemContext = React.createContext<FormItemContextValue>(`
- **HTMLDivElement** (line 75) - `htmldivelement`
  - Context: `React.HTMLAttributes<HTMLDivElement>`
- **FormItemContext** (line 80) - `formitemcontext`
  - Context: `<FormItemContext.Provider value={{ id }}>`
- **Label** (line 94) - `label`
  - Context: `<Label`
- **Slot** (line 111) - `slot`
  - Context: `<Slot`
- **HTMLParagraphElement** (line 128) - `htmlparagraphelement`
  - Context: `React.HTMLAttributes<HTMLParagraphElement>`
- **HTMLParagraphElement** (line 145) - `htmlparagraphelement`
  - Context: `React.HTMLAttributes<HTMLParagraphElement>`

#### hover-card
**File:** `src/components/ui/hover-card.tsx`
**Lines:** 28

**Key Elements:**
- **HoverCardPrimitive** (line 14) - `hovercardprimitive`
  - Context: `<HoverCardPrimitive.Content`

#### input-otp
**File:** `src/components/ui/input-otp.tsx`
**Lines:** 70

**Key Elements:**
- **OTPInput** (line 11) - `otpinput`
  - Context: `<OTPInput`
- **Dot** (line 64) - `dot`
  - Context: `<Dot />`

#### Input
**File:** `src/components/ui/input.tsx`
**Lines:** 23

**Key Elements:**
- **HTMLInputElement** (line 5) - `htmlinputelement`
  - Context: `const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(`

#### label
**File:** `src/components/ui/label.tsx`
**Lines:** 25

**Key Elements:**
- **LabelPrimitive** (line 16) - `labelprimitive`
  - Context: `<LabelPrimitive.Root`

#### menubar
**File:** `src/components/ui/menubar.tsx`
**Lines:** 235

**Key Elements:**
- **MenubarPrimitive** (line 21) - `menubarprimitive`
  - Context: `<MenubarPrimitive.Root`
- **MenubarPrimitive** (line 36) - `menubarprimitive`
  - Context: `<MenubarPrimitive.Trigger`
- **MenubarPrimitive** (line 53) - `menubarprimitive`
  - Context: `<MenubarPrimitive.SubTrigger`
- **ChevronRight** (line 63) - `chevronright`
  - Context: `<ChevronRight className="ml-auto h-4 w-4" />`
- **MenubarPrimitive** (line 72) - `menubarprimitive`
  - Context: `<MenubarPrimitive.SubContent`
- **MenubarPrimitive** (line 91) - `menubarprimitive`
  - Context: `<MenubarPrimitive.Portal>`
- **MenubarPrimitive** (line 92) - `menubarprimitive`
  - Context: `<MenubarPrimitive.Content`
- **MenubarPrimitive** (line 114) - `menubarprimitive`
  - Context: `<MenubarPrimitive.Item`
- **MenubarPrimitive** (line 130) - `menubarprimitive`
  - Context: `<MenubarPrimitive.CheckboxItem`
- **MenubarPrimitive** (line 140) - `menubarprimitive`
  - Context: `<MenubarPrimitive.ItemIndicator>`
- **Check** (line 141) - `check`
  - Context: `<Check className="h-4 w-4" />`
- **MenubarPrimitive** (line 153) - `menubarprimitive`
  - Context: `<MenubarPrimitive.RadioItem`
- **MenubarPrimitive** (line 162) - `menubarprimitive`
  - Context: `<MenubarPrimitive.ItemIndicator>`
- **Circle** (line 163) - `circle`
  - Context: `<Circle className="h-2 w-2 fill-current" />`
- **MenubarPrimitive** (line 177) - `menubarprimitive`
  - Context: `<MenubarPrimitive.Label`
- **MenubarPrimitive** (line 193) - `menubarprimitive`
  - Context: `<MenubarPrimitive.Separator`
- **HTMLSpanElement** (line 204) - `htmlspanelement`
  - Context: `}: React.HTMLAttributes<HTMLSpanElement>) => {`

#### navigation-menu
**File:** `src/components/ui/navigation-menu.tsx`
**Lines:** 129

**Key Elements:**
- **NavigationMenuPrimitive** (line 12) - `navigationmenuprimitive`
  - Context: `<NavigationMenuPrimitive.Root`
- **NavigationMenuViewport** (line 21) - `navigationmenuviewport`
  - Context: `<NavigationMenuViewport />`
- **NavigationMenuPrimitive** (line 30) - `navigationmenuprimitive`
  - Context: `<NavigationMenuPrimitive.List`
- **NavigationMenuPrimitive** (line 51) - `navigationmenuprimitive`
  - Context: `<NavigationMenuPrimitive.Trigger`
- **ChevronDown** (line 57) - `chevrondown`
  - Context: `<ChevronDown`
- **NavigationMenuPrimitive** (line 69) - `navigationmenuprimitive`
  - Context: `<NavigationMenuPrimitive.Content`
- **NavigationMenuPrimitive** (line 87) - `navigationmenuprimitive`
  - Context: `<NavigationMenuPrimitive.Viewport`
- **NavigationMenuPrimitive** (line 104) - `navigationmenuprimitive`
  - Context: `<NavigationMenuPrimitive.Indicator`

#### Pagination
**File:** `src/components/ui/pagination.tsx`
**Lines:** 118

**Key Elements:**
- **ButtonProps** (line 39) - `buttonprops`
  - Context: `} & Pick<ButtonProps, "size"> &`
- **PaginationLink** (line 66) - `paginationlink`
  - Context: `<PaginationLink`
- **ChevronLeft** (line 72) - `chevronleft`
  - Context: `<ChevronLeft className="h-4 w-4" />`
- **PaginationLink** (line 82) - `paginationlink`
  - Context: `<PaginationLink`
- **ChevronRight** (line 89) - `chevronright`
  - Context: `<ChevronRight className="h-4 w-4" />`
- **MoreHorizontal** (line 103) - `morehorizontal`
  - Context: `<MoreHorizontal className="h-4 w-4" />`

#### popover
**File:** `src/components/ui/popover.tsx`
**Lines:** 30

**Key Elements:**
- **PopoverPrimitive** (line 14) - `popoverprimitive`
  - Context: `<PopoverPrimitive.Portal>`
- **PopoverPrimitive** (line 15) - `popoverprimitive`
  - Context: `<PopoverPrimitive.Content`

#### progress
**File:** `src/components/ui/progress.tsx`
**Lines:** 27

**Key Elements:**
- **ProgressPrimitive** (line 10) - `progressprimitive`
  - Context: `<ProgressPrimitive.Root`
- **ProgressPrimitive** (line 18) - `progressprimitive`
  - Context: `<ProgressPrimitive.Indicator`

#### radio-group
**File:** `src/components/ui/radio-group.tsx`
**Lines:** 43

**Key Elements:**
- **RadioGroupPrimitive** (line 12) - `radiogroupprimitive`
  - Context: `<RadioGroupPrimitive.Root`
- **RadioGroupPrimitive** (line 26) - `radiogroupprimitive`
  - Context: `<RadioGroupPrimitive.Item`
- **RadioGroupPrimitive** (line 34) - `radiogroupprimitive`
  - Context: `<RadioGroupPrimitive.Indicator className="flex items-center justify-center">`
- **Circle** (line 35) - `circle`
  - Context: `<Circle className="h-2.5 w-2.5 fill-current text-current" />`

#### resizable
**File:** `src/components/ui/resizable.tsx`
**Lines:** 44

**Key Elements:**
- **ResizablePrimitive** (line 10) - `resizableprimitive`
  - Context: `<ResizablePrimitive.PanelGroup`
- **ResizablePrimitive** (line 28) - `resizableprimitive`
  - Context: `<ResizablePrimitive.PanelResizeHandle`
- **GripVertical** (line 37) - `gripvertical`
  - Context: `<GripVertical className="h-2.5 w-2.5" />`

#### scroll-area
**File:** `src/components/ui/scroll-area.tsx`
**Lines:** 47

**Key Elements:**
- **ScrollAreaPrimitive** (line 10) - `scrollareaprimitive`
  - Context: `<ScrollAreaPrimitive.Root`
- **ScrollAreaPrimitive** (line 15) - `scrollareaprimitive`
  - Context: `<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">`
- **ScrollBar** (line 18) - `scrollbar`
  - Context: `<ScrollBar />`
- **ScrollAreaPrimitive** (line 19) - `scrollareaprimitive`
  - Context: `<ScrollAreaPrimitive.Corner />`
- **ScrollAreaPrimitive** (line 28) - `scrollareaprimitive`
  - Context: `<ScrollAreaPrimitive.ScrollAreaScrollbar`
- **ScrollAreaPrimitive** (line 41) - `scrollareaprimitive`
  - Context: `<ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-...`

#### select
**File:** `src/components/ui/select.tsx`
**Lines:** 159

**Key Elements:**
- **SelectPrimitive** (line 17) - `selectprimitive`
  - Context: `<SelectPrimitive.Trigger`
- **SelectPrimitive** (line 26) - `selectprimitive`
  - Context: `<SelectPrimitive.Icon asChild>`
- **ChevronDown** (line 27) - `chevrondown`
  - Context: `<ChevronDown className="h-4 w-4 opacity-50" />`
- **SelectPrimitive** (line 37) - `selectprimitive`
  - Context: `<SelectPrimitive.ScrollUpButton`
- **ChevronUp** (line 45) - `chevronup`
  - Context: `<ChevronUp className="h-4 w-4" />`
- **SelectPrimitive** (line 54) - `selectprimitive`
  - Context: `<SelectPrimitive.ScrollDownButton`
- **ChevronDown** (line 62) - `chevrondown`
  - Context: `<ChevronDown className="h-4 w-4" />`
- **SelectPrimitive** (line 72) - `selectprimitive`
  - Context: `<SelectPrimitive.Portal>`
- **SelectPrimitive** (line 73) - `selectprimitive`
  - Context: `<SelectPrimitive.Content`
- **SelectScrollUpButton** (line 84) - `selectscrollupbutton`
  - Context: `<SelectScrollUpButton />`
- **SelectPrimitive** (line 85) - `selectprimitive`
  - Context: `<SelectPrimitive.Viewport`
- **SelectScrollDownButton** (line 94) - `selectscrolldownbutton`
  - Context: `<SelectScrollDownButton />`
- **SelectPrimitive** (line 104) - `selectprimitive`
  - Context: `<SelectPrimitive.Label`
- **SelectPrimitive** (line 116) - `selectprimitive`
  - Context: `<SelectPrimitive.Item`
- **SelectPrimitive** (line 125) - `selectprimitive`
  - Context: `<SelectPrimitive.ItemIndicator>`
- **Check** (line 126) - `check`
  - Context: `<Check className="h-4 w-4" />`
- **SelectPrimitive** (line 130) - `selectprimitive`
  - Context: `<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>`
- **SelectPrimitive** (line 139) - `selectprimitive`
  - Context: `<SelectPrimitive.Separator`

#### separator
**File:** `src/components/ui/separator.tsx`
**Lines:** 30

**Key Elements:**
- **SeparatorPrimitive** (line 14) - `separatorprimitive`
  - Context: `<SeparatorPrimitive.Root`

#### sheet
**File:** `src/components/ui/sheet.tsx`
**Lines:** 132

**Key Elements:**
- **SheetPrimitive** (line 20) - `sheetprimitive`
  - Context: `<SheetPrimitive.Overlay`
- **SheetPortal** (line 58) - `sheetportal`
  - Context: `<SheetPortal>`
- **SheetOverlay** (line 59) - `sheetoverlay`
  - Context: `<SheetOverlay />`
- **SheetPrimitive** (line 60) - `sheetprimitive`
  - Context: `<SheetPrimitive.Content`
- **SheetPrimitive** (line 66) - `sheetprimitive`
  - Context: `<SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ri...`
- **X** (line 67) - `x`
  - Context: `<X className="h-4 w-4" />`
- **HTMLDivElement** (line 78) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **HTMLDivElement** (line 92) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) => (`
- **SheetPrimitive** (line 107) - `sheetprimitive`
  - Context: `<SheetPrimitive.Title`
- **SheetPrimitive** (line 119) - `sheetprimitive`
  - Context: `<SheetPrimitive.Description`

#### isMobile
**File:** `src/components/ui/sidebar.tsx`
**Lines:** 762

**Key Elements:**
- **SidebarContext** (line 37) - `sidebarcontext`
  - Context: `const SidebarContext = React.createContext<SidebarContext | null>(null)`
- **SidebarContext** (line 117) - `sidebarcontext`
  - Context: `const contextValue = React.useMemo<SidebarContext>(`
- **SidebarContext** (line 131) - `sidebarcontext`
  - Context: `<SidebarContext.Provider value={contextValue}>`
- **TooltipProvider** (line 132) - `tooltipprovider`
  - Context: `<TooltipProvider delayDuration={0}>`
- **Sheet** (line 195) - `sheet`
  - Context: `<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>`
- **SheetContent** (line 196) - `sheetcontent`
  - Context: `<SheetContent`
- **Button** (line 267) - `button`
  - Context: `<Button`
- **PanelLeft** (line 279) - `panelleft`
  - Context: `<PanelLeft />`
- **Input** (line 338) - `input`
  - Context: `<Input`
- **Separator** (line 386) - `separator`
  - Context: `<Separator`
- **Comp** (line 436) - `comp`
  - Context: `<Comp`
- **Comp** (line 457) - `comp`
  - Context: `<Comp`
- **Comp** (line 558) - `comp`
  - Context: `<Comp`
- **Tooltip** (line 579) - `tooltip`
  - Context: `<Tooltip>`
- **TooltipTrigger** (line 580) - `tooltiptrigger`
  - Context: `<TooltipTrigger asChild>{button}</TooltipTrigger>`
- **TooltipContent** (line 581) - `tooltipcontent`
  - Context: `<TooltipContent`
- **Comp** (line 603) - `comp`
  - Context: `<Comp`
- **Skeleton** (line 664) - `skeleton`
  - Context: `<Skeleton`
- **Skeleton** (line 669) - `skeleton`
  - Context: `<Skeleton`
- **Comp** (line 717) - `comp`
  - Context: `<Comp`

#### skeleton
**File:** `src/components/ui/skeleton.tsx`
**Lines:** 16

**Key Elements:**
- **HTMLDivElement** (line 6) - `htmldivelement`
  - Context: `}: React.HTMLAttributes<HTMLDivElement>) {`

#### slider
**File:** `src/components/ui/slider.tsx`
**Lines:** 27

**Key Elements:**
- **SliderPrimitive** (line 10) - `sliderprimitive`
  - Context: `<SliderPrimitive.Root`
- **SliderPrimitive** (line 18) - `sliderprimitive`
  - Context: `<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden round...`
- **SliderPrimitive** (line 19) - `sliderprimitive`
  - Context: `<SliderPrimitive.Range className="absolute h-full bg-primary" />`
- **SliderPrimitive** (line 21) - `sliderprimitive`
  - Context: `<SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-pri...`

#### Toaster
**File:** `src/components/ui/sonner.tsx`
**Lines:** 30

**Key Elements:**
- **Sonner** (line 10) - `sonner`
  - Context: `<Sonner`

#### switch
**File:** `src/components/ui/switch.tsx`
**Lines:** 28

**Key Elements:**
- **SwitchPrimitives** (line 10) - `switchprimitives`
  - Context: `<SwitchPrimitives.Root`
- **SwitchPrimitives** (line 18) - `switchprimitives`
  - Context: `<SwitchPrimitives.Thumb`

#### table
**File:** `src/components/ui/table.tsx`
**Lines:** 118

**Key Elements:**
- **HTMLTableElement** (line 7) - `htmltableelement`
  - Context: `React.HTMLAttributes<HTMLTableElement>`
- **HTMLTableSectionElement** (line 21) - `htmltablesectionelement`
  - Context: `React.HTMLAttributes<HTMLTableSectionElement>`
- **HTMLTableSectionElement** (line 29) - `htmltablesectionelement`
  - Context: `React.HTMLAttributes<HTMLTableSectionElement>`
- **HTMLTableSectionElement** (line 41) - `htmltablesectionelement`
  - Context: `React.HTMLAttributes<HTMLTableSectionElement>`
- **HTMLTableRowElement** (line 56) - `htmltablerowelement`
  - Context: `React.HTMLAttributes<HTMLTableRowElement>`
- **HTMLTableCellElement** (line 71) - `htmltablecellelement`
  - Context: `React.ThHTMLAttributes<HTMLTableCellElement>`
- **HTMLTableCellElement** (line 86) - `htmltablecellelement`
  - Context: `React.TdHTMLAttributes<HTMLTableCellElement>`
- **HTMLTableCaptionElement** (line 98) - `htmltablecaptionelement`
  - Context: `React.HTMLAttributes<HTMLTableCaptionElement>`

#### tabs
**File:** `src/components/ui/tabs.tsx`
**Lines:** 54

**Key Elements:**
- **TabsPrimitive** (line 12) - `tabsprimitive`
  - Context: `<TabsPrimitive.List`
- **TabsPrimitive** (line 27) - `tabsprimitive`
  - Context: `<TabsPrimitive.Trigger`
- **TabsPrimitive** (line 42) - `tabsprimitive`
  - Context: `<TabsPrimitive.Content`

#### textarea
**File:** `src/components/ui/textarea.tsx`
**Lines:** 25

**Key Elements:**
- **HTMLTextAreaElement** (line 6) - `htmltextareaelement`
  - Context: `extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}`
- **HTMLTextAreaElement** (line 8) - `htmltextareaelement`
  - Context: `const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(`

#### toast
**File:** `src/components/ui/toast.tsx`
**Lines:** 128

**Key Elements:**
- **ToastPrimitives** (line 14) - `toastprimitives`
  - Context: `<ToastPrimitives.Viewport`
- **ToastPrimitives** (line 47) - `toastprimitives`
  - Context: `<ToastPrimitives.Root`
- **ToastPrimitives** (line 60) - `toastprimitives`
  - Context: `<ToastPrimitives.Action`
- **ToastPrimitives** (line 75) - `toastprimitives`
  - Context: `<ToastPrimitives.Close`
- **X** (line 84) - `x`
  - Context: `<X className="h-4 w-4" />`
- **ToastPrimitives** (line 93) - `toastprimitives`
  - Context: `<ToastPrimitives.Title`
- **ToastPrimitives** (line 105) - `toastprimitives`
  - Context: `<ToastPrimitives.Description`

#### toaster
**File:** `src/components/ui/toaster.tsx`
**Lines:** 34

**Key Elements:**
- **ToastProvider** (line 15) - `toastprovider`
  - Context: `<ToastProvider>`
- **Toast** (line 18) - `toast`
  - Context: `<Toast key={id} {...props}>`
- **ToastTitle** (line 20) - `toasttitle`
  - Context: `{title && <ToastTitle>{title}</ToastTitle>}`
- **ToastDescription** (line 22) - `toastdescription`
  - Context: `<ToastDescription>{description}</ToastDescription>`
- **ToastClose** (line 26) - `toastclose`
  - Context: `<ToastClose />`
- **ToastViewport** (line 30) - `toastviewport`
  - Context: `<ToastViewport />`

#### toggle-group
**File:** `src/components/ui/toggle-group.tsx`
**Lines:** 60

**Key Elements:**
- **ToggleGroupPrimitive** (line 20) - `togglegroupprimitive`
  - Context: `<ToggleGroupPrimitive.Root`
- **ToggleGroupContext** (line 25) - `togglegroupcontext`
  - Context: `<ToggleGroupContext.Provider value={{ variant, size }}>`
- **ToggleGroupPrimitive** (line 41) - `togglegroupprimitive`
  - Context: `<ToggleGroupPrimitive.Item`

#### toggle
**File:** `src/components/ui/toggle.tsx`
**Lines:** 44

**Key Elements:**
- **TogglePrimitive** (line 34) - `toggleprimitive`
  - Context: `<TogglePrimitive.Root`

#### tooltip
**File:** `src/components/ui/tooltip.tsx`
**Lines:** 29

**Key Elements:**
- **TooltipPrimitive** (line 16) - `tooltipprimitive`
  - Context: `<TooltipPrimitive.Content`

### 📁 src/pages/

#### Debug
**File:** `src/pages/Debug.tsx`
**Lines:** 331

**Key Elements:**
- **SyncJob** (line 30) - `syncjob`
  - Context: `const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);`
- **DatabaseStats** (line 31) - `databasestats`
  - Context: `const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);`
- **Button** (line 159) - `button`
  - Context: `<Button onClick={runAllTests} disabled={loading}>`
- **Loader2** (line 161) - `loader2`
  - Context: `<Loader2 className="w-4 h-4 animate-spin mr-2" />`
- **RefreshCw** (line 163) - `refreshcw`
  - Context: `<RefreshCw className="w-4 h-4 mr-2" />`
- **Tabs** (line 169) - `tabs`
  - Context: `<Tabs defaultValue="overview" className="space-y-6">`
- **TabsList** (line 170) - `tabslist`
  - Context: `<TabsList>`
- **TabsTrigger** (line 171) - `tabstrigger`
  - Context: `<TabsTrigger value="overview">Overview</TabsTrigger>`
- **TabsTrigger** (line 172) - `tabstrigger`
  - Context: `<TabsTrigger value="database">Database</TabsTrigger>`
- **TabsTrigger** (line 173) - `tabstrigger`
  - Context: `<TabsTrigger value="sync">Sync Jobs</TabsTrigger>`
- **TabsTrigger** (line 174) - `tabstrigger`
  - Context: `<TabsTrigger value="tests">Tests</TabsTrigger>`
- **TabsContent** (line 177) - `tabscontent`
  - Context: `<TabsContent value="overview" className="space-y-6">`
- **Card** (line 179) - `card`
  - Context: `<Card>`
- **CardHeader** (line 180) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 181) - `cardtitle`
  - Context: `<CardTitle className="flex items-center">`
- **Database** (line 182) - `database`
  - Context: `<Database className="w-5 h-5 mr-2" />`
- **CardContent** (line 186) - `cardcontent`
  - Context: `<CardContent>`
- **Badge** (line 188) - `badge`
  - Context: `<Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus ...`
- **CheckCircle** (line 190) - `checkcircle`
  - Context: `<CheckCircle className="w-3 h-3 mr-1" />`
- **AlertCircle** (line 192) - `alertcircle`
  - Context: `<AlertCircle className="w-3 h-3 mr-1" />`
- **Button** (line 196) - `button`
  - Context: `<Button variant="outline" size="sm" onClick={testConnection} disabled={loading}>`
- **Card** (line 205) - `card`
  - Context: `<Card>`
- **CardHeader** (line 206) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 207) - `cardtitle`
  - Context: `<CardTitle>Database Statistics</CardTitle>`
- **CardContent** (line 209) - `cardcontent`
  - Context: `<CardContent>`
- **TabsContent** (line 233) - `tabscontent`
  - Context: `<TabsContent value="database" className="space-y-6">`
- **Card** (line 234) - `card`
  - Context: `<Card>`
- **CardHeader** (line 235) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 236) - `cardtitle`
  - Context: `<CardTitle>Database Operations</CardTitle>`
- **CardContent** (line 238) - `cardcontent`
  - Context: `<CardContent className="space-y-4">`
- **Button** (line 239) - `button`
  - Context: `<Button onClick={loadDbStats} disabled={loading}>`
- **Database** (line 240) - `database`
  - Context: `<Database className="w-4 h-4 mr-2" />`
- **TabsContent** (line 252) - `tabscontent`
  - Context: `<TabsContent value="sync" className="space-y-6">`
- **Card** (line 253) - `card`
  - Context: `<Card>`
- **CardHeader** (line 254) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 255) - `cardtitle`
  - Context: `<CardTitle className="flex items-center justify-between">`
- **Zap** (line 257) - `zap`
  - Context: `<Zap className="w-5 h-5 mr-2" />`
- **Button** (line 260) - `button`
  - Context: `<Button variant="outline" size="sm" onClick={loadSyncJobs} disabled={loading}>`
- **CardContent** (line 265) - `cardcontent`
  - Context: `<CardContent>`
- **Badge** (line 272) - `badge`
  - Context: `<Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed'...`
- **TabsContent** (line 296) - `tabscontent`
  - Context: `<TabsContent value="tests" className="space-y-6">`
- **Card** (line 297) - `card`
  - Context: `<Card>`
- **CardHeader** (line 298) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 299) - `cardtitle`
  - Context: `<CardTitle>System Tests</CardTitle>`
- **CardContent** (line 301) - `cardcontent`
  - Context: `<CardContent className="space-y-4">`
- **Badge** (line 306) - `badge`
  - Context: `<Badge variant={passed ? 'default' : 'destructive'}>`
- **Button** (line 314) - `button`
  - Context: `<Button onClick={testSyncFunction} disabled={loading} className="w-full">`
- **Zap** (line 315) - `zap`
  - Context: `<Zap className="w-4 h-4 mr-2" />`

#### Index
**File:** `src/pages/Index.tsx`
**Lines:** 319

**Key Elements:**
- **SavedFilter** (line 26) - `savedfilter`
  - Context: `const [selectedFilter, setSelectedFilter] = useState<SavedFilter | null>(null);`
- **Badge** (line 48) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700">`
- **Badge** (line 51) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-50 text-green-700">`
- **Badge** (line 54) - `badge`
  - Context: `<Badge variant="secondary" className="bg-purple-50 text-purple-700">`
- **Card** (line 62) - `card`
  - Context: `<Card>`
- **CardContent** (line 63) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Grid** (line 69) - `grid`
  - Context: `<Grid className="h-8 w-8 text-blue-500" />`
- **Card** (line 74) - `card`
  - Context: `<Card>`
- **CardContent** (line 75) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **DollarSign** (line 81) - `dollarsign`
  - Context: `<DollarSign className="h-8 w-8 text-green-500" />`
- **Card** (line 86) - `card`
  - Context: `<Card>`
- **CardContent** (line 87) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Bell** (line 93) - `bell`
  - Context: `<Bell className="h-8 w-8 text-purple-500" />`
- **Card** (line 98) - `card`
  - Context: `<Card>`
- **CardContent** (line 99) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Activity** (line 105) - `activity`
  - Context: `<Activity className="h-8 w-8 text-orange-500" />`
- **Card** (line 113) - `card`
  - Context: `<Card>`
- **CardHeader** (line 114) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 115) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **Calendar** (line 116) - `calendar`
  - Context: `<Calendar className="h-5 w-5" />`
- **CardDescription** (line 119) - `carddescription`
  - Context: `<CardDescription>Latest deals and price changes</CardDescription>`
- **CardContent** (line 121) - `cardcontent`
  - Context: `<CardContent>`
- **Calendar** (line 141) - `calendar`
  - Context: `<Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />`
- **Badge** (line 153) - `badge`
  - Context: `<Badge`
- **Card** (line 171) - `card`
  - Context: `<Card>`
- **CardHeader** (line 172) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 173) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **TrendingUp** (line 174) - `trendingup`
  - Context: `<TrendingUp className="h-5 w-5" />`
- **CardDescription** (line 177) - `carddescription`
  - Context: `<CardDescription>Popular deals this week</CardDescription>`
- **CardContent** (line 179) - `cardcontent`
  - Context: `<CardContent>`
- **Badge** (line 193) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-50 text-green-700">`
- **Card** (line 214) - `card`
  - Context: `<Card className="border-blue-200 bg-blue-50">`
- **CardContent** (line 215) - `cardcontent`
  - Context: `<CardContent className="p-4">`
- **Button** (line 221) - `button`
  - Context: `<Button`
- **ProductGrid** (line 232) - `productgrid`
  - Context: `<ProductGrid />`
- **PriceIntelligenceDashboard** (line 236) - `priceintelligencedashboard`
  - Context: `return <PriceIntelligenceDashboard />;`
- **Card** (line 239) - `card`
  - Context: `<Card>`
- **CardHeader** (line 240) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 241) - `cardtitle`
  - Context: `<CardTitle>Price Alerts</CardTitle>`
- **CardDescription** (line 242) - `carddescription`
  - Context: `<CardDescription>Manage your price tracking alerts</CardDescription>`
- **CardContent** (line 244) - `cardcontent`
  - Context: `<CardContent>`
- **Bell** (line 246) - `bell`
  - Context: `<Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />`
- **Button** (line 251) - `button`
  - Context: `<Button>Create Your First Alert</Button>`
- **Card** (line 258) - `card`
  - Context: `<Card>`
- **CardHeader** (line 259) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 260) - `cardtitle`
  - Context: `<CardTitle>Favorite Products</CardTitle>`
- **CardDescription** (line 261) - `carddescription`
  - Context: `<CardDescription>Your saved items and wishlist</CardDescription>`
- **CardContent** (line 263) - `cardcontent`
  - Context: `<CardContent>`
- **Star** (line 265) - `star`
  - Context: `<Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />`
- **Button** (line 270) - `button`
  - Context: `<Button onClick={() => setActiveView('deals')}>Browse Deals</Button>`
- **Card** (line 277) - `card`
  - Context: `<Card>`
- **CardHeader** (line 278) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 279) - `cardtitle`
  - Context: `<CardTitle>Trending Deals</CardTitle>`
- **CardDescription** (line 280) - `carddescription`
  - Context: `<CardDescription>Most popular deals this week</CardDescription>`
- **CardContent** (line 282) - `cardcontent`
  - Context: `<CardContent>`
- **TrendingUp** (line 284) - `trendingup`
  - Context: `<TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />`
- **Sidebar** (line 301) - `sidebar`
  - Context: `<Sidebar`
- **ScrollArea** (line 309) - `scrollarea`
  - Context: `<ScrollArea className="h-full">`

#### NotFound
**File:** `src/pages/NotFound.tsx`
**Lines:** 28

## 🎯 QUICK REFERENCE

### Main Components
- **Index**: `src/pages/Index.tsx`
- **Sidebar**: `src/components/Sidebar.tsx`

### Common Selectors

---
*Generated by map-generator.cjs - Do not edit manually*
