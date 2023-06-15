import {DataGrid} from '@mui/x-data-grid';
import {BeverageOption} from "../interface";


interface IProps {
	beverageOptions: BeverageOption[]
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
		<div style={{height: 400, width: '100%'}}>
			<DataGrid rows={props.beverageOptions}
					  columns={columns} initialState={{
				pagination: {
					paginationModel: {
						pageSize: 5,
					},
				},
			}} checkboxSelection/>
		</div>
	);
};

export default BeverageOptionTable;
