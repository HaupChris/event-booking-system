import { useState } from 'react';

/**
 * Custom hook for managing sorting state.
 * Provides consistent sorting functionality across admin pages.
 *
 * @template T - String literal type for sortBy field names
 * @param initialSortBy - The initial field to sort by
 * @param initialOrder - The initial sort order ('asc' or 'desc')
 * @returns Object containing sort state and control functions
 *
 * @example
 * const { sortBy, setSortBy, sortOrder, setSortOrder, toggleOrder } = useSort('name', 'asc');
 *
 * // Toggle between asc/desc
 * toggleOrder();
 *
 * // Change sort field
 * setSortBy('date');
 */
export function useSort<T extends string = string>(
    initialSortBy: T,
    initialOrder: 'asc' | 'desc' = 'asc'
) {
    const [sortBy, setSortBy] = useState<T>(initialSortBy);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialOrder);

    /**
     * Toggles sort order between 'asc' and 'desc'
     */
    const toggleOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    return {
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        toggleOrder
    };
}