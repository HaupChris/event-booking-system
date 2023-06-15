import {SetStateAction, useContext, useState} from "react";
import axios from "axios";
import {useEffect} from "react";
import {Booking, FormContent} from "../interface";
import BookingTable from "./bookingTable";
import {TokenContext} from "../../AuthContext";
import {Box, Tab, Tabs} from "@mui/material";
import TicketOptionTable from "./ticketOptionTable";
import WorkShiftTable from "./workShiftTable";
import {getDummyFormContent} from "../formContainer";
import BeverageOptionTable from "./beverageOptionTable";
import '../../css/admin.css';


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
	const {token} = useContext(TokenContext);

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

	const handleChange = (event: any, newValue: SetStateAction<number>) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }} className={"dashboard-container"}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="admin dashboard tabs">
          <Tab label="Bookings" />
          <Tab label="Ticket Options" />
          <Tab label="Beverage Options" />
          <Tab label="Work Shifts" />
          <Tab label="Materials" />
        </Tabs>
      </Box>
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
      {/*<TabPanel value={value} index={4}>*/}
      {/*  <MaterialTable materials={formContent.materials}/>*/}
      {/*</TabPanel>*/}
    </Box>
  );
}


export default AdminDashboard;
