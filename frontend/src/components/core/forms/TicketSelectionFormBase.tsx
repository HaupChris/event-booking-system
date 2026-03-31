import React from 'react';
import { FormControl, RadioGroup, Box, Typography, alpha } from '@mui/material';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import TicketOptionComponent from '../display/TicketOption';
import type { TicketOption } from '../../../form/userArea/interface';
import { calculateDayVisitors, getMaxCapacityPerDay } from '../utils/CalculateNumberOfVisitors';
import { useThemeMode } from '../../styles/theme';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface TicketSelectionTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
}

interface TicketSelectionFormBaseProps {
  currentBooking: {
    ticket_id: number;
  };
  updateBooking: (key: 'ticket_id', value: number) => void;
  formContent: {
    ticket_options: TicketOption[];
  };
  formValidation: { [key: string]: string | undefined };
  texts: TicketSelectionTextProps;
}

function TicketSelectionFormBase(props: TicketSelectionFormBaseProps) {
  const { texts } = props;
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
  };

  const { visitorsThursday, visitorsFriday, visitorsSaturday } = calculateDayVisitors(
    props.formContent
  );
  const maxCapacityPerDay = getMaxCapacityPerDay(props.formContent);

  // Calculate remaining capacity per day
  const remainingThursday = Math.max(0, maxCapacityPerDay - visitorsThursday);
  const remainingFriday = Math.max(0, maxCapacityPerDay - visitorsFriday);
  const remainingSaturday = Math.max(0, maxCapacityPerDay - visitorsSaturday);

  // Calculate availability for each ticket option
  const getTicketAvailability = (option: TicketOption) => {
    const title = option.title.toLowerCase();
    let maxPossible = maxCapacityPerDay; // Start with max possible

    // Limit by each day this ticket includes
    if (title.includes('do')) {
      maxPossible = Math.min(maxPossible, remainingThursday);
    }
    if (title.includes('fr')) {
      maxPossible = Math.min(maxPossible, remainingFriday);
    }
    if (title.includes('sa')) {
      maxPossible = Math.min(maxPossible, remainingSaturday);
    }

    const remaining = Math.max(0, maxPossible);
    const isSoldOut = remaining === 0;
    const isLowStock = remaining <= 15 && remaining > 0;

    return {
      remaining,
      isSoldOut,
      isLowStock,
    };
  };

  return (
    <ThemedFormLayout footerId={texts.footerId}>
      <Box sx={{ mb: 2.4, px: { xs: 0.6, sm: 1.2 } }}>
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: 0.85,
            border: '1px solid',
            borderColor: alpha('#d8b87a', 0.95),
            clipPath: 'polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%)',
            background: isCircusMode
              ? 'linear-gradient(180deg, rgba(100,62,33,0.96) 0%, rgba(66,38,20,0.97) 50%, rgba(43,24,15,0.97) 100%)'
              : brandingPack.colors.ribbonBackground,
            boxShadow: isCircusMode
              ? '0 6px 14px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(244,205,142,0.28)'
              : 'none',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              color: isCircusMode ? '#f4ead6' : brandingPack.colors.ribbonText,
              fontFamily: brandingPack.typography.body,
              fontStyle: 'italic',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              letterSpacing: isCircusMode ? '0.01em' : undefined,
            }}
          >
            ★ {texts.missionBriefing} ★
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <FormControl
          component="fieldset"
          error={!!props.formValidation.ticket_id}
          required
          fullWidth
        >
          <RadioGroup
            name="ticketOptions"
            value={props.currentBooking.ticket_id}
            onChange={handleRadioChange}
          >
            {props.formContent.ticket_options.map((option: TicketOption) => {
              const availability = getTicketAvailability(option);

              return (
                <TicketOptionComponent
                  key={option.id}
                  currentBooking={props.currentBooking}
                  option={option}
                  soldOut={availability.isSoldOut}
                  remaining={availability.remaining}
                  isLowStock={availability.isLowStock}
                  maxCapacity={maxCapacityPerDay}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </Box>
    </ThemedFormLayout>
  );
}

export default TicketSelectionFormBase;
