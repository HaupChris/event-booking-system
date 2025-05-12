import React from "react";
import { Box } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';
import FormField from '../inputs/FormField';
import SpacePanelLayout from '../layouts/SpacePanelLayout';
import MissionHeading from '../display/MissionHeading';

interface PersonalDetailsTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
  subtitle: string;
}

interface PersonalDetailsFormBaseProps {
  updateBooking: (key: any, value: any) => void;
  currentBooking: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  formValidation: { [key: string]: string | undefined };
  texts: PersonalDetailsTextProps;
  icon?: React.ReactNode;
}

function PersonalDetailsFormBase(props: PersonalDetailsFormBaseProps) {
  const { texts, icon = <PersonIcon /> } = props;

  return (
    <SpacePanelLayout
      missionBriefing={texts.missionBriefing}
      footerId={texts.footerId}
    >
      {/* Event date information */}
      <MissionHeading
        title={texts.title}
        subtitle={texts.subtitle}
        icon={icon}
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
          label="E-Mail (für deine Bestätigung)"
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

export default PersonalDetailsFormBase;