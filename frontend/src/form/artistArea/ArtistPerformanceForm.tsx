import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupsIcon from '@mui/icons-material/Groups';
import WWSelect from '../../components/core/inputs/WWSelect';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';
import MissionHeading from '../../components/core/display/MissionHeading';
import { useThemeMode } from '../../components/styles/theme';
import { OrnateInput } from '../userArea/TestDesignFormPrimitives';

interface PerformanceDetails {
  preferredDay: string;
  preferredTime: string;
  duration: string;
  genre: string;
  description: string;
  bandMembers: string;
}

const getDefaultPerformanceDetails = (): PerformanceDetails => ({
  preferredDay: '',
  preferredTime: '',
  duration: '',
  genre: '',
  description: '',
  bandMembers: '',
});

const parsePerformanceDetails = (rawDetails: string): PerformanceDetails => {
  if (!rawDetails) {
    return getDefaultPerformanceDetails();
  }

  try {
    const parsed = JSON.parse(rawDetails);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        ...getDefaultPerformanceDetails(),
        ...(parsed as Partial<PerformanceDetails>),
      };
    }
  } catch {
    return {
      ...getDefaultPerformanceDetails(),
      description: rawDetails,
    };
  }

  return getDefaultPerformanceDetails();
};

function ArtistPerformanceForm(props: ArtistFormProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const performanceDetails = parsePerformanceDetails(props.currentBooking.performance_details);

  const sectionCardSx = isCircusMode
    ? {
        border: '2px solid',
        borderColor: alpha('#d8b87a', 0.88),
        backgroundColor: alpha('#1a0b12', 0.58),
        backgroundImage: 'none !important',
        borderRadius: '14px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.2)',
      }
    : undefined;

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
      <FormCard sx={sectionCardSx}>
        <MissionHeading
          title={artistAreaTexts.performanceDetailsForm.title}
          icon={<MusicNoteIcon />}
        />

        <Typography
          variant="body2"
          sx={{
            color: isCircusMode ? alpha('#e5cf9f', 0.92) : alpha(theme.palette.text.primary, 0.72),
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            px: 2,
            mb: 2,
          }}
        >
          Teile uns bitte die wichtigsten Eckdaten zu deinem Act mit.
        </Typography>

        <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                  fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
                }}
              >
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
              <OrnateInput
                label={artistAreaTexts.performanceDetailsForm.genreLabel}
                value={performanceDetails.genre}
                onChange={(e) => updatePerformanceDetail('genre', e.target.value)}
                icon={<MusicNoteIcon fontSize="large" />}
                size="compact"
              />
            </Box>
          </Box>

          <OrnateInput
            label={artistAreaTexts.performanceDetailsForm.descriptionLabel}
            multiline
            rows={3}
            placeholder="Kurze Beschreibung für Programm und Ankündigungen"
            value={performanceDetails.description}
            onChange={(e) => updatePerformanceDetail('description', e.target.value)}
            icon={<MusicNoteIcon fontSize="large" />}
            size="compact"
          />
        </Box>
      </FormCard>

      <FormCard sx={{ ...(sectionCardSx || {}) }}>
        <MissionHeading
          title={artistAreaTexts.performanceDetailsForm.bandMembersLabel}
          icon={<GroupsIcon />}
          withDivider={false}
        />

        <Box sx={{ px: 2, pb: 2 }}>
          <OrnateInput
            label={artistAreaTexts.performanceDetailsForm.bandMembersLabel}
            multiline
            rows={2}
            placeholder="Namen und Rollen aller Beteiligten"
            value={performanceDetails.bandMembers}
            onChange={(e) => updatePerformanceDetail('bandMembers', e.target.value)}
            icon={<GroupsIcon fontSize="large" />}
            size="compact"
          />
        </Box>
      </FormCard>
    </ThemedFormLayout>
  );
}

export default ArtistPerformanceForm;
