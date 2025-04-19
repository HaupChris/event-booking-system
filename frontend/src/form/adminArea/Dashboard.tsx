import React, {useContext, useEffect, useState} from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    Box, createTheme
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
    ViewQuilt, EuroSymbol, PointOfSale
} from '@mui/icons-material';
import HomePage from './HomePage';
import {getDummyFormContent} from "../userArea/formContainer";
import {TokenContext} from "../../AuthContext";
import axios from "axios";
import ListItemButton from "@mui/material/ListItemButton";
import BookingsPage from "./BookingsPage";
import BeveragesPage from "./BeveragesPage";
import FoodPage from "./FoodPage";
import {ThemeOptions, ThemeProvider} from "@mui/material/styles";
import MaterialsPage from "./MaterialsPage";
import WorkshiftsPage from "./WorkshiftsPage";
import TicketsPage from "./TicketsPage";
import {CSVLink} from "react-csv";
import {Booking, FormContent} from "../userArea/interface";


export const themeOptions: ThemeOptions = {
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    fontFamily: 'Kavoon',
                    backgroundColor: 'rgba(255,255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                },
            },
        },
    },
};

const theme = createTheme(themeOptions);

enum DashboardView {
    Home = 0,
    Bookings = 1,
    Tickets = 2,
    Beverages = 3,
    Food = 4,
    Material = 5,
    Supportshifts = 6,
    FinancialsOverview = 7,
    PaymentConfirmations = 8,
    ShiftAssignments = 9
}

const getWorkshiftAndTimeslotDetails = (timeslotId: number, formContent: FormContent) => {
    for (const workshift of formContent.work_shifts) {
        for (const timeslot of workshift.time_slots) {
            if (timeslot.id === timeslotId) {
                return {
                    workshiftTitle: workshift.title,
                    timeslotTitle: timeslot.title,
                    startTime: timeslot.start_time,
                    endTime: timeslot.end_time
                };
            }
        }
    }
    return {
        workshiftTitle: 'Unknown',
        timeslotTitle: 'Unknown',
        startTime: 'Unknown',
        endTime: 'Unknown'
    };
};

function AdminDashboard() {
    const [value, setValue] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formContent, setFormContent] = useState(getDummyFormContent());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const {token} = useContext(TokenContext);
    // const {adminPermissions} = useContext(AuthContext);
