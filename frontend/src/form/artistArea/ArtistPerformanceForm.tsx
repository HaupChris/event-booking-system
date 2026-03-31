import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FormField from '../../components/core/inputs/FormField';
import WWSelect from '../../components/core/inputs/WWSelect';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';

function ArtistPerformanceForm(props: ArtistFormProps) {
  const theme = useTheme();
  // Extract performance details from JSON if available, or use empty object
  const performanceDetails = props.currentBooking.performance_details
    ? JSON.parse(props.currentBooking.performance_details)
    : {
        preferredDay: '',
        preferredTime: '',
        duration: '',
        genre: '',
        description: '',
        bandMembers: '',
      };

  // Update performance details
  const updatePerformanceDetail = (field: string, value: string) => {
    const updatedDetails = {
      ...performanceDetails,
      [field]: value,
    };
    props.updateBooking('performance_details', JSON.stringify(updatedDetails));
  };

  const durationOptions = [
    { value: '30', label: '30 Minuten' },
    { value: '45', label: '45 Minuten' },
    { value: '60', label: '60 Minuten' },
    { value: '90', label: '90 Minuten' },
    { value: '120', label: '120 Minuten' },
  ];

  return (
    <ThemedFormLayout
      missionBriefing={artistAreaTexts.performanceDetailsForm.missionBriefing}
      footerId={artistAreaTexts.performanceDetailsForm.footerId}
    >
      <FormCard
        title={artistAreaTexts.performanceDetailsForm.title}
        icon={<MusicNoteIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />}
      >
        <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
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

            <Box sx={{ flex: 1 }}>
              <FormField
                label={artistAreaTexts.performanceDetailsForm.genreLabel}
                value={performanceDetails.genre}
                onChange={(e) => updatePerformanceDetail('genre', e.target.value)}
              />
            </Box>
          </Box>

          <FormField
            label={artistAreaTexts.performanceDetailsForm.descriptionLabel}
            multiline
            rows={3}
            placeholder="Kurze Beschreibung für Programm und Ankündigungen"
            value={performanceDetails.description}
            onChange={(e) => updatePerformanceDetail('description', e.target.value)}
          />

          <FormField
            label={artistAreaTexts.performanceDetailsForm.bandMembersLabel}
            multiline
            rows={2}
            placeholder="Namen und Rollen aller Beteiligten"
            value={performanceDetails.bandMembers}
            onChange={(e) => updatePerformanceDetail('bandMembers', e.target.value)}
          />
        </Box>
      </FormCard>
    </ThemedFormLayout>
  );
}

export default ArtistPerformanceForm;
