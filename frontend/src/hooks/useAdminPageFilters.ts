import { useState } from 'react';
import type { ViewFilterType } from '../form/adminArea/utils/optionsUtils';

/**
 * Custom hook for managing common filter state in admin pages.
 * Consolidates the repeated pattern of viewType and anchorEl state management
 * used across admin pages for filtering between all/regular/artist bookings.
 *
 * @param initialViewType - The initial view filter type (defaults to 'all')
 * @returns Object containing filter state and control functions
 *
 * @example
 * const { viewType, setViewType, anchorEl, setAnchorEl } = useAdminPageFilters();
 *
 * // Use with FilterControls component
 * <FilterControls
 *   viewType={viewType}
 *   setViewType={setViewType}
 *   anchorEl={anchorEl}
 *   setAnchorEl={setAnchorEl}
 * />
 */
export function useAdminPageFilters(initialViewType: ViewFilterType = 'all') {
    const [viewType, setViewType] = useState<ViewFilterType>(initialViewType);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    return {
        viewType,
        setViewType,
        anchorEl,
        setAnchorEl
    };
}