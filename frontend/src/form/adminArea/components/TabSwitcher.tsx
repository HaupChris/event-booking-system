import React from 'react';
import { Box, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { adminPalette } from '../theme/adminPalette';

interface TabOption {
  value: string;
  label: string;
  icon?: React.ReactElement;
}

interface TabSwitcherProps {
  tabs: TabOption[];
  currentTab: string;
  onChange: (value: string) => void;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ tabs, currentTab, onChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: adminPalette.divider,
        mb: 3,
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleChange}
        centered
        variant={isMobile ? 'fullWidth' : 'standard'}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: isMobile ? '0.875rem' : '1rem',
            minWidth: isMobile ? 'auto' : 120,
          },
          '& .Mui-selected': {
            color: adminPalette.primary.main,
            fontWeight: 'medium',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: adminPalette.primary.main,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={isMobile ? '' : tab.label} // Changed from undefined to empty string
            value={tab.value}
            icon={isMobile ? tab.icon : undefined}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabSwitcher;
