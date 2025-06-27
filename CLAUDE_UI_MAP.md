# CLAUDE UI MAP
*Auto-generated component mapping for precise UI editing*

**Last Updated:** 2025-06-27T03:15:04.973Z
**Project:** tcc-deal-buddy
**Components Scanned:** 72

## 🗺️ COMPONENT HIERARCHY

### 📁 src/components/

#### AppSidebar
**File:** `src/components/AppSidebar.tsx`
**Lines:** 2

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

#### transformBestDealToProduct
**File:** `src/components/PriceIntelligenceDashboard.tsx`
**Lines:** 526

**Key Elements:**
- **PriceIntelligenceDashboardProps** (line 48) - `priceintelligencedashboardprops`
  - Context: `export const PriceIntelligenceDashboard: React.FC<PriceIntelligenceDashboardProp...`
- **Badge** (line 136) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-100 text-green-800">`
- **TrendingDown** (line 137) - `trendingdown`
  - Context: `<TrendingDown className="h-3 w-3 mr-1" />`
- **Badge** (line 143) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-100 text-blue-800">`
- **Target** (line 144) - `target`
  - Context: `<Target className="h-3 w-3 mr-1" />`
- **Badge** (line 150) - `badge`
  - Context: `<Badge variant="outline">`
- **TrendingUp** (line 151) - `trendingup`
  - Context: `<TrendingUp className="h-3 w-3 mr-1" />`
- **Badge** (line 157) - `badge`
  - Context: `<Badge variant="secondary" className="bg-purple-100 text-purple-800">`
- **Star** (line 158) - `star`
  - Context: `<Star className="h-3 w-3 mr-1" />`
- **Card** (line 201) - `card`
  - Context: `<Card key={i}>`
- **CardContent** (line 202) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Tabs** (line 217) - `tabs`
  - Context: `<Tabs defaultValue="all-products" className="w-full">`
- **TabsList** (line 218) - `tabslist`
  - Context: `<TabsList className="grid w-full grid-cols-4">`
- **TabsTrigger** (line 219) - `tabstrigger`
  - Context: `<TabsTrigger value="all-products">All Products</TabsTrigger>`
- **TabsTrigger** (line 220) - `tabstrigger`
  - Context: `<TabsTrigger value="deals">Smart Deals</TabsTrigger>`
- **TabsTrigger** (line 221) - `tabstrigger`
  - Context: `<TabsTrigger value="categories">Category Insights</TabsTrigger>`
- **TabsTrigger** (line 222) - `tabstrigger`
  - Context: `<TabsTrigger value="trends">Market Trends</TabsTrigger>`
- **TabsContent** (line 225) - `tabscontent`
  - Context: `<TabsContent value="all-products" className="space-y-4">`
- **Card** (line 227) - `card`
  - Context: `<Card>`
- **CardHeader** (line 228) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 229) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **Search** (line 230) - `search`
  - Context: `<Search className="h-5 w-5" />`
- **Badge** (line 233) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700 ml-2">`
- **Filter** (line 234) - `filter`
  - Context: `<Filter className="h-3 w-3 mr-1" />`
- **CardDescription** (line 239) - `carddescription`
  - Context: `<CardDescription>`
- **CardContent** (line 244) - `cardcontent`
  - Context: `<CardContent>`
- **Search** (line 247) - `search`
  - Context: `<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-...`
- **Input** (line 248) - `input`
  - Context: `<Input`
- **Button** (line 255) - `button`
  - Context: `<Button onClick={handleSearch} disabled={productsLoading}>`
- **Filter** (line 264) - `filter`
  - Context: `<Filter className="h-4 w-4" />`
- **Button** (line 280) - `button`
  - Context: `<Button`
- **Button** (line 291) - `button`
  - Context: `<Button`
- **PriceHistoryChart** (line 307) - `pricehistorychart`
  - Context: `<PriceHistoryChart`
- **ProductCard** (line 334) - `productcard`
  - Context: `<ProductCard`
- **TabsContent** (line 346) - `tabscontent`
  - Context: `<TabsContent value="deals" className="space-y-4">`
- **Card** (line 348) - `card`
  - Context: `<Card>`
- **CardHeader** (line 349) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 350) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **Badge** (line 353) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700">`
- **Filter** (line 354) - `filter`
  - Context: `<Filter className="h-3 w-3 mr-1" />`
- **CardDescription** (line 359) - `carddescription`
  - Context: `<CardDescription>`
- **CardContent** (line 367) - `cardcontent`
  - Context: `<CardContent>`
- **Filter** (line 370) - `filter`
  - Context: `<Filter className="h-4 w-4" />`
- **Card** (line 385) - `card`
  - Context: `<Card key={`${deal.sku}-${deal.merchant_id}`} className="overflow-hidden">`
- **PriceTrendIndicator** (line 396) - `pricetrendindicator`
  - Context: `<PriceTrendIndicator status={deal.price_trend_status} />`
- **CardContent** (line 400) - `cardcontent`
  - Context: `<CardContent className="p-4">`
