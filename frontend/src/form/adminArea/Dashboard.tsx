import React, { useState } from 'react';
import {
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Home,
  SportsBar,
  Handyman,
  LunchDining,
  Work,
  People,
  LocalActivity,
  Download,
  EuroSymbol,
  PointOfSale,
  School,
  AssignmentInd,
  Settings,
  Newspaper,
  Help,
  Groups,
} from '@mui/icons-material';
import ListItemButton from '@mui/material/ListItemButton';
import { CSVLink } from 'react-csv';
import { getExportDataByTab } from './services/exportService';
import { adminTheme } from './theme/adminTheme';

import HomePage from './HomePage';
import BookingsPage from './BookingsPage';
import TicketsPage from './TicketsPage';
import BeveragesPage from './BeveragesPage';
import FoodPage from './FoodPage';
import MaterialsPage from './MaterialsPage';
import WorkshiftsPage from './WorkshiftsPage';
import ArtistMaterialsPage from './ArtistMaterialsPage';
import FinancialsOverviewPage from './FinancialsOverviewPage';
import PaymentConfirmationsPage from './PaymentConfirmationsPage';
import { useFetchData } from './useFetchData';
import ProfessionsPage from './ProfessionsPage';
import ShiftAssignmentsPage from './ShiftAssignments';
import NewsManagementPage from './NewsManagementPage';
import FAQManagementPage from './FAQManagementPage';
import SettingsPage from './SettingsPage';
import OrgaTeamPage from './OrgaTeamPage';

const SIDEBAR_WIDTH = 240;

interface NavItem {
  id: string;
  label: string;
  icon: React.JSX.Element;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'home', label: 'Home', icon: <Home /> },
      { id: 'bookings', label: 'Bookings', icon: <People /> },
    ],
  },
  {
    label: 'Options',
    items: [
      { id: 'tickets', label: 'Tickets', icon: <LocalActivity /> },
      { id: 'beverages', label: 'Beer', icon: <SportsBar /> },
      { id: 'food', label: 'Food', icon: <LunchDining /> },
      { id: 'materials', label: 'Material', icon: <Handyman /> },
      { id: 'workShifts', label: 'Support', icon: <Work /> },
      { id: 'professions', label: 'Professions', icon: <School /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'financials', label: 'Financials', icon: <EuroSymbol /> },
      { id: 'payments', label: 'Payments', icon: <PointOfSale /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'shiftAssignments', label: 'Shift Assignments', icon: <AssignmentInd /> },
      { id: 'orgaTeam', label: 'Orga Team', icon: <Groups /> },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'news', label: 'News', icon: <Newspaper /> },
      { id: 'faqs', label: 'FAQ', icon: <Help /> },
    ],
  },
  {
    label: 'System',
    items: [{ id: 'settings', label: 'Settings', icon: <Settings /> }],
  },
];

const exportableTabs = new Set([
  'bookings',
  'tickets',
  'beverages',
  'food',
  'materials',
  'artistMaterials',
  'workShifts',
  'financials',
  'payments',
]);

function Dashboard() {
  const { regularBookings, artistBookings, formContent, artistFormContent } = useFetchData();
  const [activeTab, setActiveTab] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery(adminTheme.breakpoints.up('md'));

  const activeItem = navGroups.flatMap((g) => g.items).find((i) => i.id === activeTab);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (!isDesktop) setMobileOpen(false);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'bookings':
        return <BookingsPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'beverages':
        return <BeveragesPage />;
      case 'food':
        return <FoodPage />;
      case 'materials':
        return <MaterialsPage />;
      case 'workShifts':
        return <WorkshiftsPage />;
      case 'artistMaterials':
        return <ArtistMaterialsPage />;
      case 'financials':
        return <FinancialsOverviewPage />;
      case 'payments':
        return <PaymentConfirmationsPage />;
      case 'shiftAssignments':
        return <ShiftAssignmentsPage />;
      case 'professions':
        return <ProfessionsPage />;
      case 'news':
        return <NewsManagementPage />;
      case 'faqs':
        return <FAQManagementPage />;
      case 'settings':
        return <SettingsPage />;
      case 'orgaTeam':
        return <OrgaTeamPage />;
      default:
        return <HomePage />;
    }
  };

  const getExportData = () =>
    getExportDataByTab(activeTab, regularBookings, artistBookings, formContent, artistFormContent);

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2 }}>
      <Typography
        variant="h6"
        sx={{ px: 2.5, mb: 2, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}
      >
        Admin
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {navGroups.map((group, gi) => (
          <React.Fragment key={group.label}>
            {gi > 0 && <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />}
            <Typography
              variant="caption"
              sx={{
                px: 2.5,
                py: 0.5,
                display: 'block',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.65rem',
              }}
            >
              {group.label}
            </Typography>
            <List dense disablePadding>
              {group.items.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={activeTab === item.id}
                  onClick={() => handleNavClick(item.id)}
                  sx={{ py: 0.75 }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <Box
            component="nav"
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              bgcolor: adminTheme.palette.background?.default,
            }}
          >
            <Drawer variant="permanent" sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}>
              {sidebarContent}
            </Drawer>
          </Box>
        )}

        {/* Mobile drawer */}
        {!isDesktop && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
          >
            {sidebarContent}
          </Drawer>
        )}

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default',
          }}
        >
          {/* Top bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: { xs: 2, md: 3 },
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            {!isDesktop && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              {activeItem?.icon}
              <Typography variant="h6">{activeItem?.label ?? 'Home'}</Typography>
            </Box>
            {exportableTabs.has(activeTab) && (
              <CSVLink
                data={getExportData()}
                filename={`${activeTab}_data.csv`}
                style={{ textDecoration: 'none' }}
              >
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Download />
                </IconButton>
              </CSVLink>
            )}
          </Box>

          {/* Page content */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>{renderPage()}</Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;
