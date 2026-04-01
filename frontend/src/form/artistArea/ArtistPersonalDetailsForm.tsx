import React from 'react';
import {
  Box,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import type { ArtistBandMember, ArtistType } from './interface';
import { artistAreaTexts } from '../constants/texts';
import PersonalDetailsFormBase from '../../components/core/forms/PersonalDetailsFormBase';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import MissionHeading from '../../components/core/display/MissionHeading';
import FormCard from '../../components/core/display/FormCard';
import { OrnateInput } from '../userArea/TestDesignFormPrimitives';
import { useThemeMode } from '../../components/styles/theme';

const createBandMember = (): ArtistBandMember => ({
  id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  first_name: '',
  last_name: '',
  email: '',
  ticket_id: -1,
  beverage_id: -1,
  food_id: -1,
});

function ArtistPersonalDetailsForm(props: ArtistFormProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const artistType = props.currentBooking.artist_type ?? 'dj';
  const bandMembers = props.currentBooking.band_members ?? [];

  const setBandMembers = (members: ArtistBandMember[]) => {
    props.updateBooking('band_members', members);
  };

  const handleArtistTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: ArtistType | null
  ) => {
    if (!value) {
      return;
    }

    props.updateBooking('artist_type', value);
    if (value === 'band' && bandMembers.length === 0) {
      setBandMembers([createBandMember()]);
    }
  };

  const updateBandMember = (
    memberId: string,
    key: 'first_name' | 'last_name' | 'email',
    value: string
  ) => {
    setBandMembers(
      bandMembers.map((member) => (member.id === memberId ? { ...member, [key]: value } : member))
    );
  };

  const removeBandMember = (memberId: string) => {
    setBandMembers(bandMembers.filter((member) => member.id !== memberId));
  };

  const extraContent = (
    <Box sx={{ mt: 4 }}>
      <MissionHeading
        title="Act-Typ"
        subtitle="DJ oder Band"
        icon={<GroupsIcon />}
        withDivider={true}
      />
      <FormCard>
        <Box sx={{ p: 2 }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={artistType}
            onChange={handleArtistTypeChange}
            sx={{ mb: artistType === 'band' ? 2 : 0 }}
          >
            <ToggleButton value="dj">DJ</ToggleButton>
            <ToggleButton value="band">Band</ToggleButton>
          </ToggleButtonGroup>

          {artistType === 'band' && (
            <>
              <OrnateInput
                label="Bandname (optional)"
                value={props.currentBooking.band_name ?? ''}
                onChange={(event) => props.updateBooking('band_name', event.target.value)}
                icon={<MusicNoteIcon fontSize="large" />}
                size="compact"
              />

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  mb: 1.5,
                  color: isCircusMode ? alpha('#f0dfbf', 0.85) : theme.palette.text.secondary,
                }}
              >
                Hauptansprechperson trägst du oben ein. Fuege hier die weiteren Bandmitglieder
                hinzu.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {bandMembers.map((member, index) => (
                  <Box
                    key={member.id}
                    sx={{
                      border: '1px solid',
                      borderColor: isCircusMode
                        ? alpha('#d8b87a', 0.7)
                        : alpha(theme.palette.divider, 0.8),
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Bandmitglied {index + 1}</Typography>
                      <IconButton
                        aria-label="Bandmitglied entfernen"
                        onClick={() => removeBandMember(member.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 1.25,
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                      }}
                    >
                      <OrnateInput
                        label="Vorname"
                        value={member.first_name}
                        onChange={(event) =>
                          updateBandMember(member.id, 'first_name', event.target.value)
                        }
                        icon={<MusicNoteIcon fontSize="large" />}
                        size="compact"
                      />
                      <OrnateInput
                        label="Nachname"
                        value={member.last_name}
                        onChange={(event) =>
                          updateBandMember(member.id, 'last_name', event.target.value)
                        }
                        icon={<MusicNoteIcon fontSize="large" />}
                        size="compact"
                      />
                      <OrnateInput
                        label="E-Mail"
                        value={member.email}
                        onChange={(event) =>
                          updateBandMember(member.id, 'email', event.target.value)
                        }
                        icon={<AlternateEmailIcon fontSize="large" />}
                        size="compact"
                        type="email"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              <Button
                variant="outlined"
                startIcon={<PersonAddAltIcon />}
                onClick={() => setBandMembers([...bandMembers, createBandMember()])}
                sx={{ mt: 1.5, textTransform: 'none' }}
              >
                Bandmitglied hinzufuegen
              </Button>
            </>
          )}
        </Box>
      </FormCard>
    </Box>
  );

  return (
    <PersonalDetailsFormBase
      updateBooking={props.updateBooking}
      currentBooking={props.currentBooking}
      formValidation={props.formValidation}
      texts={artistAreaTexts.personalDetailsForm}
      icon={<MusicNoteIcon />}
      formContent={props.formContent}
      onDevSeedForm={props.onDevSeedForm}
      extraContent={extraContent}
    />
  );
}

export default ArtistPersonalDetailsForm;
