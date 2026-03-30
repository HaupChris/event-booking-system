import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Paper,
  alpha,
  Chip,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import FormField from '../inputs/FormField';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import MissionHeading from '../display/MissionHeading';
import FormCard from '../display/FormCard';
import type { Profession } from '../../../form/userArea/interface';

interface PersonalDetailsTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
  subtitle: string;
  professionsTitle: string;
  professionsSubtitle: string;
  selectedProfessions: (count: number) => string;
}

type PersonalFieldKey = 'first_name' | 'last_name' | 'email' | 'phone';

interface PersonalDetailsFormBaseProps {
  updateBooking: (key: PersonalFieldKey | 'profession_ids', value: string | number[]) => void;
  currentBooking: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profession_ids: number[];
  };
  formValidation: { [key: string]: string | undefined };
  texts: PersonalDetailsTextProps;
  formContent: {
    professions: Profession[];
  };
  icon?: React.ReactNode;
  professionIdsField?: 'profession_ids';
}

function PersonalDetailsFormBase(props: PersonalDetailsFormBaseProps) {
  const {
    texts,
    icon = <PersonIcon />,
    formContent,
  } = props;
  const professionIdsField = props.professionIdsField ?? 'profession_ids';

  const theme = useTheme();
  const selectedProfessionIds =
    (props.currentBooking[professionIdsField] as number[] | undefined) ?? [];

  const handleProfessionToggle = (professionId: number) => {
    const currentIds = [...selectedProfessionIds];
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

  const selectedProfessions = (formContent.professions || []).filter((profession) =>
    selectedProfessionIds.includes(profession.id)
  );

  return (
    <ThemedFormLayout missionBriefing={texts.missionBriefing} footerId={texts.footerId}>
      {/* Event date information */}
      <MissionHeading
        title={texts.title}
        subtitle={texts.subtitle}
        icon={icon}
        withDivider={false}
      />

      <Box component="form" sx={{ mt: 2 }}>
        <FormField
          error={!!props.formValidation.first_name}
          id="first_name"
          label="Vorname"
          name="first_name"
          value={props.currentBooking.first_name}
          onChange={(e) => props.updateBooking('first_name', e.target.value)}
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
          onChange={(e) => props.updateBooking('last_name', e.target.value)}
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
          onChange={(e) => props.updateBooking('email', e.target.value)}
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
          onChange={(e) => props.updateBooking('phone', e.target.value)}
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
            <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
              {texts.selectedProfessions(selectedProfessions.length)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedProfessions.map((profession) => (
                <Chip
                  key={profession.id}
                  label={profession.title}
                  color="primary"
                  size="small"
                  icon={<WorkIcon sx={{ fontSize: '0.8rem !important' }} />}
                  sx={{
                    fontWeight: 'medium',
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    '& .MuiChip-label': { px: 1 },
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
              {(formContent.professions || []).map((profession) => (
                <Paper
                  key={profession.id}
                  elevation={1}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: '8px',
                    backgroundColor: selectedProfessionIds.includes(profession.id)
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.background.paper, 0.7),
                    border: '1px solid',
                    borderColor: selectedProfessionIds.includes(profession.id)
                      ? alpha(theme.palette.primary.main, 0.5)
                      : alpha(theme.palette.primary.main, 0.2),
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedProfessionIds.includes(profession.id)}
                        onChange={() => handleProfessionToggle(profession.id)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.primary,
                          fontWeight: selectedProfessionIds.includes(profession.id)
                            ? 'medium'
                            : 'normal',
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
    </ThemedFormLayout>
  );
}

export default PersonalDetailsFormBase;
