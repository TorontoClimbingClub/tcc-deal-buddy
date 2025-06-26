/**
 * Hook for handling filter sharing via URL parameters
 * Enables users to share filter combinations through URLs
 */

import { useEffect, useState } from 'react';
import { useGlobalFilters } from '../contexts/FilterContext';
import { parseFilterId, isValidFilterId } from '../utils/filterHash';
import { filterRegistryService } from '../services/filterRegistry';

interface UrlFilterState {
  isLoadingFromUrl: boolean;
  urlFilterId: string | null;
  error: string | null;
}

export const useUrlFilters = () => {
  const { filters, importFilter } = useGlobalFilters();
  const [state, setState] = useState<UrlFilterState>({
    isLoadingFromUrl: false,
    urlFilterId: null,
    error: null
  });

  // Check URL for filter parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam) {
      const filterId = parseFilterId(filterParam);
      
      if (filterId && isValidFilterId(filterId)) {
        setState(prev => ({ 
          ...prev, 
          isLoadingFromUrl: true, 
          urlFilterId: filterId,
          error: null 
        }));

        // Try to get filter from automatic registry
        const success = importFilter(filterId);
        
        if (success) {
          setState(prev => ({ 
            ...prev, 
            isLoadingFromUrl: false 
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoadingFromUrl: false,
            error: `Filter ${filterId} not found in registry.`
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Invalid filter ID in URL' 
        }));
      }

      // Clean URL after processing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('filter');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [importFilter]);

  // Get current filter ID for sharing
  const getCurrentFilterId = (): string | null => {
    try {
      // Auto-register current filters and get ID
      const currentFilterId = filterRegistryService.autoRegister(filters);
      
      if (currentFilterId && currentFilterId !== 'default0') {
        return currentFilterId;
      }

      setState(prev => ({ 
        ...prev, 
        error: 'No meaningful filters applied to share' 
      }));
      return null;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to generate filter ID' 
      }));
      return null;
    }
  };

  // Copy filter ID to clipboard
  const copyFilterId = async (): Promise<boolean> => {
    const filterId = getCurrentFilterId();
    
    if (!filterId) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(filterId);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to copy filter ID to clipboard' 
      }));
      return false;
    }
  };

  // Import filter by ID (for manual entry)
  const importFilterById = async (filterId: string): Promise<boolean> => {
    const cleanId = parseFilterId(filterId);
    
    if (!cleanId || !isValidFilterId(cleanId)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Invalid filter ID format. Please enter an 8-character alphanumeric code.' 
      }));
      return false;
    }

    // Try to import from automatic registry
    const success = importFilter(cleanId);
    
    if (success) {
      setState(prev => ({ 
        ...prev, 
        error: null 
      }));
      return true;
    }

    setState(prev => ({ 
      ...prev, 
      error: `Filter ${cleanId} not found. This filter combination hasn't been created yet.` 
    }));
    return false;
  };

  // Clear any error state
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    isLoadingFromUrl: state.isLoadingFromUrl,
    urlFilterId: state.urlFilterId,
    error: state.error,
    getCurrentFilterId,
    copyFilterId,
    importFilterById,
    clearError
  };
};

export default useUrlFilters;