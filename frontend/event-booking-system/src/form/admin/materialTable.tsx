import {DataGrid, GridToolbarContainer, GridToolbarExport} from "@mui/x-data-grid";
import {Material, WorkShift} from "../interface";

function CustomToolbar() {

	// create a timestamp for the export, so the filename is always different. Format is YYYYMMDD-HHMMSS
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').split('.')[0];


	return (
		<GridToolbarContainer>
			<GridToolbarExport
				csvOptions={{
					allColumns: true,
					fileName: 'materials_' + timestamp,
				}}
			/>
		</GridToolbarContainer>
	);
}

interface IProps {
	materials: Material[]
}

function MaterialTable(props: IProps) {
	const columns = [
		{field: 'id', headerName: 'ID', width: 70},
		{field: 'title', headerName: 'Title', width: 200},
		{field: 'num_booked', headerName: 'Booked', width: 200},
		{field: 'still_needed', headerName: 'Still Needed', width: 200}
	];

	const rows = [];
	for (let material of props.materials) {
		rows.push({
			id: material.id,
			title: material.title,
			num_booked: material.num_booked,
			still_needed: material.num_needed - material.num_booked
		});
	}


	return (
		<div >
			<DataGrid rows={rows} columns={columns} style={{maxHeight: '90vh',width: '100%'}}
					  initialState={{
						  pagination: {
							  paginationModel: {
								  pageSize: 10,
							  },
						  },
					  }}
					  slots={{
						  toolbar: CustomToolbar,
					  }}
					  pageSizeOptions={[10]}
					  checkboxSelection/>
		</div>
	);
};

export default MaterialTable;