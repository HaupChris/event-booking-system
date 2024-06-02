import React, {useContext, useEffect, useState} from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {Home, Settings, SportsBar, Handyman, Shop, LunchDining, Work, People} from '@mui/icons-material';
import HomePage from './HomePage';
import {getDummyFormContent} from "../formContainer";
import {TokenContext} from "../../AuthContext";
import axios from "axios";
import ListItemButton from "@mui/material/ListItemButton";
import BookingsPage from "./BookingsPage";

function Dashboard() {
    const [value, setValue] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formContent, setFormContent] = useState(getDummyFormContent());
    const [bookings, setBookings] = useState([]);
    const {token} = useContext(TokenContext);
    const labels = ["Bookings", "Ticket Options", "Beverage Options", "Work Shifts", "Materials"];

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
                return <HomePage/>;
            default:
                return <HomePage/>;
        }
    };

    const handleMenuClick = (index: number) => {
        setValue(index);
        setDrawerOpen(false);
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6">
                        Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
                <List>
                    <ListItemButton onClick={() => handleMenuClick(0)}>
                        <ListItemIcon><Home/></ListItemIcon>
                        <ListItemText primary="Home"/>
                    </ListItemButton>
                    <ListItemButton onClick={() => handleMenuClick(1)}>
                        <ListItemIcon><People/></ListItemIcon>
                        <ListItemText primary="Bookings"/>
                    </ListItemButton>
                    <ListItemButton onClick={() => handleMenuClick(2)}>
                        <ListItemIcon><Work/></ListItemIcon>
                        <ListItemText primary="Support"/>
                    </ListItemButton>
                    <ListItemButton onClick={() => handleMenuClick(3)}>
                        <ListItemIcon><LunchDining/></ListItemIcon>
                        <ListItemText primary="Food"/>
                    </ListItemButton>
                    <ListItemButton onClick={() => handleMenuClick(4)}>
                        <ListItemIcon><Handyman/></ListItemIcon>
                        <ListItemText primary="Material"/>
                    </ListItemButton>
                    <ListItemButton onClick={() => handleMenuClick(5)}>
                        <ListItemIcon><SportsBar/></ListItemIcon>
                        <ListItemText primary="Beer"/>
                    </ListItemButton>
                    <ListItemButton onClick={() => handleMenuClick(6)}>
                        <ListItemIcon><Settings/></ListItemIcon>
                        <ListItemText primary="Settings"/>
                    </ListItemButton>
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, paddingTop: '64px', overflowY: 'auto', paddingX: {sm: "0", md: "2em"} }}>
                {renderPage()}
            </Box>
        </Box>
    );
};

export default Dashboard;