- **Badge** (line 422) - `badge`
  - Context: `<Badge variant="destructive" className="text-xs">`
- **DealQualityIndicator** (line 428) - `dealqualityindicator`
  - Context: `<DealQualityIndicator score={deal.deal_quality_score} />`
- **Button** (line 438) - `button`
  - Context: `<Button size="sm" className="w-full" asChild>`
- **TabsContent** (line 451) - `tabscontent`
  - Context: `<TabsContent value="categories" className="space-y-4">`
- **Card** (line 454) - `card`
  - Context: `<Card key={`${category.category}-${category.subcategory}`}>`
- **CardHeader** (line 455) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 456) - `cardtitle`
  - Context: `<CardTitle className="text-lg">{category.category}</CardTitle>`
- **CardDescription** (line 458) - `carddescription`
  - Context: `<CardDescription>{category.subcategory}</CardDescription>`
- **CardContent** (line 461) - `cardcontent`
  - Context: `<CardContent>`
- **Badge** (line 472) - `badge`
  - Context: `<Badge variant="outline">`
- **TabsContent** (line 505) - `tabscontent`
  - Context: `<TabsContent value="trends" className="space-y-4">`
- **Card** (line 506) - `card`
  - Context: `<Card>`
- **CardHeader** (line 507) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 508) - `cardtitle`
  - Context: `<CardTitle>Market Trends</CardTitle>`
- **CardDescription** (line 509) - `carddescription`
  - Context: `<CardDescription>`
- **CardContent** (line 513) - `cardcontent`
  - Context: `<CardContent>`
- **Clock** (line 515) - `clock`
  - Context: `<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />`

#### fetchProgress
**File:** `src/components/PriceSyncMonitor.tsx`
**Lines:** 289

**Key Elements:**
- **SyncProgress** (line 31) - `syncprogress`
  - Context: `const [progress, setProgress] = useState<SyncProgress | null>(null);`
- **ActivityStatus** (line 32) - `activitystatus`
  - Context: `const [activity, setActivity] = useState<ActivityStatus[]>([]);`
- **Button** (line 152) - `button`
  - Context: `<Button`
- **RefreshCw** (line 158) - `refreshcw`
  - Context: `<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />`
- **Button** (line 161) - `button`
  - Context: `<Button`
- **Button** (line 168) - `button`
  - Context: `<Button`
- **Button** (line 175) - `button`
  - Context: `<Button`
- **Pause** (line 182) - `pause`
  - Context: `<Pause className="h-4 w-4 mr-2" />`
- **Play** (line 187) - `play`
  - Context: `<Play className="h-4 w-4 mr-2" />`
- **Card** (line 197) - `card`
  - Context: `<Card>`
- **CardHeader** (line 198) - `cardheader`
  - Context: `<CardHeader className="pb-2">`
- **CardTitle** (line 199) - `cardtitle`
  - Context: `<CardTitle className="text-sm font-medium">Overall Progress</CardTitle>`
- **CardContent** (line 201) - `cardcontent`
  - Context: `<CardContent>`
- **Progress** (line 203) - `progress`
  - Context: `<Progress value={progress.completion_percentage} className="mt-2" />`
- **Card** (line 210) - `card`
  - Context: `<Card>`
- **CardHeader** (line 211) - `cardheader`
  - Context: `<CardHeader className="pb-2">`
- **CardTitle** (line 212) - `cardtitle`
  - Context: `<CardTitle className="text-sm font-medium">Completed</CardTitle>`
- **CardContent** (line 214) - `cardcontent`
  - Context: `<CardContent>`
- **Card** (line 220) - `card`
  - Context: `<Card>`
- **CardHeader** (line 221) - `cardheader`
  - Context: `<CardHeader className="pb-2">`
- **CardTitle** (line 222) - `cardtitle`
  - Context: `<CardTitle className="text-sm font-medium">Pending</CardTitle>`
- **CardContent** (line 224) - `cardcontent`
  - Context: `<CardContent>`
- **Card** (line 230) - `card`
  - Context: `<Card>`
- **CardHeader** (line 231) - `cardheader`
  - Context: `<CardHeader className="pb-2">`
- **CardTitle** (line 232) - `cardtitle`
  - Context: `<CardTitle className="text-sm font-medium">API Calls</CardTitle>`
- **CardContent** (line 234) - `cardcontent`
  - Context: `<CardContent>`
- **Card** (line 243) - `card`
  - Context: `<Card>`
- **CardHeader** (line 244) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 245) - `cardtitle`
  - Context: `<CardTitle>Status Breakdown</CardTitle>`
- **CardContent** (line 247) - `cardcontent`
  - Context: `<CardContent>`
- **Card** (line 275) - `card`
  - Context: `<Card>`
- **CardHeader** (line 276) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 277) - `cardtitle`
  - Context: `<CardTitle>Last Activity</CardTitle>`
- **CardContent** (line 279) - `cardcontent`
  - Context: `<CardContent>`

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
**Lines:** 321

**Key Elements:**
- **ProductGridProps** (line 32) - `productgridprops`
  - Context: `const ProductGrid: React.FC<ProductGridProps> = ({ showPriceIntelligence = false...`
