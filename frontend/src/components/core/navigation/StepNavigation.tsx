// src/components/core/navigation/StepNavigation.tsx
import React from 'react';
import {Box, Button} from '@mui/material';
import {NavigateBefore, NavigateNext} from '@mui/icons-material';
import LinearProgressWithImage from '../feedback/LinearProgressWithImage'; // We'll implement this next

interface StepNavigationProps {
    activeStep: number;
    maxSteps: number;
    progressImage: string;
    disableNext?: boolean
    disablePrevious?: boolean;
    hideNavigation?: boolean;
    onNext: () => void;
    onPrevious: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
                                                           activeStep,
                                                           maxSteps,
                                                           progressImage,
                                                           disableNext = false,
                                                           disablePrevious = false,
                                                           hideNavigation = false,
                                                           onNext,
                                                           onPrevious,
                                                       }) => {
    return <Box className="navigation"
                sx={{
                    display: 'flex',
                    flexDirection: "column",
                    justifyContent: {xs: 'space-between', md: 'center'},
                }}>
        <Box className="navigation-progress" sx={{width: '100%', px: 2, py: 2}}>
            <LinearProgressWithImage
                activeStep={activeStep}
                maxSteps={maxSteps}
                variant="determinate"
                image={progressImage}
            />
        </Box>
        {!hideNavigation && (
            <Box
                className="navigation-buttons"
                sx={{
                    display: 'flex',
                    justifyContent: {xs: 'space-between', md: 'center'},
                    width: '100%',
                    px: {xs: 2, md: 0},
                }}
            >
                <Button
                    variant="outlined"
                    sx={{opacity: activeStep < 1 || disablePrevious ? '0' : '100%'}}
                    onClick={onPrevious}
                    disabled={activeStep < 1 || disablePrevious}
                >
                    <NavigateBefore/>
                </Button>
                <Button
                    variant="outlined"
                    sx={{display: activeStep >= maxSteps - 1 || disableNext ? 'none' : 'inline-block'}}
                    onClick={onNext}
                    disabled={disableNext}
                >
                    <NavigateNext/>
                </Button>
            </Box>
        )}
    </Box>
};

export default StepNavigation;