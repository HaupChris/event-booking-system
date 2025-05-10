import React from "react";
import { Box, Typography } from "@mui/material";
import DrawIcon from '@mui/icons-material/Draw';
import GavelIcon from '@mui/icons-material/Gavel';
import SignaturePad from "../../components/core/inputs/SignaturePad";
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";
import MissionHeading from "../../components/core/display/MissionHeading";
import FormCard from "../../components/core/display/FormCard";
import { FormProps } from "./UserRegistrationFormContainer";
import {userAreaTexts} from "../constants/texts";

function SignatureForm(props: FormProps) {
  return (
    <SpacePanelLayout
      missionBriefing={userAreaTexts.signatureForm.missionBriefing}
      footerId={userAreaTexts.signatureForm.footerId}
    >
      <MissionHeading
        title={userAreaTexts.signatureForm.legalTitle}
        icon={<GavelIcon />}
      />

      {/* Legal Text */}
      <FormCard
          sx={{paddingTop:2}}
        description={userAreaTexts.signatureForm.legalText}
      >
          <Box/>
      </FormCard>

      {/* Signature Section */}
      <Box sx={{ mt: 4 }}>
        <MissionHeading
          title={userAreaTexts.signatureForm.signatureTitle}
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

export default SignatureForm;