- **Product** (line 33) - `product`
  - Context: `const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);`
- **Filter** (line 104) - `filter`
  - Context: `<Filter className="h-4 w-4" />`
- **Card** (line 115) - `card`
  - Context: `<Card className="border-red-200 bg-red-50">`
- **CardContent** (line 116) - `cardcontent`
  - Context: `<CardContent className="p-4">`
- **Card** (line 124) - `card`
  - Context: `<Card>`
- **CardContent** (line 125) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Package** (line 133) - `package`
  - Context: `<Package className="h-8 w-8 text-blue-500" />`
- **Card** (line 138) - `card`
  - Context: `<Card>`
- **CardContent** (line 139) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Percent** (line 145) - `percent`
  - Context: `<Percent className="h-8 w-8 text-green-500" />`
- **Card** (line 150) - `card`
  - Context: `<Card>`
- **CardContent** (line 151) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Filter** (line 157) - `filter`
  - Context: `<Filter className="h-8 w-8 text-purple-500" />`
- **Card** (line 162) - `card`
  - Context: `<Card>`
- **CardContent** (line 163) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Star** (line 169) - `star`
  - Context: `<Star className="h-8 w-8 text-red-500" />`
- **Card** (line 176) - `card`
  - Context: `<Card>`
- **CardContent** (line 177) - `cardcontent`
  - Context: `<CardContent className="p-4">`
- **Search** (line 180) - `search`
  - Context: `<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-...`
- **Input** (line 181) - `input`
  - Context: `<Input`
- **Button** (line 188) - `button`
  - Context: `<Button onClick={handleSearch} disabled={loading}>`
- **Loader2** (line 189) - `loader2`
  - Context: `{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4...`
- **Search** (line 189) - `search`
  - Context: `{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4...`
- **Badge** (line 211) - `badge`
  - Context: `<Badge variant="outline" className="text-xs">`
- **Card** (line 219) - `card`
  - Context: `<Card>`
- **CardContent** (line 220) - `cardcontent`
  - Context: `<CardContent className="py-24">`
- **Loader2** (line 222) - `loader2`
  - Context: `<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />`
- **ProductCard** (line 236) - `productcard`
  - Context: `<ProductCard`
- **Card** (line 249) - `card`
  - Context: `<Card>`
- **CardContent** (line 250) - `cardcontent`
  - Context: `<CardContent className="py-12">`
- **ShoppingBag** (line 252) - `shoppingbag`
  - Context: `<ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />`
- **Button** (line 256) - `button`
  - Context: `<Button`
- **Card** (line 270) - `card`
  - Context: `<Card>`
- **CardContent** (line 271) - `cardcontent`
  - Context: `<CardContent className="py-12">`
- **Package** (line 273) - `package`
  - Context: `<Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />`
- **Button** (line 276) - `button`
  - Context: `<Button onClick={handleSearch}>`
- **Card** (line 286) - `card`
  - Context: `<Card>`
- **CardHeader** (line 287) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 288) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **TrendingUp** (line 289) - `trendingup`
  - Context: `<TrendingUp className="h-5 w-5" />`
- **CardContent** (line 293) - `cardcontent`
  - Context: `<CardContent>`
- **ProductModal** (line 312) - `productmodal`
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

#### LogoSection
**File:** `src/components/Sidebar.tsx`
**Lines:** 867

**Key Elements:**
- **Search** (line 57) - `search`
  - Context: `<Search className="h-4 w-4 text-white" />`
- **Button** (line 82) - `button`
  - Context: `<Button`
- **Filter** (line 88) - `filter`
  - Context: `<Filter className="h-4 w-4" />`
- **Badge** (line 99) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">`
- **ChevronUp** (line 108) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 108) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Card** (line 120) - `card`
  - Context: `<Card className="border-blue-200 bg-blue-50">`
- **CardContent** (line 121) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Button** (line 142) - `button`
  - Context: `<Button`
- **X** (line 148) - `x`
  - Context: `<X className="h-3 w-3" />`
- **Button** (line 166) - `button`
  - Context: `<Button`
- **Search** (line 172) - `search`
  - Context: `<Search className="h-4 w-4" />`
- **ChevronUp** (line 188) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 188) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Search** (line 200) - `search`
  - Context: `<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-...`
- **Input** (line 201) - `input`
  - Context: `<Input`
- **Button** (line 232) - `button`
  - Context: `<Button`
- **Sliders** (line 238) - `sliders`
  - Context: `<Sliders className="h-4 w-4" />`
- **ChevronUp** (line 254) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 254) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Label** (line 268) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-1 block">Category</Label>`
- **Select** (line 269) - `select`
  - Context: `<Select`
- **SelectTrigger** (line 273) - `selecttrigger`
  - Context: `<SelectTrigger className="h-8 text-sm">`
- **SelectValue** (line 274) - `selectvalue`
  - Context: `<SelectValue placeholder="All Categories" />`
