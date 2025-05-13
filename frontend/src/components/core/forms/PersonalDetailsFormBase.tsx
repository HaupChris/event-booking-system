import React from "react";
import { Box, Typography, Checkbox, FormGroup, FormControlLabel, Paper, alpha, Chip} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import FormField from '../inputs/FormField';
import SpacePanelLayout from '../layouts/SpacePanelLayout';
import MissionHeading from '../display/MissionHeading';
import FormCard from '../display/FormCard';
import { spacePalette } from '../../styles/theme';

interface Profession {
  id: number;
  title: string;
}

interface PersonalDetailsTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
  subtitle: string;
  professionsTitle: string;
  professionsSubtitle: string;
  selectedProfessions: (count: number) => string;
}

interface PersonalDetailsFormBaseProps {
  updateBooking: (key: any, value: any) => void;
  currentBooking: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profession_ids: number[];
    [key: string]: any;
  };
  formValidation: { [key: string]: string | undefined };
  texts: PersonalDetailsTextProps;
  formContent: {
    professions: Profession[];
    [key: string]: any;
  };
  icon?: React.ReactNode;
  professionIdsField?: string;
}

function PersonalDetailsFormBase(props: PersonalDetailsFormBaseProps) {
  const {
    texts,
    icon = <PersonIcon />,
    formContent,
    professionIdsField = 'profession_ids'
  } = props;

  const handleProfessionToggle = (professionId: number) => {
    const currentIds = [...props.currentBooking[professionIdsField]];
    const index = currentIds.indexOf(professionId);

    if (index === -1) {
      // Add profession
      props.updateBooking(professionIdsField, [...currentIds, professionId]);
    } else {
      // Remove profession
      currentIds.splice(index, 1);
      props.updateBooking(professionIdsField, currentIds);
    }
  };

  const selectedProfessions = (formContent.professions || [])
    .filter(profession => props.currentBooking[professionIdsField].includes(profession.id));

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

      {/* Professions Section */}
      <Box sx={{ mt: 4 }}>
        <MissionHeading
          title={texts.professionsTitle}
          subtitle={texts.professionsSubtitle}
          icon={<WorkIcon />}
          withDivider={true}
        />

        {selectedProfessions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: alpha('#fff', 0.8) }}>
              {texts.selectedProfessions(selectedProfessions.length)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedProfessions.map(profession => (
                <Chip
                  key={profession.id}
                  label={profession.title}
                  color="primary"
                  size="small"
                  icon={<WorkIcon sx={{ fontSize: '0.8rem !important' }}/>}
                  sx={{
                    fontWeight: 'medium',
                    bgcolor: alpha('#1e88e5', 0.2),
                    '& .MuiChip-label': { px: 1 }
                  }}
                  onDelete={() => handleProfessionToggle(profession.id)}
                />
              ))}
            </Box>
          </Box>
        )}

        <FormCard>
          <Box sx={{ p: 2 }}>
            <FormGroup>
              {(formContent.professions || []).map(profession => (
                <Paper
                  key={profession.id}
                  elevation={1}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: '8px',
                    backgroundColor: props.currentBooking[professionIdsField].includes(profession.id)
                      ? alpha(spacePalette.primary.main, 0.1)
                      : alpha('#020c1b', 0.7),
                    border: '1px solid',
                    borderColor: props.currentBooking[professionIdsField].includes(profession.id)
                      ? alpha(spacePalette.primary.main, 0.5)
                      : alpha('#90caf9', 0.3),
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={props.currentBooking[professionIdsField].includes(profession.id)}
                        onChange={() => handleProfessionToggle(profession.id)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        sx={{
                          color: alpha('#fff', 0.9),
                          fontWeight: props.currentBooking[professionIdsField].includes(profession.id) ? 'medium' : 'normal'
                        }}
                      >
                        {profession.title}
                      </Typography>
                    }
                  />
                </Paper>
              ))}
            </FormGroup>
          </Box>
        </FormCard>
      </Box>
    </SpacePanelLayout>
  );
}

export default PersonalDetailsFormBase;