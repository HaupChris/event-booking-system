import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import PlaceIcon from '@mui/icons-material/Place';
import FlagIcon from '@mui/icons-material/Flag';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import NotesIcon from '@mui/icons-material/Notes';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import type { Dayjs } from 'dayjs';
import { OrnateInput } from '../../form/userArea/TestDesignFormPrimitives';
import type { RideSharePostType } from '../../services/profileService';

interface RideSharingCreateFormProps {
  cardSx: object;
  headingFont?: string;
  postType: RideSharePostType;
  origin: string;
  destination: string;
  departureDate: Dayjs | null;
  departureTime: Dayjs | null;
  seatsTotalInput: string;
  notes: string;
  submitting: boolean;
  isCreateDisabled: boolean;
  onSetPostType: (postType: RideSharePostType) => void;
  onSetOrigin: (value: string) => void;
  onSetDestination: (value: string) => void;
  onSetDepartureDate: (value: Dayjs | null) => void;
  onSetDepartureTime: (value: Dayjs | null) => void;
  onSetSeatsTotalInput: (value: string) => void;
  onSetNotes: (value: string) => void;
  onCreate: () => void;
}

const pickerTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: 'rgba(26, 11, 18, 0.62)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    '& fieldset': {
      borderColor: '#cda163',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#d8b87a',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#f0c777',
      borderWidth: '2px',
    },
    '& input': {
      color: '#f4ead6',
      fontFamily: "'Merriweather', serif",
    },
  },
  '& .MuiInputLabel-root': {
    color: '#d8b87a',
    fontFamily: "'Merriweather', serif",
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#f0c777',
  },
  '& .MuiSvgIcon-root': {
    color: '#d8b87a',
  },
};

const RideSharingCreateForm: React.FC<RideSharingCreateFormProps> = ({
  cardSx,
  headingFont,
  postType,
  origin,
  destination,
  departureDate,
  departureTime,
  seatsTotalInput,
  notes,
  submitting,
  isCreateDisabled,
  onSetPostType,
  onSetOrigin,
  onSetDestination,
  onSetDepartureDate,
  onSetDepartureTime,
  onSetSeatsTotalInput,
  onSetNotes,
  onCreate,
}) => {
  return (
    <Card variant="outlined" sx={{ ...cardSx, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: headingFont }}>
          Neue Fahrt einstellen
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant={postType === 'offer' ? 'contained' : 'outlined'}
            onClick={() => onSetPostType('offer')}
            disabled={submitting}
          >
            Fahrtangebot
          </Button>
          <Button
            variant={postType === 'request' ? 'contained' : 'outlined'}
            onClick={() => onSetPostType('request')}
            disabled={submitting}
          >
            Fahrtgesuch
          </Button>
        </Box>

        <OrnateInput
          size="compact"
          label="Startort"
          icon={<PlaceIcon />}
          value={origin}
          onChange={(event) => onSetOrigin(event.target.value)}
          placeholder="z.B. Dresden"
        />
        <OrnateInput
          size="compact"
          label="Zielort"
          icon={<FlagIcon />}
          value={destination}
          onChange={(event) => onSetDestination(event.target.value)}
          placeholder="z.B. Festivalgelaende"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Abfahrtsdatum"
            value={departureDate}
            onChange={onSetDepartureDate}
            disabled={submitting}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2, ...pickerTextFieldSx } } }}
          />
          <TimePicker
            label="Uhrzeit"
            value={departureTime}
            onChange={onSetDepartureTime}
            disabled={submitting}
            ampm={false}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2, ...pickerTextFieldSx } } }}
          />
        </LocalizationProvider>

        {postType === 'offer' && (
          <OrnateInput
            size="compact"
            label="Freie Plaetze"
            icon={<EventSeatIcon />}
            value={seatsTotalInput}
            onChange={(event) => onSetSeatsTotalInput(event.target.value)}
            type="number"
            placeholder="1 - 20"
          />
        )}

        <OrnateInput
          size="compact"
          label="Notiz (optional)"
          icon={<NotesIcon />}
          value={notes}
          onChange={(event) => onSetNotes(event.target.value)}
          multiline={true}
          rows={3}
          placeholder="Treffpunkt, Gepaeck, Zwischenstopps ..."
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" onClick={onCreate} disabled={isCreateDisabled}>
            Eintrag erstellen
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RideSharingCreateForm;