- **SelectContent** (line 276) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 277) - `selectitem`
  - Context: `<SelectItem value="all">All Categories</SelectItem>`
- **SelectItem** (line 279) - `selectitem`
  - Context: `<SelectItem key={cat.name} value={cat.name}>`
- **Badge** (line 285) - `badge`
  - Context: `<Badge variant="secondary" className="ml-2 text-xs">`
- **Label** (line 297) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-1 block">Brand</Label>`
- **Select** (line 298) - `select`
  - Context: `<Select`
- **SelectTrigger** (line 302) - `selecttrigger`
  - Context: `<SelectTrigger className="h-8 text-sm">`
- **SelectValue** (line 303) - `selectvalue`
  - Context: `<SelectValue placeholder="All Brands" />`
- **SelectContent** (line 305) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 306) - `selectitem`
  - Context: `<SelectItem value="all">All Brands</SelectItem>`
- **SelectItem** (line 308) - `selectitem`
  - Context: `<SelectItem key={brand} value={brand}>{brand}</SelectItem>`
- **Label** (line 316) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-2 block">`
- **Slider** (line 319) - `slider`
  - Context: `<Slider`
- **Label** (line 331) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-2 block">`
- **Slider** (line 334) - `slider`
  - Context: `<Slider`
- **Label** (line 346) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-1 block">Sort By</Label>`
- **Select** (line 347) - `select`
  - Context: `<Select value={filters.sortBy} onValueChange={(value: any) => setSortBy(value)}>`
- **SelectTrigger** (line 348) - `selecttrigger`
  - Context: `<SelectTrigger className="h-8 text-sm">`
- **SelectValue** (line 349) - `selectvalue`
  - Context: `<SelectValue />`
- **SelectContent** (line 351) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 352) - `selectitem`
  - Context: `<SelectItem value="discount">Best Discount</SelectItem>`
- **SelectItem** (line 353) - `selectitem`
  - Context: `<SelectItem value="price">Lowest Price</SelectItem>`
- **SelectItem** (line 354) - `selectitem`
  - Context: `<SelectItem value="name">Name A-Z</SelectItem>`
- **SelectItem** (line 355) - `selectitem`
  - Context: `<SelectItem value="date">Newest First</SelectItem>`
- **Label** (line 362) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-2 block">View Mode</Label>`
- **Button** (line 364) - `button`
  - Context: `<Button`
- **Grid3X3** (line 370) - `grid3x3`
  - Context: `<Grid3X3 className="h-3 w-3 mr-1" />`
- **Button** (line 373) - `button`
  - Context: `<Button`
- **List** (line 379) - `list`
  - Context: `<List className="h-3 w-3 mr-1" />`
- **Button** (line 416) - `button`
  - Context: `<Button`
- **Star** (line 422) - `star`
  - Context: `<Star className="h-4 w-4" />`
- **ChevronUp** (line 438) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 438) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Button** (line 449) - `button`
  - Context: `<Button`
- **Download** (line 456) - `download`
  - Context: `<Download className="h-3 w-3" />`
- **Button** (line 458) - `button`
  - Context: `<Button`
- **Plus** (line 465) - `plus`
  - Context: `<Plus className="h-3 w-3" />`
- **Card** (line 480) - `card`
  - Context: `<Card className="border-red-200 bg-red-50">`
- **CardContent** (line 481) - `cardcontent`
  - Context: `<CardContent className="p-2">`
- **Button** (line 484) - `button`
  - Context: `<Button`
- **X** (line 490) - `x`
  - Context: `<X className="h-2 w-2" />`
- **Card** (line 499) - `card`
  - Context: `<Card className="border-dashed border-blue-200">`
- **CardContent** (line 500) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Input** (line 502) - `input`
  - Context: `<Input`
- **Button** (line 509) - `button`
  - Context: `<Button size="sm" onClick={handleImportFilter} className="h-8 px-2">`
- **Download** (line 510) - `download`
  - Context: `<Download className="h-3 w-3" />`
- **Card** (line 522) - `card`
  - Context: `<Card className="border-dashed">`
- **CardContent** (line 523) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Input** (line 525) - `input`
  - Context: `<Input`
- **Button** (line 532) - `button`
  - Context: `<Button size="sm" onClick={handleSaveCurrentFilter} className="h-8 px-2">`
- **Plus** (line 533) - `plus`
  - Context: `<Plus className="h-3 w-3" />`
- **Card** (line 546) - `card`
  - Context: `<Card key={filter.id} className="border-gray-100 hover:border-blue-200 transitio...`
- **CardContent** (line 547) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Filter** (line 553) - `filter`
  - Context: `<Filter className="h-3 w-3 text-gray-400 flex-shrink-0" />`
- **Tag** (line 559) - `tag`
  - Context: `<Tag className="h-3 w-3 flex-shrink-0" />`
- **Hash** (line 567) - `hash`
  - Context: `<Hash className="h-3 w-3 flex-shrink-0" />`
- **Button** (line 571) - `button`
  - Context: `<Button`
- **Copy** (line 578) - `copy`
  - Context: `<Copy className="h-3 w-3" />`
