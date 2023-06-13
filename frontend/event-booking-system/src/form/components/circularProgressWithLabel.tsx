import {Box, CircularProgress, Typography} from "@mui/material";


interface IProps {
	valueCurrent: number
	valueMax: number
}
export function CircularProgressWithLabel(props: IProps) {
	return (
		<Box sx={{position: 'relative', display: 'inline-flex'}}>
			<CircularProgress variant="determinate" value={(props.valueCurrent / props.valueMax) * 100} />
			<Box
				sx={{
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					position: 'absolute',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Typography
					variant="caption"
					component="div"
					color="text.secondary"
				>{props.valueCurrent + "/" + props.valueMax}</Typography>
			</Box>
		</Box>
	);
}