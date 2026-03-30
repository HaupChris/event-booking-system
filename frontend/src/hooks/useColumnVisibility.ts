/**
 * Custom hook for managing column visibility in tables
 * Handles responsive column hiding and user column selection
 */

import type React from 'react';
import { useState, useEffect } from 'react';

export interface ColumnVisibilityState {
  [key: string]: boolean;
}

interface UseColumnVisibilityConfig<T extends ColumnVisibilityState> {
  initialVisibility: T;
  mobileHiddenColumns?: (keyof T)[];
  isMobile: boolean;
}

export function useColumnVisibility<T extends ColumnVisibilityState>({
  initialVisibility,
  mobileHiddenColumns = [],
  isMobile,
}: UseColumnVisibilityConfig<T>) {
  const [columnVisibility, setColumnVisibility] = useState<T>(initialVisibility);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Update visibility when screen size changes
  useEffect(() => {
    if (mobileHiddenColumns.length === 0) return;

    setColumnVisibility((prev) => {
      const updated = { ...prev };
      mobileHiddenColumns.forEach((col) => {
        updated[col] = !isMobile as T[keyof T];
      });
      return updated;
    });
  }, [isMobile, mobileHiddenColumns]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleColumn = (column: keyof T) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  return {
    columnVisibility,
    anchorEl,
    handleOpen,
    handleClose,
    toggleColumn,
    isOpen: Boolean(anchorEl),
  };
}