- **Button** (line 580) - `button`
  - Context: `<Button`
- **X** (line 587) - `x`
  - Context: `<X className="h-3 w-3" />`
- **Card** (line 597) - `card`
  - Context: `<Card className="border-dashed border-gray-200">`
- **CardContent** (line 598) - `cardcontent`
  - Context: `<CardContent className="p-4 text-center">`
- **Filter** (line 599) - `filter`
  - Context: `<Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />`
- **Button** (line 622) - `button`
  - Context: `<Button`
- **BarChart3** (line 628) - `barchart3`
  - Context: `<BarChart3 className="h-4 w-4" />`
- **ChevronUp** (line 644) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 644) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Badge** (line 658) - `badge`
  - Context: `<Badge variant="secondary">{dashboardStats.loading ? '...' : dashboardStats.tota...`
- **Badge** (line 662) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-50 text-green-700">{dashboardStat...`
- **Badge** (line 666) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700">0</Badge>`
- **Badge** (line 670) - `badge`
  - Context: `<Badge variant="secondary" className="bg-purple-50 text-purple-700">{dashboardSt...`
- **SidebarProps** (line 679) - `sidebarprops`
  - Context: `const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {`
- **AceternitySidebar** (line 776) - `aceternitysidebar`
  - Context: `<AceternitySidebar animate={true}>`
- **SidebarBody** (line 777) - `sidebarbody`
  - Context: `<SidebarBody className="justify-between gap-4 bg-white border-r border-gray-200"...`
- **LogoSection** (line 781) - `logosection`
  - Context: `<LogoSection />`
- **SidebarLink** (line 790) - `sidebarlink`
  - Context: `<SidebarLink`
- **CollapsibleActiveFilters** (line 814) - `collapsibleactivefilters`
  - Context: `<CollapsibleActiveFilters`
- **QuickSearchSection** (line 820) - `quicksearchsection`
  - Context: `<QuickSearchSection`
- **AdvancedFiltersSection** (line 825) - `advancedfilterssection`
  - Context: `<AdvancedFiltersSection`
- **SavedFiltersSection** (line 838) - `savedfilterssection`
  - Context: `<SavedFiltersSection`
- **QuickStatsSection** (line 860) - `quickstatssection`
  - Context: `<QuickStatsSection dashboardStats={dashboardStats} />`

### 📁 src/components/sidebar/

#### ActiveFiltersSection
**File:** `src/components/sidebar/ActiveFiltersSection.tsx`
**Lines:** 97

**Key Elements:**
- **ActiveFiltersSectionProps** (line 10) - `activefilterssectionprops`
  - Context: `export const ActiveFiltersSection: React.FC<ActiveFiltersSectionProps> = ({`
- **Button** (line 22) - `button`
  - Context: `<Button`
- **Filter** (line 28) - `filter`
  - Context: `<Filter className="h-4 w-4" />`
- **Badge** (line 39) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">`
- **ChevronUp** (line 48) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 48) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Card** (line 60) - `card`
  - Context: `<Card className="border-blue-200 bg-blue-50">`
- **CardContent** (line 61) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Button** (line 82) - `button`
  - Context: `<Button`
- **X** (line 88) - `x`
  - Context: `<X className="h-3 w-3" />`

#### AppSidebar
**File:** `src/components/sidebar/AppSidebar.tsx`
**Lines:** 149

**Key Elements:**
- **AppSidebarProps** (line 19) - `appsidebarprops`
  - Context: `export const AppSidebar: React.FC<AppSidebarProps> = ({ activeView, onViewChange...`
- **AceternitySidebar** (line 92) - `aceternitysidebar`
  - Context: `<AceternitySidebar animate={true}>`
- **SidebarBody** (line 93) - `sidebarbody`
  - Context: `<SidebarBody className="justify-between gap-4 bg-white border-r border-gray-200"...`
- **LogoSection** (line 96) - `logosection`
  - Context: `<LogoSection />`
- **NavigationSection** (line 97) - `navigationsection`
  - Context: `<NavigationSection`
- **ActiveFiltersSection** (line 106) - `activefilterssection`
  - Context: `<ActiveFiltersSection`
- **SearchSection** (line 112) - `searchsection`
  - Context: `<SearchSection`
- **FiltersSection** (line 117) - `filterssection`
  - Context: `<FiltersSection`
- **SavedFiltersSection** (line 130) - `savedfilterssection`
  - Context: `<SavedFiltersSection`
- **StatsSection** (line 144) - `statssection`
  - Context: `<StatsSection dashboardStats={dashboardStats} />`

#### FiltersSection
**File:** `src/components/sidebar/FiltersSection.tsx`
**Lines:** 189

**Key Elements:**
- **FilterSectionProps** (line 12) - `filtersectionprops`
  - Context: `export const FiltersSection: React.FC<FilterSectionProps> = ({`
- **Button** (line 29) - `button`
  - Context: `<Button`
- **Sliders** (line 35) - `sliders`
  - Context: `<Sliders className="h-4 w-4" />`
