import {Booking, FormContent} from "../interface";
import {DataGrid, GridToolbarContainer, GridToolbarExport} from "@mui/x-data-grid";
import {Box} from "@mui/material";

interface IProps {
	bookings: Booking[],
	formContent: FormContent
}

function CustomToolbar() {

	// create a timestamp for the export, so the filename is always different. Format is YYYYMMDD-HHMMSS
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').split('.')[0];


	return (
		<GridToolbarContainer>
			<GridToolbarExport
				csvOptions={{
					allColumns: true,
					fileName: 'booking_' + timestamp,
				}}
			/>
		</GridToolbarContainer>
	);
}

function BookingTable(props: IProps) {
	const formContent = props.formContent;
	const bookings = props.bookings;

	const ticketOptions = formContent.ticket_options;
	const beverageOptions = formContent.beverage_options;
	const materials = formContent.materials;
	const workShifts = formContent.work_shifts;

	const processedBookings = bookings.map((booking) => {
		const ticketOption = ticketOptions.find(option => option.id === booking.ticket_id);
		const beverageOption = beverageOptions.find(option => option.id === booking.beverage_id);

		const timeslotPriority1 = workShifts.flatMap(shift => shift.time_slots).find(slot => slot.id === booking.timeslot_priority_1);
		const workShiftPriority1 = timeslotPriority1 ? workShifts.find(shift => shift.time_slots.includes(timeslotPriority1)) : undefined;
		const timeslotPriority2 = workShifts.flatMap(shift => shift.time_slots).find(slot => slot.id === booking.timeslot_priority_2);
		const workShiftPriority2 = timeslotPriority2 ? workShifts.find(shift => shift.time_slots.includes(timeslotPriority2)) : undefined;
		const timeslotPriority3 = workShifts.flatMap(shift => shift.time_slots).find(slot => slot.id === booking.timeslot_priority_3);
		const workShiftPriority3 = timeslotPriority3 ? workShifts.find(shift => shift.time_slots.includes(timeslotPriority3)) : undefined;

		const materialNames = booking.material_ids.map(id => materials.find(material => material.id === id)?.title).filter(Boolean);

		return {
			...booking,
			ticketOption: ticketOption?.title,
			beverageOption: beverageOption?.title,
			timeslotPriority1: `${workShiftPriority1?.title}, ${timeslotPriority1?.title} ${timeslotPriority1?.start_time}-${timeslotPriority1?.end_time}`,
			timeslotPriority2: `${workShiftPriority2?.title}, ${timeslotPriority2?.title} ${timeslotPriority2?.start_time}-${timeslotPriority2?.end_time}`,
			timeslotPriority3: `${workShiftPriority3?.title}, ${timeslotPriority3?.title} ${timeslotPriority3?.start_time}-${timeslotPriority3?.end_time}`,
			materialNames: materialNames.join(", ")
		};
	});

	const columns = [
		{field: 'last_name', headerName: 'Last Name', width: 130},
		{field: 'first_name', headerName: 'First Name', width: 130},
		{field: 'email', headerName: 'Email', width: 200},
		{field: 'phone', headerName: 'Phone', width: 130},
		{field: 'ticketOption', headerName: 'Ticket Option', width: 200},
		{field: 'beverageOption', headerName: 'Beverage Option', width: 200},
		{field: 'timeslotPriority1', headerName: 'Timeslot Priority 1', width: 250},
		{field: 'timeslotPriority2', headerName: 'Timeslot Priority 2', width: 250},
		{field: 'timeslotPriority3', headerName: 'Timeslot Priority 3', width: 250},
		{field: 'materialNames', headerName: 'Materials', width: 200},
		{field: 'amount_shifts', headerName: 'Amount of Shifts', width: 200},
		{field: 'supporter_buddy', headerName: 'Supporter Buddy', width: 200},
		{field: 'total_price', headerName: 'Total Price', width: 150},
	];

	return (
		<Box sx={{height: '90vh', width: '100%'}}>
			<DataGrid
				getRowId={(row) => row.email}
				rows={processedBookings}
				columns={columns}
				initialState={{
					pagination: {
						paginationModel: {
							pageSize: 100,
						},
					},
				}}
				pageSizeOptions={[100]}
				slots={{
					toolbar: CustomToolbar,
				}}
			/>
		</Box>
	);
};

export default BookingTable;
