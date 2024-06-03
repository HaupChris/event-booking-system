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
    Box, createTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {Home, SportsBar, Handyman, LunchDining, Work, People} from '@mui/icons-material';
import HomePage from './HomePage';
import {getDummyFormContent} from "../formContainer";
import {TokenContext} from "../../AuthContext";
import axios from "axios";
import ListItemButton from "@mui/material/ListItemButton";
import BookingsPage from "./BookingsPage";
import BeveragesPage from "./BeveragesPage";
import FoodPage from "./FoodPage";
import {ThemeOptions, ThemeProvider} from "@mui/material/styles";
import MaterialsPage from "./MaterialsPage";
import WorkshiftsPage from "./WorkshiftsPage";

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

function Dashboard() {
    const [value, setValue] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formContent, setFormContent] = useState(getDummyFormContent());
    const [bookings, setBookings] = useState([]);
    const {token} = useContext(TokenContext);
    const labels = ["Bookings", "Ticket Options", "Beverage Options", "Work Shifts", "Materials"];

    const pageTitles = ["Home", "Bookings", "Beer", "Food", "Material", "Support"];
    const pageTitleIcons = [
        <Home style={{verticalAlign: "middle"}}/>,
        <People style={{verticalAlign: "middle"}}/>,
        <SportsBar style={{verticalAlign: "middle"}}/>,
        <LunchDining style={{verticalAlign: "middle"}}/>,
        <Handyman style={{verticalAlign: "middle"}}/>,
        <Work style={{verticalAlign: "middle"}}/>
    ]

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
            case 0:
                return <HomePage/>;
            case 1:
                return <BookingsPage/>;
            case 2:
                return <BeveragesPage/>;
            case 3:
                return <FoodPage/>;
            case 4:
                return <MaterialsPage/>;
            case 5:
                return <WorkshiftsPage/>;
            default:
                return <HomePage/>;
        }
    };

    const handleMenuClick = (index: number) => {
        setValue(index);
        setDrawerOpen(false);
    };

    return <ThemeProvider theme={theme}>
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
                        <MenuIcon/>
                    </IconButton>
                    <Box display="flex" flexGrow={1} justifyContent="center">
                        <Typography variant="h6" display="flex" alignItems="center">
                            {pageTitleIcons[value]}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
                <List>
                    {pageTitles.map((title, index) => (
                        <ListItemButton onClick={() => handleMenuClick(index)}>
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
    </ThemeProvider>;

};

export default Dashboard;
