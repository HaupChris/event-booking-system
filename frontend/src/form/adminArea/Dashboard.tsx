import React, {useState} from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    Box,
    Paper,
} from '@mui/material';
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
    AccountBox,
    Newspaper
} from '@mui/icons-material';
import ListItemButton from "@mui/material/ListItemButton";
import {CSVLink} from "react-csv";
import { getExportDataByTab } from './services/exportService';

// Import all page components
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
import {useFetchData} from './useFetchData';
import ProfessionsPage from "./ProfessionsPage";
import ShiftAssignmentsPage from "./ShiftAssignments";
import ProfileManagementPage from "./ProfileManagementPage";
import NewsManagementPage from "./NewsManagementPage";
// import {TokenContext} from "../../contexts/AuthContext";
// import {ShiftAssignment} from "./ShiftAssignments/types";


// Define all possible dashboard tabs
interface DashboardTab {
    id: string;
    label: string;
    icon: React.JSX.Element;
    permissions: string[];
}

const dashboardTabs: DashboardTab[] = [
    {id: 'home', label: 'Home', icon: <Home/>, permissions: ['read']},
    {id: 'bookings', label: 'Bookings', icon: <People/>, permissions: ['read']},
    {id: 'tickets', label: 'Tickets', icon: <LocalActivity/>, permissions: ['read']},
    {id: 'beverages', label: 'Beer', icon: <SportsBar/>, permissions: ['read']},
    {id: 'food', label: 'Food', icon: <LunchDining/>, permissions: ['read']},
    {id: 'materials', label: 'Material', icon: <Handyman/>, permissions: ['read']},
    {id: 'workShifts', label: 'Support', icon: <Work/>, permissions: ['read']},
    {id: 'professions', label: 'Professions', icon: <School/>, permissions: ['read']},
    {id: 'financials', label: 'Financials', icon: <EuroSymbol/>, permissions: ['financial']},
    {id: 'payments', label: 'Payments', icon: <PointOfSale/>, permissions: ['financial']},
    {id: 'shiftAssignments', label: 'Shift Assignments', icon: <AssignmentInd/>, permissions: ['read']},
    {id: 'profiles', label: 'Profile Management', icon: <AccountBox/>, permissions: ['read']},
    {id: 'news', label: 'News Management', icon: <Newspaper/>, permissions: ['read']}
];

function Dashboard() {
    // Use fetch hook for data
    const {
        regularBookings,
        artistBookings,
        formContent,
        artistFormContent,
    } = useFetchData();


    const [activeTab, setActiveTab] = useState('home');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Assume admin permissions for this implementation
    const adminPermissions = ['read', 'financial', 'shift_management'];

    // Filter tabs based on admin permissions
    const authorizedTabs = dashboardTabs.filter(tab =>
        tab.permissions.some(perm => adminPermissions.includes(perm))
    );

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleMenuClick = (tabId: string) => {
        setActiveTab(tabId);
        setDrawerOpen(false);
    };

    const renderPage = () => {
        switch (activeTab) {
            case 'home':
                return <HomePage/>;
            case 'bookings':
                return <BookingsPage/>;
            case 'tickets':
                return <TicketsPage/>;
            case 'beverages':
                return <BeveragesPage/>;
            case 'food':
                return <FoodPage/>;
            case 'materials':
                return <MaterialsPage/>;
            case 'workShifts':
                return <WorkshiftsPage/>;
            case 'artistMaterials':
                return <ArtistMaterialsPage/>;
            case 'financials':
                return <FinancialsOverviewPage/>;
            case 'payments':
                return <PaymentConfirmationsPage/>;
            case 'shiftAssignments':
                return <ShiftAssignmentsPage/>;
            case 'professions':
                return <ProfessionsPage/>;
            case 'profiles':
                return <ProfileManagementPage/>;
            case 'news':
                return <NewsManagementPage/>;
            default:
                return <HomePage/>;
        }
    };

    const getExportData = () => {
        return getExportDataByTab(
            activeTab,
            regularBookings,
            artistBookings,
            formContent,
            artistFormContent
        );
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
                        <MenuIcon/>
                    </IconButton>
                    <Box display="flex" flexGrow={1} justifyContent="center">
                        <Typography variant="h6" display="flex" alignItems="center">
                            {/* Display the active tab icon */}
                            {authorizedTabs.find(tab => tab.id === activeTab)?.icon}
                            <span style={{marginLeft: '8px'}}>
                                    {authorizedTabs.find(tab => tab.id === activeTab)?.label}
                                </span>
                        </Typography>
                    </Box>

                    {/* Export button - only show for tabs with data */}
                    {activeTab !== 'home' && (
                        <CSVLink
                            data={getExportData()}
                            filename={`${activeTab}_data.csv`}
                            style={{textDecoration: 'none'}}
                        >
                            <IconButton edge="end" color="inherit">
                                <Download/>
                            </IconButton>
                        </CSVLink>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
                <List>
                    {authorizedTabs.map((tab) => (
                        <ListItemButton
                            onClick={() => handleMenuClick(tab.id)}
                            key={tab.id}
                            selected={activeTab === tab.id}
                        >
                            <ListItemIcon>{tab.icon}</ListItemIcon>
                            <ListItemText primary={tab.label}/>
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box component="main"
                 sx={{
                     flexGrow: 1,
                     paddingTop: {xs: '4em', sm: '5em', lg: '6em'},
                     overflowY: 'auto',
                     paddingX: {sm: "0", md: "2em"}
                 }}>
                <Paper elevation={3} sx={{p: 3}}>
                    {renderPage()}
                </Paper>
            </Box>
        </Box>
    );
}

export default Dashboard;