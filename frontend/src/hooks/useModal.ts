import { useState } from 'react';

/**
 * Custom hook for managing modal state and selected items.
 * Provides a consistent interface for opening/closing modals and managing their content.
 *
 * @template T - The type of item being displayed/edited in the modal
 * @returns Object containing modal state and control functions
 *
 * @example
 * const { selectedItem, isOpen, open, close } = useModal<Booking>();
 *
 * // Open modal with an item
 * open(bookingItem);
 *
 * // Close modal and clear selection
 * close();
 */
export function useModal<T = unknown>() {
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Opens the modal and sets the selected item
     */
    const open = (item: T) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    /**
     * Closes the modal and clears the selected item
     */
    const close = () => {
        setIsOpen(false);
        setSelectedItem(null);
    };

    return {
        selectedItem,
        isOpen,
        open,
        close
    };
}
