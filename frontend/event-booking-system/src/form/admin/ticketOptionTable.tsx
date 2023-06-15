import {DataGrid} from '@mui/x-data-grid';
import {TicketOption} from "../interface";
import React from "react";

interface IProps {
	ticketOptions: TicketOption[]
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
								  pageSize: 5,
							  },
						  },
					  }} checkboxSelection/>
		</div>
	);
}

export default TicketOptionTable
