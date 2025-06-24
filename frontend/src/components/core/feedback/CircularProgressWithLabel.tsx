import React from 'react';
import {Box, CircularProgress, Typography, alpha} from '@mui/material';
import {spacePalette} from '../../styles/theme';

interface CircularProgressWithLabelProps {
    valueCurrent: number;
    valueMax: number;
}

const CircularProgressWithLabel: React.FC<CircularProgressWithLabelProps> = ({
                                                                                 valueCurrent,
                                                                                 valueMax,
                                                                             }) => {
    const frac = (valueCurrent / valueMax) > 1.0 ? 1.0 : (valueCurrent / valueMax);
    const progressIsFull = frac >= 1.0;

    // Dynamic color based on fill level
    const getProgressColor = () => {
        if (progressIsFull) return spacePalette.status.error;
        if (frac > 0.7) return spacePalette.status.warning;
        return spacePalette.status.success;
    };

    return (
        <Box sx={{position: 'relative', display: 'inline-flex'}}>
            <CircularProgress
                variant="determinate"
                value={frac * 100}
                thickness={4}
                size={46}
                sx={{
                    color: getProgressColor(),
                    backgroundColor: alpha('#000', 0.3),
                    borderRadius: '50%',
                }}
            />
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
                    sx={{
                        color: alpha('#fff', 0.9),
                        fontWeight: 'medium',
                    }}
                >
                    {`${valueCurrent}/${valueMax}`}
                </Typography>
            </Box>
        </Box>
    );
};

export default CircularProgressWithLabel;