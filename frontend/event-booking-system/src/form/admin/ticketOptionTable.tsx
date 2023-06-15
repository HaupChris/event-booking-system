import {DataGrid, GridToolbarContainer, GridToolbarExport} from '@mui/x-data-grid';
import {TicketOption} from "../interface";
import React from "react";

interface IProps {
	ticketOptions: TicketOption[]
}

function CustomToolbar() {

	// create a timestamp for the export, so the filename is always different. Format is YYYYMMDD-HHMMSS
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').split('.')[0];


	return (
		<GridToolbarContainer>
			<GridToolbarExport
				csvOptions={{
					allColumns: true,
					fileName: 'tickets' + timestamp,
				}}
			/>
		</GridToolbarContainer>
	);
}

function TicketOptionTable(props: IProps) {
	const columns = [
		{field: 'id', headerName: 'ID', width: 70},
		{field: 'title', headerName: 'Title', width: 200},
		{field: 'price', headerName: 'Price', width: 200},
		{field: 'amount', headerName: 'Amount', width: 200},
		{field: 'num_booked', headerName: 'Booked', width: 200},
	];

	return (
		<div style={{height: 400, width: '100%'}}>
			<DataGrid rows={props.ticketOptions}
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
					  checkboxSelection/>
		</div>
	);
}

export default TicketOptionTable
