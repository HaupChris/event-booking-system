import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import DrawIcon from '@mui/icons-material/Draw';
import GavelIcon from '@mui/icons-material/Gavel';
import SignaturePad from '../inputs/SignaturePad';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import MissionHeading from '../display/MissionHeading';
import FormCard from '../display/FormCard';
import { useThemeMode } from '../../styles/theme';

interface SignatureTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
  legalTitle: string;
  legalText: string;
  signatureTitle: string;
}

interface SignatureFormBaseProps {
  updateBooking: (key: 'signature', value: string) => void;
  currentBooking: {
    signature: string;
  };
  formValidation: { [key: string]: string | undefined };
  texts: SignatureTextProps;
}

function SignatureFormBase(props: SignatureFormBaseProps) {
  const { texts } = props;
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  const sectionCardSx = isCircusMode
    ? {
        border: '2px solid',
        borderColor: alpha('#d8b87a', 0.9),
        backgroundColor: alpha('#1a0b12', 0.58),
        borderRadius: '14px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.2)',
      }
    : undefined;

  return (
    <ThemedFormLayout missionBriefing={texts.missionBriefing} footerId={texts.footerId}>
      <FormCard sx={sectionCardSx}>
        <MissionHeading title={texts.legalTitle} icon={<GavelIcon />} />
        <Typography
          variant="body2"
          sx={{
            color: isCircusMode ? alpha('#f4ead6', 0.9) : theme.palette.text.secondary,
            lineHeight: 1.65,
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            px: 2,
            pb: 2,
          }}
        >
          {texts.legalText}
        </Typography>
      </FormCard>

      <FormCard sx={{ mt: 3, ...(sectionCardSx || {}) }}>
        <MissionHeading title={texts.signatureTitle} icon={<DrawIcon />} withDivider={false} />

        <Box sx={{ mt: 2, px: { xs: 0.5, sm: 1.5 }, pb: 2 }}>
          <SignaturePad
            currentSignature={props.currentBooking.signature}
            updateCurrentSignature={(signature: string) =>
              props.updateBooking('signature', signature)
            }
          />
        </Box>

        {/* Error indicator if validation fails */}
        {props.formValidation.signature && (
          <Typography
            variant="caption"
            sx={{
              color: 'error.main',
              display: 'block',
              textAlign: 'center',
              mt: -0.5,
              pb: 1.5,
            }}
          >
            {props.formValidation.signature}
          </Typography>
        )}
      </FormCard>
    </ThemedFormLayout>
  );
}

export default SignatureFormBase;
