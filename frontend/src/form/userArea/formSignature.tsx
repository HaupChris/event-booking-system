// src/form/userArea/formSignature.tsx (refactored)
import React from "react";
import { Box, Typography } from "@mui/material";
import DrawIcon from '@mui/icons-material/Draw';
import GavelIcon from '@mui/icons-material/Gavel';

// Import our shared components
import SignaturePad from "../../components/core/inputs/SignaturePad";
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";
import MissionHeading from "../../components/core/display/MissionHeading";
import FormCard from "../../components/core/display/FormCard";
import { FormProps } from "./formContainer";

function FormSignature(props: FormProps) {
  return (
    <SpacePanelLayout
      missionBriefing="Vor Beginn deiner interstellaren Reise bestätige bitte die Sicherheitshinweise mit deiner digitalen Signatur."
      footerId="WWWW-AUTHORIZATION-PROTOCOL // ID-2025"
    >
      <MissionHeading
        title="Bestätigung der Teilnahmebedingungen"
        icon={<GavelIcon />}
      />

      {/* Legal Text */}
      <FormCard
        description="Hiermit bestätige ich, dass ich auf eigene Gefahr am 'Weiher Wald und Weltall-Wahn 2025' vom 29.08.2025 bis zum 01.09.2025 teilnehme. Der Veranstalter haftet bei Personen-, Sach- und Vermögensschäden nicht für leichte Fahrlässigkeit. Dies gilt sowohl für eigene Handlungen, als auch für Handlungen seiner Vertreter, Erfüllungsgehilfen oder Dritter, derer sich der Veranstalter im Zusammenhang mit der Durchführung der Veranstaltung bedient."
      >
          <Box/>
      </FormCard>

      {/* Signature Section */}
      <Box sx={{ mt: 4 }}>
        <MissionHeading
          title="Deine Unterschrift"
          icon={<DrawIcon />}
          withDivider={false}
        />

        <Box sx={{ mt: 2 }}>
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

export default FormSignature;