const adminPermissions = ["read", "financial"];
    const viewPermissions = {
        [DashboardView.Home]: ['read'],
        [DashboardView.Bookings]: ['read'],
        [DashboardView.Tickets]: ['read'],
        [DashboardView.Beverages]: ['read'],
        [DashboardView.Food]: ['read'],
        [DashboardView.Material]: ['read'],
        [DashboardView.Supportshifts]: ['read'],
        [DashboardView.FinancialsOverview]: ['financial'],
        [DashboardView.PaymentConfirmations]: ['financial'],
        [DashboardView.ShiftAssignments]: ['shift_management']
    };


    const pageTitles = ["Home", "Bookings", "Tickets", "Beer", "Food", "Material", "Support", "Financials Overview", "Payment Confirmations", "Shift Assignments"];
    const pageTitleIcons = [
        <Home style={{verticalAlign: "middle"}}/>,
        <People style={{verticalAlign: "middle"}}/>,
        <LocalActivity style={{verticalAlign: "middle"}}/>,
        <SportsBar style={{verticalAlign: "middle"}}/>,
        <LunchDining style={{verticalAlign: "middle"}}/>,
        <Handyman style={{verticalAlign: "middle"}}/>,
        <Work style={{verticalAlign: "middle"}}/>,
        <EuroSymbol style={{verticalAlign: "middle"}}/>,
        <PointOfSale style={{verticalAlign: "middle"}}/>,
        <ViewQuilt style={{verticalAlign: "middle"}}/>
    ]

    const authorizedViews = Object.entries(viewPermissions)
        .filter(([_, permissions]) =>
            permissions.some(permission => adminPermissions.includes(permission))
        )
        .map(([view]) => parseInt(view));

    const authorizedPageTitles = pageTitles.filter((_, index) => authorizedViews.includes(index));
    const authorizedPageTitleIcons = pageTitleIcons.filter((_, index) => authorizedViews.includes(index));

    console.log("auth stuff");
    console.log(authorizedViews);
    console.log(authorizedPageTitles);
    console.log(authorizedPageTitleIcons);

    useEffect(() => {
        axios.get('/api/data', {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then(response => setBookings(response.data))
            .catch(error => console.error('Error:', error));

        axios.get('/api/formcontent', {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then(response => setFormContent(response.data))
            .catch(error => console.error('Error:', error));
    }, [token]);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const renderPage = () => {
        switch (value) {
            case DashboardView.Home:
                return <HomePage />;
            case DashboardView.Bookings:
                return <BookingsPage />;
            case DashboardView.Tickets:
                return <TicketsPage />;
            case DashboardView.Beverages:
                return <BeveragesPage />;
            case DashboardView.Food:
                return <FoodPage />;
            case DashboardView.Material:
                return <MaterialsPage />;
            case DashboardView.Supportshifts:
                return <WorkshiftsPage />;
            default:
                return <HomePage />;
        }
    };

    const handleMenuClick = (index: number) => {
        setValue(index);
        setDrawerOpen(false);
    };

    const exportBookings = bookings.map(booking => {
        const ticketDetails = formContent.ticket_options.find((ticketOption) => ticketOption.id === booking.ticket_id)?.title;
        const beverageDetails = formContent.beverage_options.find((beverageOption) => beverageOption.id === booking.beverage_id)?.title;
        const foodDetails = formContent.food_options.find((foodOption) => foodOption.id === booking.food_id)?.title;
        const priority1Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_1, formContent);
        const materialTitles = booking.material_ids.map(id => {
            const material = formContent.materials.find(material => material.id === id);
            return material ? material.title : 'Unknown';
        }).join(', ');
        const priority2Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_2, formContent);
        const priority3Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_3, formContent);

        return {
            firstName: booking.first_name,
            lastName: booking.last_name,
            phone: booking.phone,
            ticket: ticketDetails || '-',
            beverage: beverageDetails || '-',
            food: foodDetails || '-',
            materials: materialTitles || '-',
            amountShifts: booking.amount_shifts,
            supporterBuddy: booking.supporter_buddy,
            workshiftPriority1: `${priority1Details.workshiftTitle} - ${priority1Details.timeslotTitle} (${priority1Details.startTime} - ${priority1Details.endTime})`,
            workshiftPriority2: `${priority2Details.workshiftTitle} - ${priority2Details.timeslotTitle} (${priority2Details.startTime} - ${priority2Details.endTime})`,
            workshiftPriority3: `${priority3Details.workshiftTitle} - ${priority3Details.timeslotTitle} (${priority3Details.startTime} - ${priority3Details.endTime})`
        };
    });

    const exportTickets = bookings.map(booking => {
        const ticketDetails = formContent.ticket_options.find((ticketOption) => ticketOption.id === booking.ticket_id)?.title;

        return {
            firstName: booking.first_name,
            lastName: booking.last_name,
            ticket: ticketDetails || 'Unknown',
        };
    });

    const exportBeverages = bookings.map(booking => {
        const beverageDetails = formContent.beverage_options.find((beverageOption) => beverageOption.id === booking.beverage_id)?.title;

        return {
            firstName: booking.first_name,
            lastName: booking.last_name,
            beverage: beverageDetails || 'Unknown',
        };
    });

    const exportFood = bookings.map(booking => {
        const foodDetails = formContent.food_options.find((foodOption) => foodOption.id === booking.food_id)?.title;

        return {
            firstName: booking.first_name,
            lastName: booking.last_name,
            food: foodDetails || 'Unknown',
        };
    });

    const exportMaterial = bookings
        .filter(booking => booking.material_ids.length > 0)
        .map(booking => {
            const materialTitles = booking.material_ids.map(id => {
                const material = formContent.materials.find(material => material.id === id);
                return material ? material.title : 'Unknown';
            }).join(', ');

            return {
                firstName: booking.first_name,
                lastName: booking.last_name,
                materials: materialTitles
            };
        });


    const exportSupportshifts = bookings.map(booking => {
        const priority1Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_1, formContent);
        const priority2Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_2, formContent);
        const priority3Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_3, formContent);
        const ticketDetails = formContent.ticket_options.find((ticketOption) => ticketOption.id === booking.ticket_id)?.title;


        return {
            firstName: booking.first_name,
            lastName: booking.last_name,
            phone: booking.phone,
            ticket: ticketDetails,
            amountShifts: booking.amount_shifts,
            supporterBuddy: booking.supporter_buddy,
            workshiftPriority1: `${priority1Details.workshiftTitle} - ${priority1Details.timeslotTitle} (${priority1Details.startTime} - ${priority1Details.endTime})`,
            workshiftPriority2: `${priority2Details.workshiftTitle} - ${priority2Details.timeslotTitle} (${priority2Details.startTime} - ${priority2Details.endTime})`,
            workshiftPriority3: `${priority3Details.workshiftTitle} - ${priority3Details.timeslotTitle} (${priority3Details.startTime} - ${priority3Details.endTime})`
        };
    });

    const getExportData = () => {
        switch (value) {
            case DashboardView.Bookings:
                return exportBookings;
            case DashboardView.Tickets:
                return exportTickets;
            case DashboardView.Beverages:
                return exportBeverages;
            case DashboardView.Food:
                return exportFood;
            case DashboardView.Material:
                return exportMaterial;
            case DashboardView.Supportshifts:
                return exportSupportshifts;
            default:
                return [];
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
                <AppBar position="fixed">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
                            <MenuIcon/>
                        </IconButton>
                        <Box display="flex" flexGrow={1} justifyContent="center">
                            <Typography variant="h6" display="flex" alignItems="center">
                                {authorizedPageTitleIcons[value]}
                            </Typography>
                        </Box>
                        <CSVLink

                            data={getExportData()}
                            filename={`${pageTitles[value].toLowerCase()}_data.csv`}
                            style={{textDecoration: 'none', display: value == DashboardView.Home ? "none" : "flex"}}
                        >
                            <IconButton edge="end" color="inherit">
                                <Download/>
                            </IconButton>
                        </CSVLink>
                    </Toolbar>
                </AppBar>
                <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
                    <List>
                        {authorizedPageTitles.map((title, index) => (
                            <ListItemButton onClick={() => handleMenuClick(index)} key={index}>
                                <ListItemIcon>{pageTitleIcons[index]}</ListItemIcon>
                                <ListItemText primary={title}/>
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
                    {renderPage()}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default AdminDashboard;