- **ChevronUp** (line 51) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 51) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Label** (line 65) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-1 block">Category</Label>`
- **Select** (line 66) - `select`
  - Context: `<Select`
- **SelectTrigger** (line 70) - `selecttrigger`
  - Context: `<SelectTrigger className="h-8 text-sm">`
- **SelectValue** (line 71) - `selectvalue`
  - Context: `<SelectValue placeholder="All Categories" />`
- **SelectContent** (line 73) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 74) - `selectitem`
  - Context: `<SelectItem value="all">All Categories</SelectItem>`
- **SelectItem** (line 76) - `selectitem`
  - Context: `<SelectItem key={cat.name} value={cat.name}>`
- **Badge** (line 82) - `badge`
  - Context: `<Badge variant="secondary" className="ml-2 text-xs">`
- **Label** (line 94) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-1 block">Brand</Label>`
- **Select** (line 95) - `select`
  - Context: `<Select`
- **SelectTrigger** (line 99) - `selecttrigger`
  - Context: `<SelectTrigger className="h-8 text-sm">`
- **SelectValue** (line 100) - `selectvalue`
  - Context: `<SelectValue placeholder="All Brands" />`
- **SelectContent** (line 102) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 103) - `selectitem`
  - Context: `<SelectItem value="all">All Brands</SelectItem>`
- **SelectItem** (line 105) - `selectitem`
  - Context: `<SelectItem key={brand} value={brand}>{brand}</SelectItem>`
- **Label** (line 113) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-2 block">`
- **Slider** (line 116) - `slider`
  - Context: `<Slider`
- **Label** (line 128) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-2 block">`
- **Slider** (line 131) - `slider`
  - Context: `<Slider`
- **Label** (line 143) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-1 block">Sort By</Label>`
- **Select** (line 144) - `select`
  - Context: `<Select`
- **SelectTrigger** (line 148) - `selecttrigger`
  - Context: `<SelectTrigger className="h-8 text-sm">`
- **SelectValue** (line 149) - `selectvalue`
  - Context: `<SelectValue />`
- **SelectContent** (line 151) - `selectcontent`
  - Context: `<SelectContent>`
- **SelectItem** (line 152) - `selectitem`
  - Context: `<SelectItem value="discount">Best Discount</SelectItem>`
- **SelectItem** (line 153) - `selectitem`
  - Context: `<SelectItem value="price">Lowest Price</SelectItem>`
- **SelectItem** (line 154) - `selectitem`
  - Context: `<SelectItem value="name">Name A-Z</SelectItem>`
- **SelectItem** (line 155) - `selectitem`
  - Context: `<SelectItem value="date">Newest First</SelectItem>`
- **Label** (line 162) - `label`
  - Context: `<Label className="text-xs text-gray-600 mb-2 block">View Mode</Label>`
- **Button** (line 164) - `button`
  - Context: `<Button`
- **Grid3X3** (line 170) - `grid3x3`
  - Context: `<Grid3X3 className="h-3 w-3 mr-1" />`
- **Button** (line 173) - `button`
  - Context: `<Button`
- **List** (line 179) - `list`
  - Context: `<List className="h-3 w-3 mr-1" />`

#### LogoSection
**File:** `src/components/sidebar/LogoSection.tsx`
**Lines:** 31

**Key Elements:**
- **Search** (line 12) - `search`
  - Context: `<Search className="h-4 w-4 text-white" />`

#### NavigationSection
**File:** `src/components/sidebar/NavigationSection.tsx`
**Lines:** 44

**Key Elements:**
- **NavigationSectionProps** (line 11) - `navigationsectionprops`
  - Context: `export const NavigationSection: React.FC<NavigationSectionProps> = ({`
- **SidebarLink** (line 23) - `sidebarlink`
  - Context: `<SidebarLink`

#### SavedFiltersSection
**File:** `src/components/sidebar/SavedFiltersSection.tsx`
**Lines:** 257

**Key Elements:**
- **SavedFiltersSectionProps** (line 22) - `savedfilterssectionprops`
  - Context: `export const SavedFiltersSection: React.FC<SavedFiltersSectionProps> = ({`
- **Button** (line 60) - `button`
  - Context: `<Button`
- **Star** (line 66) - `star`
  - Context: `<Star className="h-4 w-4" />`
- **ChevronUp** (line 82) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 82) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Button** (line 93) - `button`
  - Context: `<Button`
- **Download** (line 100) - `download`
  - Context: `<Download className="h-3 w-3" />`
- **Button** (line 102) - `button`
  - Context: `<Button`
- **Plus** (line 109) - `plus`
  - Context: `<Plus className="h-3 w-3" />`
- **Card** (line 124) - `card`
  - Context: `<Card className="border-red-200 bg-red-50">`
- **CardContent** (line 125) - `cardcontent`
  - Context: `<CardContent className="p-2">`
- **Button** (line 128) - `button`
  - Context: `<Button`
- **X** (line 134) - `x`
  - Context: `<X className="h-2 w-2" />`
- **Card** (line 143) - `card`
  - Context: `<Card className="border-dashed border-blue-200">`
