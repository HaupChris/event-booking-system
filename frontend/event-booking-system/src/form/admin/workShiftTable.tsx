import { DataGrid } from '@mui/x-data-grid';
import {TimeSlot, WorkShift} from "../interface";

interface IProps {
	workShifts: WorkShift[]
}
function WorkShiftTable(props: IProps) {
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'description', headerName: 'Description', width: 200 },
        { field: 'time_slot', headerName: 'Time Slot', width: 400 },
		{ field: 'num_booked', headerName: 'Booked', width: 200},
		{ field: 'num_available', headerName: 'Available', width: 200}
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
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid rows={rows} columns={columns}
					  initialState={{
						  pagination: {
							  paginationModel: {
								  pageSize: 5,
							  },
						  },
					  }} checkboxSelection />
        </div>
    );
};

export default WorkShiftTable;
