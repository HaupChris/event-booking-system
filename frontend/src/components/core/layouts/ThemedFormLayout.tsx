import type { ReactNode } from 'react';
import React from 'react';
import { useThemeMode } from '../../styles/theme';
import SpacePanelLayout from './SpacePanelLayout';
import CircusPanelLayout from './CircusPanelLayout';

interface ThemedFormLayoutProps {
  children: ReactNode;
  title?: string;
  missionBriefing?: string;
  footerId?: string;
  maxWidth?: string | number;
}

/**
 * Theme-agnostic form layout wrapper
 * Automatically selects the appropriate layout component based on the current theme mode
 * This creates a separation between form functionality and theme-specific presentation
 */
const ThemedFormLayout: React.FC<ThemedFormLayoutProps> = ({
  children,
  title,
  missionBriefing,
  footerId,
  maxWidth,
}) => {
  const { mode } = useThemeMode();

  // Select layout based on theme mode
  if (mode === 'circus') {
    return (
      <CircusPanelLayout
        title={title}
        missionBriefing={missionBriefing}
        footerId={footerId}
        maxWidth={maxWidth}
      >
        {children}
      </CircusPanelLayout>
    );
  }

  // Default to space theme for 'dark' and 'light' modes
  return (
    <SpacePanelLayout
      title={title}
      missionBriefing={missionBriefing}
      footerId={footerId}
      maxWidth={maxWidth}
    >
      {children}
    </SpacePanelLayout>
  );
};

export default ThemedFormLayout;