- **CardContent** (line 144) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Input** (line 146) - `input`
  - Context: `<Input`
- **Button** (line 153) - `button`
  - Context: `<Button size="sm" onClick={handleImportFilter} className="h-8 px-2">`
- **Download** (line 154) - `download`
  - Context: `<Download className="h-3 w-3" />`
- **Card** (line 166) - `card`
  - Context: `<Card className="border-dashed">`
- **CardContent** (line 167) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Input** (line 169) - `input`
  - Context: `<Input`
- **Button** (line 176) - `button`
  - Context: `<Button size="sm" onClick={handleSaveCurrentFilter} className="h-8 px-2">`
- **Plus** (line 177) - `plus`
  - Context: `<Plus className="h-3 w-3" />`
- **Card** (line 190) - `card`
  - Context: `<Card key={filter.id} className="border-gray-100 hover:border-blue-200 transitio...`
- **CardContent** (line 191) - `cardcontent`
  - Context: `<CardContent className="p-3">`
- **Filter** (line 197) - `filter`
  - Context: `<Filter className="h-3 w-3 text-gray-400 flex-shrink-0" />`
- **Tag** (line 203) - `tag`
  - Context: `<Tag className="h-3 w-3 flex-shrink-0" />`
- **Hash** (line 211) - `hash`
  - Context: `<Hash className="h-3 w-3 flex-shrink-0" />`
- **Button** (line 215) - `button`
  - Context: `<Button`
- **Copy** (line 222) - `copy`
  - Context: `<Copy className="h-3 w-3" />`
- **Button** (line 224) - `button`
  - Context: `<Button`
- **X** (line 231) - `x`
  - Context: `<X className="h-3 w-3" />`
- **Card** (line 241) - `card`
  - Context: `<Card className="border-dashed border-gray-200">`
- **CardContent** (line 242) - `cardcontent`
  - Context: `<CardContent className="p-4 text-center">`
- **Filter** (line 243) - `filter`
  - Context: `<Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />`

#### SearchSection
**File:** `src/components/sidebar/SearchSection.tsx`
**Lines:** 64

**Key Elements:**
- **SearchSectionProps** (line 9) - `searchsectionprops`
  - Context: `export const SearchSection: React.FC<SearchSectionProps> = ({`
- **Button** (line 18) - `button`
  - Context: `<Button`
- **Search** (line 24) - `search`
  - Context: `<Search className="h-4 w-4" />`
- **ChevronUp** (line 40) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 40) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Search** (line 52) - `search`
  - Context: `<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-...`
- **Input** (line 53) - `input`
  - Context: `<Input`

#### StatsSection
**File:** `src/components/sidebar/StatsSection.tsx`
**Lines:** 76

**Key Elements:**
- **StatsSectionProps** (line 9) - `statssectionprops`
  - Context: `export const StatsSection: React.FC<StatsSectionProps> = ({ dashboardStats }) =>...`
- **Button** (line 15) - `button`
  - Context: `<Button`
- **BarChart3** (line 21) - `barchart3`
  - Context: `<BarChart3 className="h-4 w-4" />`
- **ChevronUp** (line 37) - `chevronup`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **ChevronDown** (line 37) - `chevrondown`
  - Context: `{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4"...`
- **Badge** (line 51) - `badge`
  - Context: `<Badge variant="secondary">`
- **Badge** (line 57) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-50 text-green-700">`
- **Badge** (line 63) - `badge`
  - Context: `<Badge variant="secondary" className="bg-blue-50 text-blue-700">0</Badge>`
- **Badge** (line 67) - `badge`
  - Context: `<Badge variant="secondary" className="bg-purple-50 text-purple-700">`

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

#### useSidebar
**File:** `src/components/ui/aceternity-sidebar.tsx`
**Lines:** 218

**Key Elements:**
- **React** (line 15) - `react`
  - Context: `setOpen: React.Dispatch<React.SetStateAction<boolean>>;`
- **SidebarContextProps** (line 19) - `sidebarcontextprops`
  - Context: `const SidebarContext = createContext<SidebarContextProps | undefined>(`
- **React** (line 53) - `react`
  - Context: `setOpen?: React.Dispatch<React.SetStateAction<boolean>>;`
- **SidebarContext** (line 62) - `sidebarcontext`
  - Context: `<SidebarContext.Provider value={{ open, setOpen, animate: animate }}>`
- **React** (line 76) - `react`
  - Context: `setOpen?: React.Dispatch<React.SetStateAction<boolean>>;`
- **SidebarProvider** (line 80) - `sidebarprovider`
  - Context: `<SidebarProvider open={open} setOpen={setOpen} animate={animate}>`
- **DesktopSidebar** (line 89) - `desktopsidebar`
  - Context: `<DesktopSidebar {...props} />`
- **MobileSidebar** (line 90) - `mobilesidebar`
  - Context: `<MobileSidebar {...(props as React.ComponentProps<"div">)} />`
- **Menu** (line 141) - `menu`
  - Context: `<Menu`
- **AnimatePresence** (line 146) - `animatepresence`
  - Context: `<AnimatePresence>`
