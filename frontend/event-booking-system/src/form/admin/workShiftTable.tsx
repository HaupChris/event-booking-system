import {DataGrid, GridToolbarContainer, GridToolbarExport} from '@mui/x-data-grid';
import {TimeSlot, WorkShift} from "../interface";

interface IProps {
	workShifts: WorkShift[]
}

function CustomToolbar() {

	// create a timestamp for the export, so the filename is always different. Format is YYYYMMDD-HHMMSS
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').split('.')[0];


	return (
		<GridToolbarContainer>
			<GridToolbarExport
				csvOptions={{
					allColumns: true,
					fileName: 'workshifts' + timestamp,
				}}
			/>
		</GridToolbarContainer>
	);
}

function WorkShiftTable(props: IProps) {
	const columns = [
		{field: 'id', headerName: 'ID', width: 70},
		{field: 'title', headerName: 'Title', width: 200},
		{field: 'description', headerName: 'Description', width: 200},
		{field: 'time_slot', headerName: 'Time Slot', width: 400},
		{field: 'num_booked', headerName: 'Booked', width: 200},
		{field: 'num_available', headerName: 'Available', width: 200}
	];

	const rows = [];
	for (let workShift of props.workShifts) {
		for (let timeSlot of workShift.time_slots) {
			rows.push({
				id: timeSlot.id,
				title: workShift.title,
				description: workShift.description,
				time_slot: String(timeSlot.title + ": " + timeSlot.start_time + " - " + timeSlot.end_time),
				num_booked: timeSlot.num_booked,
				num_available: timeSlot.num_needed - timeSlot.num_booked
			});
		}
	}

	return (
		<div style={{height: '90vh', width: '100%'}}>
			<DataGrid rows={rows} columns={columns}
					  initialState={{
						  pagination: {
							  paginationModel: {
								  pageSize: 100,
							  },
						  },
					  }}
					  slots={{
						  toolbar: CustomToolbar,
					  }}
					  pageSizeOptions={[100]}
					  checkboxSelection/>
		</div>
	);
};

export default WorkShiftTable;
