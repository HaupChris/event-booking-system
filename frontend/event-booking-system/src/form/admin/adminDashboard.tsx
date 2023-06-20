import React, {useContext, useState} from "react";
import axios from "axios";
import {useEffect} from "react";
import {Booking, FormContent} from "../interface";
import BookingTable from "./bookingTable";
import {TokenContext} from "../../AuthContext";
import {
	AppBar,
	Box,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Tab,
	Tabs,
	Toolbar,
	Typography
} from "@mui/material";
import TicketOptionTable from "./ticketOptionTable";
import WorkShiftTable from "./workShiftTable";
import {getDummyFormContent} from "../formContainer";
import BeverageOptionTable from "./beverageOptionTable";
import '../../css/admin.css';
import MaterialTable from "./materialTable";
import {Menu} from "@mui/icons-material";


function TabPanel(props: { [x: string]: any; children: any; value: any; index: any; }) {
	const {children, value, index, ...other} = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box>
					{children}
				</Box>
			)}
		</div>
	);
}

function AdminDashboard() {
	const [formContent, setFormContent] = useState(getDummyFormContent());
	const [bookings, setBookings] = useState([]);
	const [value, setValue] = useState(0);
	const [drawerOpen, setDrawerOpen] = useState(false);
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

	if (!formContent || bookings.length === 0) {
		return <div>Loading...</div>;
	}

	const handleDrawerToggle = () => {
		setDrawerOpen(!drawerOpen);
	};

	const handleChange = (event: any, newValue: number) => {
		setValue(newValue);
		if (drawerOpen) setDrawerOpen(false);
	};


	return (
		<Box sx={{width: '100%'}} className={"dashboard-container"}>
			<AppBar position="static">
				<Toolbar>
					<Box sx={{display: {xs: "none", md: "block"}}}>
						<Tabs value={value} onChange={handleChange} aria-label="admin dashboard tabs">
							{labels.map((label, index) => (
								<Tab label={label} key={index}/>
							))}
						</Tabs>
					</Box>
					<Typography variant={"h6"} sx={{flexGrow: 1, display: {xs: "block", md: "none"}}}>
						{labels[value]}
						</Typography>
					<Box sx={{display: {xs: "block", md: "none"}}}>

						<IconButton
						color="inherit"
						edge="end"
						onClick={handleDrawerToggle}
					>
						<Menu/>
					</IconButton>
					</Box>

				</Toolbar>
			</AppBar>
			<Drawer
				variant="temporary"
				open={drawerOpen}
				onClose={handleDrawerToggle}
				anchor={"right"}
			>
				<List>
					{labels.map((label, index) => (
						<ListItem key={label} onClick={(event) => handleChange(event, index)}>
							<ListItemText primary={label}/>
						</ListItem>
					))}
				</List>
			</Drawer>
			<TabPanel value={value} index={0}>
				<BookingTable bookings={bookings} formContent={formContent}/>
			</TabPanel>
			<TabPanel value={value} index={1}>
				<TicketOptionTable ticketOptions={formContent.ticket_options}/>
			</TabPanel>
			<TabPanel value={value} index={2}>
				<BeverageOptionTable beverageOptions={formContent.beverage_options}/>
			</TabPanel>
			<TabPanel value={value} index={3}>
				<WorkShiftTable workShifts={formContent.work_shifts}/>
			</TabPanel>
			<TabPanel value={value} index={4}>
				<MaterialTable materials={formContent.materials}/>
			</TabPanel>
		</Box>
	);
}


export default AdminDashboard;
