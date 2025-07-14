import {Box, LinearProgress, LinearProgressProps, Typography} from "@mui/material";


export function LinearProgressWithLabel(props: LinearProgressProps & { value: number, label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width:"100%"}}>
        <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
            {props.label}
        </Typography>
      </Box>
      <Box sx={{ width: '70%', mr: 1, ml: 1}}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}