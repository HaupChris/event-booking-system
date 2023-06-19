import {DataGrid, GridToolbarContainer, GridToolbarExport} from '@mui/x-data-grid';
import {BeverageOption} from "../interface";


interface IProps {
	beverageOptions: BeverageOption[]
}


function CustomToolbar() {

	// create a timestamp for the export, so the filename is always different. Format is YYYYMMDD-HHMMSS
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').split('.')[0];


	return (
		<GridToolbarContainer>
			<GridToolbarExport
				csvOptions={{
					allColumns: true,
					fileName: 'beverages' + timestamp,
				}}
			/>
		</GridToolbarContainer>
	);
}

function BeverageOptionTable(props: IProps) {
	const columns = [
		{field: 'id', headerName: 'ID', width: 70},
		{field: 'title', headerName: 'Title', width: 200},
		{field: 'description', headerName: 'Description', width: 200},
		{field: 'price', headerName: 'Price', width: 200},
		{field: 'num_booked', headerName: 'Booked', width: 200},
	];

	return (
		<div style={{height: '90vh', width: '100%'}}>
			<DataGrid rows={props.beverageOptions}
					  columns={columns}
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
					  pageSizeOptions={[100]} checkboxSelection/>
		</div>
	);
};

export default BeverageOptionTable;
