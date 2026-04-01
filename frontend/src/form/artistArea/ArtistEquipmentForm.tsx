import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import SettingsIcon from '@mui/icons-material/Settings';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FormCard from '../../components/core/display/FormCard';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import MissionHeading from '../../components/core/display/MissionHeading';
import { useThemeMode } from '../../components/styles/theme';
import { OrnateInput } from '../userArea/TestDesignFormPrimitives';

function ArtistEquipmentForm(props: ArtistFormProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

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

  const linkStyle = {
    color: isCircusMode ? '#e8d2ab' : theme.palette.primary.main,
    textDecorationColor: isCircusMode ? alpha('#d8b87a', 0.7) : undefined,
  };

  return (
    <ThemedFormLayout
      missionBriefing={artistAreaTexts.technicalRequirementsForm.missionBriefing}
      footerId={artistAreaTexts.technicalRequirementsForm.footerId}
    >
      <FormCard sx={sectionCardSx}>
        <MissionHeading
          title={artistAreaTexts.technicalRequirementsForm.title}
          icon={<SettingsIcon />}
        />

        <Box sx={{ px: 2, pb: 2 }}>
          <OrnateInput
            multiline
            rows={5}
            label={artistAreaTexts.technicalRequirementsForm.equipmentLabel}
            placeholder={artistAreaTexts.technicalRequirementsForm.equipmentPlaceholder}
            value={props.currentBooking.equipment}
            onChange={(e) => props.updateBooking('equipment', e.target.value)}
            icon={<SettingsIcon fontSize="large" />}
            size="compact"
          />
          {props.formValidation.equipment ? (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: -1.4, mb: 1.8, ml: 0.4, display: 'block' }}
            >
              {props.formValidation.equipment}
            </Typography>
          ) : null}

          <OrnateInput
            multiline
            rows={4}
            label={artistAreaTexts.specialRequestsForm.specialRequestsLabel}
            placeholder={artistAreaTexts.specialRequestsForm.specialRequestsPlaceholder}
            value={props.currentBooking.special_requests}
            onChange={(e) => props.updateBooking('special_requests', e.target.value)}
            icon={<Inventory2Icon fontSize="large" />}
            size="compact"
          />
        </Box>
      </FormCard>

      <FormCard sx={{ mt: 3, ...(sectionCardSx || {}) }}>
        <MissionHeading
          title="Verfügbare Ausrüstung am Veranstaltungsort"
          icon={<Inventory2Icon />}
        />

        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            variant="body2"
            paragraph
            sx={{
              color: isCircusMode ? alpha('#f4ead6', 0.9) : theme.palette.text.primary,
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            Folgendes Equipment steht grundsätzlich zur Verfügung (Details können variieren):
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              mt: 2,
              color: isCircusMode ? '#e8d2ab' : theme.palette.text.primary,
              fontFamily: isCircusMode ? '"Rye", serif' : undefined,
            }}
          >
            Hauptbühne:
          </Typography>
          <Box
            component="ul"
            sx={{
              mt: 1,
              mb: 0,
              pl: 3,
              '& > li': {
                color: isCircusMode
                  ? alpha('#f4ead6', 0.9)
                  : alpha(theme.palette.text.primary, 0.85),
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
                mb: 0.5,
              },
            }}
          >
            <li>XDJ-XZ</li>
            <li>1x XDJ 1000</li>
            <li>1x Reloop rp7000</li>
          </Box>

          <Typography
            variant="subtitle2"
            sx={{
              mt: 2,
              color: isCircusMode ? '#e8d2ab' : theme.palette.text.primary,
              fontFamily: isCircusMode ? '"Rye", serif' : undefined,
            }}
          >
            Bandbühne:
          </Typography>
          <Box
            component="ul"
            sx={{
              mt: 1,
              mb: 0,
              pl: 3,
              '& > li': {
                color: isCircusMode
                  ? alpha('#f4ead6', 0.9)
                  : alpha(theme.palette.text.primary, 0.85),
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
                mb: 0.5,
              },
            }}
          >
            <li>
              <a
                href="https://www.thomann.de/de/yamaha_stagepas_1k_stereo_bundle.htm"
                target="_blank"
                style={linkStyle}
                rel="noreferrer"
              >
                Yamaha Stagepas 1K Stereo Bundle
              </a>
            </li>
            <li>
              <a
                href="https://www.behringer.com/product.html?modelCode=0605-AAD"
                target="_blank"
                style={linkStyle}
                rel="noreferrer"
              >
                Behringer XR18 Wireless Mixer
              </a>
            </li>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: isCircusMode
                ? alpha('#e5cf9f', 0.88)
                : alpha(theme.palette.text.primary, 0.72),
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            Bitte beachte: Spezielle Ausrüstung muss selbst mitgebracht werden oder im Vorfeld
            abgestimmt werden.
          </Typography>
        </Box>
      </FormCard>
    </ThemedFormLayout>
  );
}

export default ArtistEquipmentForm;
