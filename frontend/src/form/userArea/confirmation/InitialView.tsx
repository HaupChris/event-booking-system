import React from 'react';
import {Box, Typography, Button, Alert, CircularProgress, alpha} from '@mui/material';
import {Check, SignalCellularNodata, RocketLaunch} from '@mui/icons-material';
import SpacePanelLayout from '../../../components/core/layouts/SpacePanelLayout';
import FormCard from '../../../components/core/display/FormCard';
import {spacePalette} from '../../../components/styles/theme';
import {userAreaTexts} from "../../constants/texts";

interface InitialViewProps {
    totalPrice: number;
    isOnline: boolean;
    isSubmitting: boolean;
    submissionAttempted: boolean;
    onSubmit: () => void;
}

const InitialView: React.FC<InitialViewProps> = ({
                                                     totalPrice,
                                                     isOnline,
                                                     isSubmitting,
                                                     submissionAttempted,
                                                     onSubmit
                                                 }) => {
    return (
        <SpacePanelLayout
            missionBriefing={userAreaTexts.confirmationForm.initialView.missionBriefing}
            footerId={userAreaTexts.confirmationForm.initialView.footerId}
        >
            <FormCard>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2
                }}>
                    <RocketLaunch sx={{color: spacePalette.primary.main, fontSize: 60, mb: 1}}/>
                    <Typography
                        variant="h5"
                        align="center"
                        fontWeight="bold"
                        sx={{color: alpha('#fff', 0.9)}}
                    >
                        {userAreaTexts.confirmationForm.initialView.title}
                    </Typography>
                </Box>
            </FormCard>

            <Typography
                variant="body1"
                paragraph
                align="center"
                sx={{
                    mt: 3,
                    fontSize: '1.1rem',
                    color: alpha('#fff', 0.8),
                }}
            >
                {userAreaTexts.confirmationForm.initialView.subtitle}
            </Typography>

            <Box sx={{
                mt: 3,
                p: 3,
                borderRadius: '10px',
                bgcolor: alpha(spacePalette.primary.dark, 0.1),
                border: '1px solid',
                borderColor: alpha(spacePalette.primary.dark, 0.3),
                display: "flex",
                justifyContent: "center",
                flexDirection: "column"
            }}>
                <Typography
                    variant="h6"
                    align="center"
                    gutterBottom
                    sx={{color: alpha('#fff', 0.9)}}
                >
                    {userAreaTexts.confirmationForm.initialView.totalContribution}
                </Typography>
                <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    sx={{color: spacePalette.primary.main}}
                >
                    {totalPrice}€
                </Typography>
                <Button
                    disabled={!isOnline || isSubmitting}
                    variant="contained"
                    color="primary"
                    onClick={onSubmit}
                    size="large"
                    sx={{
                        mt: 4,
                        py: 1.5,
                        px: 4,
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        boxShadow: 3,
                        minWidth: '60%',
                        background: 'linear-gradient(45deg, #1e88e5, #64b5f6)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        },
                        '&.Mui-disabled': {
                            background: alpha(spacePalette.primary.light, 0.2),
                            color: alpha('#fff', 0.4),
                        }
                    }}
                    startIcon={isSubmitting ? null : <Check/>}
                >
                    {isSubmitting ?
                        <CircularProgress size={24} color="inherit"/> :
                        userAreaTexts.confirmationForm.initialView.submitButton
                    }
                </Button>
            </Box>

            {!isOnline && (
                <Alert
                    severity="warning"
                    icon={<SignalCellularNodata/>}
                    sx={{
                        mt: 3,
                        width: '100%',
                        bgcolor: alpha(spacePalette.status.warning, 0.1),
                        color: alpha('#fff', 0.9),
                        border: '1px solid',
                        borderColor: alpha(spacePalette.status.warning, 0.3),
                        '& .MuiAlert-icon': {
                            color: spacePalette.status.warning,
                        },
                    }}
                >
                    {userAreaTexts.confirmationForm.initialView.offlineWarning}
                </Alert>
            )}

            {submissionAttempted && !isSubmitting && (
                <Alert
                    severity="error"
                    sx={{
                        mt: 3,
                        width: '100%',
                        bgcolor: alpha(spacePalette.status.error, 0.1),
                        color: alpha('#fff', 0.9),
                        border: '1px solid',
                        borderColor: alpha(spacePalette.status.error, 0.3),
                        '& .MuiAlert-icon': {
                            color: spacePalette.status.error,
                        },
                    }}
                >
                    {userAreaTexts.confirmationForm.initialView.errorMessage}
                </Alert>
            )}

            <Typography
                variant="body2"
                sx={{
                    mt: 2,
                    color: alpha('#fff', 0.6),
                    textAlign: 'center'
                }}
            >
                {userAreaTexts.confirmationForm.initialView.paymentNote}
            </Typography>
        </SpacePanelLayout>
    );
};

export default InitialView;