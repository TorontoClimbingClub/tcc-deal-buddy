import { GlobalFilterState, SavedFilter } from '../../contexts/FilterContext';

export interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export interface FilterSectionProps {
  filters: GlobalFilterState;
  categoriesWithCounts: Array<{
    name: string;
    count: number;
    hierarchyLevel: number;
  }>;
  brands: string[];
  priceRange: { min: number; max: number };
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
  onPriceRangeChange: (values: number[]) => void;
  onDiscountMinChange: (discount: number) => void;
  onSortByChange: (sortBy: GlobalFilterState['sortBy']) => void;
  onViewModeChange: (viewMode: GlobalFilterState['viewMode']) => void;
}

export interface ActiveFiltersSectionProps {
  activeFilterCount: number;
  filters: GlobalFilterState;
  onClearFilters: () => void;
}

export interface SearchSectionProps {
  filters: GlobalFilterState;
  onSearchChange: (search: string) => void;
}

export interface SavedFiltersSectionProps {
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string) => void;
  onApplyFilter: (filter: SavedFilter) => void;
  onRemoveFilter: (filterId: string) => void;
  onShareFilter: (filter: SavedFilter) => void;
  onImportFilter: (filterId: string) => Promise<boolean>;
  urlError?: string;
  onClearError: () => void;
}

export interface StatsSectionProps {
  dashboardStats: {
    loading: boolean;
    totalProducts: number;
    activeDeals: number;
    averageDiscount: number;
  };
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number | null;
}

export interface CollapsibleSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}