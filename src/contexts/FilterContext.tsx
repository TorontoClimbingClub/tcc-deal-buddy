import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { generateFilterId, isFilterStateMeaningful, describeFilterState } from '../utils/filterHash';
import { filterRegistryService } from '../services/filterRegistry';

export interface GlobalFilterState {
  search: string;
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  onSale: boolean;
  discountMin: number;
  sortBy: 'price' | 'discount' | 'name' | 'date';
  viewMode: 'grid' | 'list';
  isActive: boolean; // Track if any filters are applied
}

export interface SavedFilter {
  id: string; // Now deterministic hash-based ID
  name: string;
  filters: Partial<GlobalFilterState>;
  createdAt: Date;
  count?: number; // Real product count from filtered results
  description?: string; // Auto-generated description of filter
  usageCount?: number; // How many times this filter has been used
  lastUsed?: Date; // When this filter was last applied
}

interface FilterContextType {
  filters: GlobalFilterState;
  savedFilters: SavedFilter[];
  setSearch: (search: string) => void;
  setCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setOnSale: (onSale: boolean) => void;
  setDiscountMin: (discount: number) => void;
  setSortBy: (sortBy: GlobalFilterState['sortBy']) => void;
  setViewMode: (viewMode: GlobalFilterState['viewMode']) => void;
  applyFilter: (filter: SavedFilter) => void;
  saveCurrentFilter: (name: string) => void;
  clearFilters: () => void;
  removeFilter: (filterId: string) => void;
  isFilterActive: () => boolean;
  getActiveFilterCount: () => number;
  importFilter: (filterId: string, filterState?: Partial<GlobalFilterState>) => boolean;
  updateFilterCount: (filterId: string, count: number) => void;
}

type FilterAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_BRANDS'; payload: string[] }
  | { type: 'SET_PRICE_RANGE'; payload: { min: number; max: number } }
  | { type: 'SET_ON_SALE'; payload: boolean }
  | { type: 'SET_DISCOUNT_MIN'; payload: number }
  | { type: 'SET_SORT_BY'; payload: GlobalFilterState['sortBy'] }
  | { type: 'SET_VIEW_MODE'; payload: GlobalFilterState['viewMode'] }
  | { type: 'APPLY_FILTER'; payload: Partial<GlobalFilterState> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SAVED_FILTERS'; payload: SavedFilter[] }
  | { type: 'ADD_SAVED_FILTER'; payload: SavedFilter }
  | { type: 'REMOVE_SAVED_FILTER'; payload: string };

const initialFilterState: GlobalFilterState = {
  search: '',
  categories: [],
  brands: [],
  priceRange: { min: 0, max: 10000 },
  onSale: false,
  discountMin: 0,
  sortBy: 'discount',
  viewMode: 'grid',
  isActive: false
};

// Start with empty saved filters - users create their own meaningful ones
const defaultSavedFilters: SavedFilter[] = [];

function filterReducer(state: GlobalFilterState, action: FilterAction): GlobalFilterState {
  let newState: GlobalFilterState;
  
  switch (action.type) {
    case 'SET_SEARCH':
      newState = { ...state, search: action.payload };
      break;
    case 'SET_CATEGORIES':
      newState = { ...state, categories: action.payload };
      break;
    case 'SET_BRANDS':
      newState = { ...state, brands: action.payload };
      break;
    case 'SET_PRICE_RANGE':
      newState = { ...state, priceRange: action.payload };
      break;
    case 'SET_ON_SALE':
      newState = { ...state, onSale: action.payload };
      break;
    case 'SET_DISCOUNT_MIN':
      newState = { ...state, discountMin: action.payload };
      break;
    case 'SET_SORT_BY':
      newState = { ...state, sortBy: action.payload };
      break;
    case 'SET_VIEW_MODE':
      newState = { ...state, viewMode: action.payload };
      break;
    case 'APPLY_FILTER':
      newState = { ...state, ...action.payload };
      break;
    case 'CLEAR_FILTERS':
      newState = { ...initialFilterState, viewMode: state.viewMode, sortBy: state.sortBy };
      break;
    default:
      return state;
  }

  // Update isActive based on whether any filters are applied
  newState.isActive = (
    newState.search !== '' ||
    newState.categories.length > 0 ||
    newState.brands.length > 0 ||
    newState.priceRange.min > 0 ||
    newState.priceRange.max < 10000 ||
    newState.onSale ||
    newState.discountMin > 0
  );

  return newState;
}

const FilterContext = createContext<FilterContextType | null>(null);

export const useGlobalFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>(defaultSavedFilters);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tcc-saved-filters');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedFilters(parsed);
      } catch (error) {
        console.error('Failed to parse saved filters from localStorage:', error);
      }
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tcc-saved-filters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Auto-register every filter combination to registry
  useEffect(() => {
    // Automatically register current filter state whenever it changes
    if (isFilterStateMeaningful(filters)) {
      filterRegistryService.autoRegister(filters);
    }
  }, [filters]);

  const setSearch = (search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  };

  const setCategories = (categories: string[]) => {
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  };

  const setBrands = (brands: string[]) => {
    dispatch({ type: 'SET_BRANDS', payload: brands });
  };

  const setPriceRange = (range: { min: number; max: number }) => {
    dispatch({ type: 'SET_PRICE_RANGE', payload: range });
  };

  const setOnSale = (onSale: boolean) => {
    dispatch({ type: 'SET_ON_SALE', payload: onSale });
  };

  const setDiscountMin = (discount: number) => {
    dispatch({ type: 'SET_DISCOUNT_MIN', payload: discount });
  };

  const setSortBy = (sortBy: GlobalFilterState['sortBy']) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const setViewMode = (viewMode: GlobalFilterState['viewMode']) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
  };

  const applyFilter = (filter: SavedFilter) => {
    dispatch({ type: 'APPLY_FILTER', payload: filter.filters });
  };

  const saveCurrentFilter = (name: string, productCount?: number) => {
    // Don't save empty/meaningless filters
    if (!isFilterStateMeaningful(filters)) {
      console.warn('Cannot save filter: no meaningful filters applied');
      return;
    }

    const filterId = generateFilterId(filters);
    const description = describeFilterState(filters);

    // Check if filter already exists (by ID)
    const existingFilter = savedFilters.find(f => f.id === filterId);
    if (existingFilter) {
      // Update existing filter with new name and usage
      setSavedFilters(prev => prev.map(f => 
        f.id === filterId 
          ? { 
              ...f, 
              name, 
              usageCount: (f.usageCount || 0) + 1,
              lastUsed: new Date(),
              count: productCount || f.count
            }
          : f
      ));
      return;
    }

    const newFilter: SavedFilter = {
      id: filterId,
      name,
      filters: { ...filters },
      createdAt: new Date(),
      count: productCount || 0,
      description,
      usageCount: 1,
      lastUsed: new Date()
    };
    setSavedFilters(prev => [...prev, newFilter]);
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const removeFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const importFilter = (filterId: string, filterState?: Partial<GlobalFilterState>) => {
    // If filterState not provided, try to get it from registry
    if (!filterState) {
      const registryEntry = filterRegistryService.getFilter(filterId);
      if (!registryEntry) {
        console.error(`Filter ${filterId} not found in registry`);
        return false;
      }
      filterState = registryEntry.filters;
    }

    // Apply the imported filter immediately
    dispatch({ type: 'APPLY_FILTER', payload: filterState });
    
    // Auto-register will handle adding it to registry
    return true;
  };

  const updateFilterCount = (filterId: string, count: number) => {
    // Update saved filters
    setSavedFilters(prev => prev.map(f => 
      f.id === filterId 
        ? { ...f, count, lastUsed: new Date() }
        : f
    ));
    
    // Update registry
    filterRegistryService.updateProductCount(filterId, count);
  };

  const isFilterActive = () => {
    return filters.isActive;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    if (filters.onSale) count++;
    if (filters.discountMin > 0) count++;
    return count;
  };

  const value: FilterContextType = {
    filters,
    savedFilters,
    setSearch,
    setCategories,
    setBrands,
    setPriceRange,
    setOnSale,
    setDiscountMin,
    setSortBy,
    setViewMode,
    applyFilter,
    saveCurrentFilter,
    clearFilters,
    removeFilter,
    isFilterActive,
    getActiveFilterCount,
    importFilter,
    updateFilterCount
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};