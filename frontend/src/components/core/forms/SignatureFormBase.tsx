import React from "react";
import { Box, Typography } from "@mui/material";
import DrawIcon from '@mui/icons-material/Draw';
import GavelIcon from '@mui/icons-material/Gavel';
import SignaturePad from "../inputs/SignaturePad";
import SpacePanelLayout from "../layouts/SpacePanelLayout";
import MissionHeading from "../display/MissionHeading";
import FormCard from "../display/FormCard";

interface SignatureTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
  legalTitle: string;
  legalText: string;
  signatureTitle: string;
}

interface SignatureFormBaseProps {
  updateBooking: (key: any, value: any) => void;
  currentBooking: {
    signature: string;
  };
  formValidation: { [key: string]: string | undefined };
  texts: SignatureTextProps;
}

function SignatureFormBase(props: SignatureFormBaseProps) {
  const { texts } = props;

  return (
    <SpacePanelLayout
      missionBriefing={texts.missionBriefing}
      footerId={texts.footerId}
    >
      <MissionHeading
        title={texts.legalTitle}
        icon={<GavelIcon />}
      />

      {/* Legal Text */}
      <FormCard
        sx={{paddingTop:2}}
        description={texts.legalText}
      >
        <Box/>
      </FormCard>

      {/* Signature Section */}
      <Box sx={{ mt: 4 }}>
        <MissionHeading
          title={texts.signatureTitle}
          icon={<DrawIcon />}
          withDivider={false}
        />

        <Box sx={{ mt: 2}}>
          <SignaturePad
            currentSignature={props.currentBooking.signature}
            updateCurrentSignature={(signature: string) => props.updateBooking("signature", signature)}
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
              mt: 1
            }}
          >
            {props.formValidation.signature}
          </Typography>
        )}
      </Box>
    </SpacePanelLayout>
  );
}

export default SignatureFormBase;