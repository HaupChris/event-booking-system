import React from 'react';
import { Box,  Typography, Grid} from '@mui/material';
import { ArtistFormProps } from './ArtistRegistrationFormContainer';
import SpacePanelLayout from '../../components/core/layouts/SpacePanelLayout';
import { artistAreaTexts } from '../constants/texts';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FormField from '../../components/core/inputs/FormField';
import MissionHeading from '../../components/core/display/MissionHeading';
import WWSelect from '../../components/core/inputs/WWSelect';

function ArtistPerformanceForm(props: ArtistFormProps) {
    // Extract performance details from JSON if available, or use empty object
    const performanceDetails = props.currentBooking.performance_details ?
        JSON.parse(props.currentBooking.performance_details) :
        { preferredDay: '', preferredTime: '', duration: '', genre: '', description: '', bandMembers: '' };

    // Update performance details
    const updatePerformanceDetail = (field: string, value: string) => {
        const updatedDetails = {
            ...performanceDetails,
            [field]: value
        };
        props.updateBooking('performance_details', JSON.stringify(updatedDetails));
    };

    // Define select options
    const dayOptions = [
        { value: 'Donnerstag', label: 'Donnerstag' },
        { value: 'Freitag', label: 'Freitag' },
        { value: 'Samstag', label: 'Samstag' }
    ];

    const timeOptions = [
        { value: 'Nachmittag', label: 'Nachmittag' },
        { value: 'Früher Abend', label: 'Früher Abend' },
        { value: 'Hauptprogramm', label: 'Hauptprogramm' },
        { value: 'Nacht', label: 'Nacht' }
    ];

    const durationOptions = [
        { value: '30', label: '30 Minuten' },
        { value: '45', label: '45 Minuten' },
        { value: '60', label: '60 Minuten' },
        { value: '90', label: '90 Minuten' },
        { value: '120', label: '120 Minuten' }
    ];

    return (
        <SpacePanelLayout
            missionBriefing={artistAreaTexts.performanceDetailsForm.missionBriefing}
            footerId={artistAreaTexts.performanceDetailsForm.footerId}
        >
            <MissionHeading
                title={artistAreaTexts.performanceDetailsForm.title}
                icon={<MusicNoteIcon />}
            />

            <Grid container spacing={3}>
                {/*<Grid item xs={12} sm={6}>*/}
                {/*    <Box sx={{ mb: 3 }}>*/}
                {/*        <Typography variant="subtitle1" sx={{ mb: 1 }}>*/}
                {/*            {artistAreaTexts.performanceDetailsForm.preferredDayLabel}*/}
                {/*        </Typography>*/}
                {/*        <WWSelect*/}
                {/*            options={dayOptions}*/}
                {/*            value={performanceDetails.preferredDay}*/}
                {/*            onChange={(value) => updatePerformanceDetail('preferredDay', value as string)}*/}
                {/*            placeholder="Tag wählen"*/}
                {/*            isFullWidth*/}
                {/*        />*/}
                {/*    </Box>*/}
                {/*</Grid>*/}

                {/*<Grid item xs={12} sm={6}>*/}
                {/*    <Box sx={{ mb: 3 }}>*/}
                {/*        <Typography variant="subtitle1" sx={{ mb: 1 }}>*/}
                {/*            {artistAreaTexts.performanceDetailsForm.preferredTimeLabel}*/}
                {/*        </Typography>*/}
                {/*        <WWSelect*/}
                {/*            options={timeOptions}*/}
                {/*            value={performanceDetails.preferredTime}*/}
                {/*            onChange={(value) => updatePerformanceDetail('preferredTime', value as string)}*/}
                {/*            placeholder="Zeit wählen"*/}
                {/*            isFullWidth*/}
                {/*        />*/}
                {/*    </Box>*/}
                {/*</Grid>*/}

                <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            {artistAreaTexts.performanceDetailsForm.durationLabel}
                        </Typography>
                        <WWSelect
                            options={durationOptions}
                            value={performanceDetails.duration}
                            onChange={(value) => updatePerformanceDetail('duration', value as string)}
                            placeholder="Dauer wählen"
                            isFullWidth
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        label={artistAreaTexts.performanceDetailsForm.genreLabel}
                        value={performanceDetails.genre}
                        onChange={(e) => updatePerformanceDetail('genre', e.target.value)}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormField
                        label={artistAreaTexts.performanceDetailsForm.descriptionLabel}
                        multiline
                        rows={3}
                        placeholder="Kurze Beschreibung für Programm und Ankündigungen"
                        value={performanceDetails.description}
                        onChange={(e) => updatePerformanceDetail('description', e.target.value)}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormField
                        label={artistAreaTexts.performanceDetailsForm.bandMembersLabel}
                        multiline
                        rows={2}
                        placeholder="Namen und Rollen aller Beteiligten"
                        value={performanceDetails.bandMembers}
                        onChange={(e) => updatePerformanceDetail('bandMembers', e.target.value)}
                    />
                </Grid>
            </Grid>
        </SpacePanelLayout>
    );
}

export default ArtistPerformanceForm;