- **X** (line 176) - `x`
  - Context: `<X />`

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

#### DashboardContent
**File:** `src/pages/Index.tsx`
**Lines:** 305

**Key Elements:**
- **Badge** (line 40) - `badge`
  - Context: `<Badge variant="secondary" className="bg-orange-50 text-orange-700">`
- **Filter** (line 41) - `filter`
  - Context: `<Filter className="h-3 w-3 mr-1" />`
- **Card** (line 50) - `card`
  - Context: `<Card>`
- **CardContent** (line 51) - `cardcontent`
  - Context: `<CardContent className="p-6">`
- **Grid** (line 64) - `grid`
  - Context: `<Grid className="h-8 w-8 text-blue-500" />`
- **Card** (line 69) - `card`
  - Context: `<Card>`
- **CardContent** (line 70) - `cardcontent`
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
- **Activity** (line 109) - `activity`
  - Context: `<Activity className="h-8 w-8 text-orange-500" />`
- **Card** (line 117) - `card`
  - Context: `<Card>`
- **CardHeader** (line 118) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 119) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **Calendar** (line 120) - `calendar`
  - Context: `<Calendar className="h-5 w-5" />`
- **CardDescription** (line 123) - `carddescription`
  - Context: `<CardDescription>Latest deals and price changes</CardDescription>`
- **CardContent** (line 125) - `cardcontent`
  - Context: `<CardContent>`
- **Calendar** (line 145) - `calendar`
  - Context: `<Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />`
- **Badge** (line 157) - `badge`
  - Context: `<Badge`
- **Card** (line 175) - `card`
  - Context: `<Card>`
- **CardHeader** (line 176) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 177) - `cardtitle`
  - Context: `<CardTitle className="flex items-center gap-2">`
- **TrendingUp** (line 178) - `trendingup`
  - Context: `<TrendingUp className="h-5 w-5" />`
- **CardDescription** (line 181) - `carddescription`
  - Context: `<CardDescription>Popular deals this week</CardDescription>`
- **CardContent** (line 183) - `cardcontent`
  - Context: `<CardContent>`
- **Badge** (line 197) - `badge`
  - Context: `<Badge variant="secondary" className="bg-green-50 text-green-700">`
- **ProductGrid** (line 215) - `productgrid`
  - Context: `return <ProductGrid />;`
- **PriceIntelligenceDashboard** (line 217) - `priceintelligencedashboard`
  - Context: `return <PriceIntelligenceDashboard />;`
- **Card** (line 220) - `card`
  - Context: `<Card>`
- **CardHeader** (line 221) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 222) - `cardtitle`
  - Context: `<CardTitle>Price Alerts</CardTitle>`
- **CardDescription** (line 223) - `carddescription`
  - Context: `<CardDescription>Manage your price tracking alerts</CardDescription>`
- **CardContent** (line 225) - `cardcontent`
  - Context: `<CardContent>`
- **Bell** (line 227) - `bell`
  - Context: `<Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />`
- **Button** (line 232) - `button`
  - Context: `<Button>Create Your First Alert</Button>`
- **Card** (line 239) - `card`
  - Context: `<Card>`
- **CardHeader** (line 240) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 241) - `cardtitle`
  - Context: `<CardTitle>Favorite Products</CardTitle>`
- **CardDescription** (line 242) - `carddescription`
  - Context: `<CardDescription>Your saved items and wishlist</CardDescription>`
- **CardContent** (line 244) - `cardcontent`
  - Context: `<CardContent>`
- **Star** (line 246) - `star`
  - Context: `<Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />`
- **Button** (line 251) - `button`
  - Context: `<Button onClick={() => setActiveView('deals')}>Browse Deals</Button>`
- **Card** (line 258) - `card`
  - Context: `<Card>`
- **CardHeader** (line 259) - `cardheader`
  - Context: `<CardHeader>`
- **CardTitle** (line 260) - `cardtitle`
  - Context: `<CardTitle>Trending Deals</CardTitle>`
- **CardDescription** (line 261) - `carddescription`
  - Context: `<CardDescription>Most popular deals this week</CardDescription>`
- **CardContent** (line 263) - `cardcontent`
  - Context: `<CardContent>`
- **TrendingUp** (line 265) - `trendingup`
  - Context: `<TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />`
- **AppSidebar** (line 281) - `appsidebar`
  - Context: `<AppSidebar`
- **FilterProvider** (line 298) - `filterprovider`
  - Context: `<FilterProvider>`
- **DashboardContent** (line 299) - `dashboardcontent`
  - Context: `<DashboardContent />`

#### NotFound
**File:** `src/pages/NotFound.tsx`
**Lines:** 28

## 🎯 QUICK REFERENCE

### Main Components
- **AppSidebar**: `src/components/AppSidebar.tsx`
- **AppSidebar**: `src/components/sidebar/AppSidebar.tsx`
- **useSidebar**: `src/components/ui/aceternity-sidebar.tsx`

### Common Selectors

---
*Generated by map-generator.cjs - Do not edit manually*
