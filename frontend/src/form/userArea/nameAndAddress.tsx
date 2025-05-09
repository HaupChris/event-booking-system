// src/form/userArea/nameAndAddress.tsx (refactored)
import React from "react";
import { Box } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';

// Import our shared components
import FormField from '../../components/core/inputs/FormField';
import SpacePanelLayout from '../../components/core/layouts/SpacePanelLayout';
import MissionHeading from '../../components/core/display/MissionHeading';
import { FormProps } from "./formContainer";

function NameAndAddressForm(props: FormProps) {
  return (
    <SpacePanelLayout
      missionBriefing="Bitte gib deine Kontaktinformationen für die Festival-Registrierung ein."
      footerId="WWWW-CREW-REGISTRATION // ID-2025"
    >
      {/* Event date information */}
      <MissionHeading
        title="Persönliche Daten"
        subtitle="Do, 28.08. - So, 31.08.2025"
        withDivider={false}
      />

      <Box
        component="form"
        sx={{ mt: 2 }}
      >
        <FormField
          error={!!props.formValidation.first_name}
          id="first_name"
          label="Vorname"
          name="first_name"
          value={props.currentBooking.first_name}
          onChange={e => props.updateBooking("first_name", e.target.value)}
          autoFocus
          required
          icon={<PersonIcon />}
        />

        <FormField
          error={!!props.formValidation.last_name}
          name="last_name"
          label="Nachname"
          id="last_name"
          value={props.currentBooking.last_name}
          onChange={e => props.updateBooking("last_name", e.target.value)}
          required
          icon={<BadgeIcon />}
        />

        <FormField
          error={!!props.formValidation.email}
          type="email"
          name="email"
          label="E-Mail (für deine Ticketbestätigung)"
          id="email"
          value={props.currentBooking.email}
          onChange={e => props.updateBooking("email", e.target.value)}
          required
          icon={<AlternateEmailIcon />}
        />

        <FormField
          error={!!props.formValidation.phone}
          type="tel"
          name="phone"
          label="Telefon"
          id="phone"
          value={props.currentBooking.phone}
          onChange={e => props.updateBooking("phone", e.target.value)}
          required
          icon={<SmartphoneIcon />}
        />
      </Box>
    </SpacePanelLayout>
  );
}

export default NameAndAddressForm;