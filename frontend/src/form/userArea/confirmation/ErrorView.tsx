import React from 'react';
import {Box, Typography, Button, alpha} from '@mui/material';
import {ErrorOutline, Refresh} from '@mui/icons-material';
import SpacePanelLayout from '../../../components/core/layouts/SpacePanelLayout';
import FormCard from '../../../components/core/display/FormCard';
import {spacePalette} from '../../../components/styles/theme';
import {userAreaTexts} from "../../constants/texts";

interface ErrorViewProps {
    onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({onRetry}) => {
    return <SpacePanelLayout
        missionBriefing={userAreaTexts.confirmationForm.errorView.missionBriefing}
        footerId={userAreaTexts.confirmationForm.errorView.footerId}
    >
        <FormCard sx={{mb: 3}}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2
            }}>
                <ErrorOutline sx={{color: spacePalette.status.error, fontSize: 60, mb: 1}}/>
                <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{color: alpha('#fff', 0.9)}}
                >
                    {userAreaTexts.confirmationForm.errorView.title}
                </Typography>
            </Box>
        </FormCard>

        <Typography
            variant="body1"
            paragraph
            align="center"
            sx={{color: alpha('#fff', 0.8)}}
        >
            {userAreaTexts.confirmationForm.errorView.subtitle}
        </Typography>

        <FormCard sx={{mb: 3}}>
            <Box component="ul" sx={{
                pl: 4,
                pr: 2,
                py: 2,
                mb: 0,
                '& > li': {
                    color: alpha('#fff', 0.8),
                    mb: 1,
                }
            }}>
                {userAreaTexts.confirmationForm.errorView.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                ))}
            </Box>
        </FormCard>

        <Typography
            variant="body1"
            paragraph
            fontWeight="medium"
            sx={{
                textAlign: 'center',
                mb: 3,
                color: alpha('#fff', 0.8),
            }}
        >
            {userAreaTexts.confirmationForm.errorView.contactInfo}
        </Typography>

        <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onRetry}
            startIcon={<Refresh/>}
            sx={{
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #1e88e5, #64b5f6)',
                '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                }
            }}
        >
            {userAreaTexts.confirmationForm.errorView.retryButton}
        </Button>
    </SpacePanelLayout>;
};

export default ErrorView;