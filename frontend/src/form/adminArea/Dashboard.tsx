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
    MusicNote
} from '@mui/icons-material';
import ListItemButton from "@mui/material/ListItemButton";
import {CSVLink} from "react-csv";

// Import all page components
import HomePage from './HomePage';
import BookingsPage from './BookingsPage';
import TicketsPage from './TicketsPage';
import BeveragesPage from './BeveragesPage';
import FoodPage from './FoodPage';
import MaterialsPage from './MaterialsPage';
import WorkshiftsPage from './WorkshiftsPage';
import ArtistsPage from './ArtistsPage';
import ArtistMaterialsPage from './ArtistMaterialsPage';
import FinancialsOverviewPage from './FinancialsOverviewPage';
import PaymentConfirmationsPage from './PaymentConfirmationsPage';
import {useFetchData} from './useFetchData';



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
    {id: 'artists', label: 'Artists', icon: <MusicNote/>, permissions: ['read']},
    {id: 'financials', label: 'Financials', icon: <EuroSymbol/>, permissions: ['financial']},
    {id: 'payments', label: 'Payments', icon: <PointOfSale/>, permissions: ['financial']}
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
            case 'artists':
                return <ArtistsPage/>;
            case 'artistMaterials':
                return <ArtistMaterialsPage/>;
            case 'financials':
                return <FinancialsOverviewPage/>;
            case 'payments':
                return <PaymentConfirmationsPage/>;
            default:
                return <HomePage/>;
        }
    };

    const getExportData = () => {
        // Preparing export data based on active tab
        switch (activeTab) {
            case 'bookings':
                return [
                    ...regularBookings.map(b => ({
                        Type: 'Regular',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Email: b.email,
                        Phone: b.phone,
                        Ticket: formContent.ticket_options.find(t => t.id === b.ticket_id)?.title || 'Unknown',
                        Price: b.total_price,
                        PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
                        RegistrationDate: b.timestamp
                    })),
                    ...artistBookings.map(b => ({
                        Type: 'Artist',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Email: b.email,
                        Phone: b.phone,
                        Ticket: artistFormContent.ticket_options.find(t => t.id === b.ticket_id)?.title || 'Unknown',
                        Price: b.total_price,
                        PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
                        RegistrationDate: b.timestamp
                    }))
                ];
            case 'tickets':
                return [
                    ...regularBookings.map(b => ({
                        Type: 'Regular',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Email: b.email,
                        Ticket: formContent.ticket_options.find(t => t.id === b.ticket_id)?.title || 'Unknown',
                        TicketPrice: formContent.ticket_options.find(t => t.id === b.ticket_id)?.price || 0
                    })),
                    ...artistBookings.map(b => ({
                        Type: 'Artist',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Email: b.email,
                        Ticket: artistFormContent.ticket_options.find(t => t.id === b.ticket_id)?.title || 'Unknown',
                        TicketPrice: artistFormContent.ticket_options.find(t => t.id === b.ticket_id)?.price || 0
                    }))
                ];
            case 'beverages':
                return [
                    ...regularBookings.map(b => ({
                        Type: 'Regular',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Beverage: formContent.beverage_options.find(bev => bev.id === b.beverage_id)?.title || 'None',
                        BeveragePrice: formContent.beverage_options.find(bev => bev.id === b.beverage_id)?.price || 0
                    })),
                    ...artistBookings.map(b => ({
                        Type: 'Artist',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Beverage: artistFormContent.beverage_options.find(bev => bev.id === b.beverage_id)?.title || 'None',
                        BeveragePrice: artistFormContent.beverage_options.find(bev => bev.id === b.beverage_id)?.price || 0
                    }))
                ];
            case 'food':
                return [
                    ...regularBookings.map(b => ({
                        Type: 'Regular',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Food: formContent.food_options.find(f => f.id === b.food_id)?.title || 'None',
                        FoodPrice: formContent.food_options.find(f => f.id === b.food_id)?.price || 0
                    })),
                    ...artistBookings.map(b => ({
                        Type: 'Artist',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Food: artistFormContent.food_options.find(f => f.id === b.food_id)?.title || 'None',
                        FoodPrice: artistFormContent.food_options.find(f => f.id === b.food_id)?.price || 0
                    }))
                ];
            case 'materials':
                return regularBookings
                    .filter(b => b.material_ids.length > 0)
                    .flatMap(b => {
                        return b.material_ids.map(materialId => ({
                            FirstName: b.first_name,
                            LastName: b.last_name,
                            Material: formContent.materials.find(m => m.id === materialId)?.title || 'Unknown'
                        }));
                    });
            case 'artistMaterials':
                return artistBookings
                    .filter(b => b.artist_material_ids?.length > 0)
                    .flatMap(b => {
                        return b.artist_material_ids?.map(materialId => ({
                            FirstName: b.first_name,
                            LastName: b.last_name,
                            Material: artistFormContent.artist_materials.find(m => m.id === materialId)?.title || 'Unknown'
                        })) || [];
                    });
            case 'workShifts':
                return regularBookings.flatMap(b => {
                    const shifts: {
                        FirstName: string;
                        LastName: string;
                        Priority: string;
                        Workshift: string;
                        Timeslot: string;
                        StartTime: string;
                        EndTime: string;
                        MaxShifts: number;
                    }[] = [];
                    const priorities = ['First', 'Second', 'Third'];

                    [b.timeslot_priority_1, b.timeslot_priority_2, b.timeslot_priority_3]
                        .forEach((timeslotId, index) => {
                            if (timeslotId === -1) return;

                            // Find the workshift and timeslot
                            for (const shift of formContent.work_shifts) {
                                const timeslot = shift.time_slots.find(ts => ts.id === timeslotId);
                                if (timeslot) {
                                    shifts.push({
                                        FirstName: b.first_name,
                                        LastName: b.last_name,
                                        Priority: priorities[index],
                                        Workshift: shift.title,
                                        Timeslot: timeslot.title,
                                        StartTime: timeslot.start_time,
                                        EndTime: timeslot.end_time,
                                        MaxShifts: b.amount_shifts
                                    });
                                    break;
                                }
                            }
                        });

                    return shifts;
                });
            case 'artists':
                return artistBookings.map(b => {
                    let performanceDetails = '';
                    try {
                        if (b.performance_details) {
                            const details = JSON.parse(b.performance_details);
                            performanceDetails = `Day: ${details.preferredDay || '?'}, Time: ${details.preferredTime || '?'}, Duration: ${details.duration || '?'} min`;
                        }
                    } catch (e) {
                        performanceDetails = 'Error parsing performance details';
                    }

                    return {
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Email: b.email,
                        Phone: b.phone,
                        PerformanceDetails: performanceDetails,
                        Equipment: b.equipment || 'None specified',
                        SpecialRequests: b.special_requests || 'None'
                    };
                });
            case 'financials':
            case 'payments':
                return [
                    ...regularBookings.map(b => ({
                        Type: 'Regular',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Email: b.email,
                        TotalPrice: b.total_price,
                        PaidAmount: b.paid_amount || 0,
                        PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
                        PaymentDate: b.payment_date || 'Not paid',
                        Notes: b.payment_notes || ''
                    })),
                    ...artistBookings.map(b => ({
                        Type: 'Artist',
                        FirstName: b.first_name,
                        LastName: b.last_name,
                        Email: b.email,
                        TotalPrice: b.total_price,
                        PaidAmount: b.paid_amount || 0,
                        PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
                        PaymentDate: b.payment_date || 'Not paid',
                        Notes: b.payment_notes || ''
                    }))
                ];
            default:
                return [];
        }
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