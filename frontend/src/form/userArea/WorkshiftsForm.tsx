import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FormProps } from './UserRegistrationFormContainer';
import WorkShift from '../../components/core/inputs/workShift';
import type { WorkShift as WorkShiftType } from '../userArea/interface';
import { Box, Divider, List, Typography, alpha, useTheme } from '@mui/material';
import { PRIORITIES } from './constants';

import '../../css/workShift.css';

import type { TimeSlot } from './interface';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';
import FormField from '../../components/core/inputs/FormField';
import WWSelect from '../../components/core/inputs/WWSelect';
import WWFAQ from '../../components/core/display/WWFAQ';
import { userAreaTexts } from '../constants/texts';
import { useThemeMode } from '../../components/styles/theme';
import MissionHeading from '../../components/core/display/MissionHeading';
import { OrnateInput } from './TestDesignFormPrimitives';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';

function HelpIcon() {
  return null;
}

function WorkShiftForm(props: FormProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const { currentBooking, updateBooking, formValidation, formContent } = props;
  // availablePriorities is computed via useMemo below

  const [supporterBuddyFirstName, setSupporterBuddyFirstName] = useState(
    currentBooking.supporter_buddy.split(' ')[0]
  );
  const [supporterBuddyLastName, setSupporterBuddyLastName] = useState(
    currentBooking.supporter_buddy.split(' ')[1] || ''
  );
  const selectedTicket = formContent.ticket_options.find(
    (ticket) => ticket.id === currentBooking.ticket_id
  );
  const requiresWorkshift = selectedTicket?.requires_workshift !== false;

  const numberOfShiftsOptions = [
    { value: 1, label: '1 Schicht' },
    { value: 2, label: '2 Schichten (1 Essen gratis)' },
    { value: 3, label: '3 Schichten (2 Essen gratis)' },
  ];

  const updateBookingRef = useRef(updateBooking);
  updateBookingRef.current = updateBooking;

  useEffect(() => {
    if (!requiresWorkshift) {
      return;
    }

    updateBookingRef.current(
      'supporter_buddy',
      supporterBuddyFirstName + ' ' + supporterBuddyLastName
    );
  }, [requiresWorkshift, supporterBuddyFirstName, supporterBuddyLastName]);

  useEffect(() => {
    if (requiresWorkshift) {
      return;
    }

    if (currentBooking.timeslot_priority_1 !== -1) {
      updateBookingRef.current('timeslot_priority_1', -1);
    }
    if (currentBooking.timeslot_priority_2 !== -1) {
      updateBookingRef.current('timeslot_priority_2', -1);
    }
    if (currentBooking.timeslot_priority_3 !== -1) {
      updateBookingRef.current('timeslot_priority_3', -1);
    }
    if (currentBooking.amount_shifts !== 0) {
      updateBookingRef.current('amount_shifts', 0);
    }
    if (currentBooking.supporter_buddy !== '') {
      updateBookingRef.current('supporter_buddy', '');
    }
    if (supporterBuddyFirstName !== '') {
      setSupporterBuddyFirstName('');
    }
    if (supporterBuddyLastName !== '') {
      setSupporterBuddyLastName('');
    }
  }, [
    currentBooking.amount_shifts,
    currentBooking.supporter_buddy,
    currentBooking.timeslot_priority_1,
    currentBooking.timeslot_priority_2,
    currentBooking.timeslot_priority_3,
    requiresWorkshift,
    supporterBuddyFirstName,
    supporterBuddyLastName,
  ]);

  const availablePriorities = useMemo(() => {
    const available = [PRIORITIES.FIRST, PRIORITIES.SECOND, PRIORITIES.THIRD];
    if (currentBooking.timeslot_priority_1 !== -1) {
      available.splice(available.indexOf(PRIORITIES.FIRST), 1);
    }
    if (currentBooking.timeslot_priority_2 !== -1) {
      available.splice(available.indexOf(PRIORITIES.SECOND), 1);
    }
    if (currentBooking.timeslot_priority_3 !== -1) {
      available.splice(available.indexOf(PRIORITIES.THIRD), 1);
    }
    return available;
  }, [
    currentBooking.timeslot_priority_1,
    currentBooking.timeslot_priority_2,
    currentBooking.timeslot_priority_3,
  ]);

  const faqItems = [
    {
      question: 'Was hat es hiermit auf sich?',
      answer:
        'Der Wiesenwahn ist ein nicht kommerzielles Event, das wir ohne eure Mithilfe weder stemmen, ' +
        'noch genießen können. Aus diesem Grund sind wir so organisiert, das jede teilnehmende Person ' +
        'mindestens eine kleine Schicht mitarbeitet. Damit nicht die ersten Registrierungen die besten Schichten abbekommen, ' +
        'vergibst du Prioritäten und wir teilen nach der Anmeldephase alles zu.' +
        'Bei Überbelegung einer Schicht entscheidet das Los.',
    },
  ];

  function updateAmountShifts(newValue: string | number | null) {
    if (newValue === null || newValue === undefined) {
      return;
    } else {
      updateBooking('amount_shifts', newValue as number);
    }
  }

  function compareWorkshiftsByNumBooked(shift_a: WorkShiftType, shift_b: WorkShiftType) {
    const shift_a_workers = shift_a.time_slots.reduce(
      (sum: number, timeslot: TimeSlot) => sum + timeslot.num_needed - timeslot.num_booked,
      0
    );
    const shift_b_workers = shift_b.time_slots.reduce(
      (sum: number, timeslot: TimeSlot) => sum + timeslot.num_needed - timeslot.num_booked,
      0
    );
    if (shift_a_workers > shift_b_workers) {
      return -1;
    }
    if (shift_a_workers < shift_b_workers) {
      return 1;
    }
    return 0;
  }

  const circusSectionCardSx = isCircusMode
    ? {
        border: '2px solid',
        borderColor: alpha('#d8b87a', 0.9),
        backgroundColor: alpha('#1a0b12', 0.58),
        borderRadius: '14px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.2)',
      }
    : undefined;

  const circusHeadingOverrideSx = isCircusMode
    ? {
        '& .MuiTypography-h6': {
          color: '#f0ddb7',
          fontFamily: '"Rye", serif',
        },
        '& .MuiTypography-body2': {
          color: alpha('#f4ead6', 0.9),
        },
        '& .MuiDivider-root': {
          borderColor: alpha('#d8b87a', 0.5),
        },
      }
    : undefined;

  return (
    <ThemedFormLayout
      missionBriefing={
        requiresWorkshift
          ? userAreaTexts.workshiftsForm.missionBriefing
          : 'Fuer dein ausgewaehltes Ticket ist kein Arbeitsdienst erforderlich.'
      }
      footerId={userAreaTexts.workshiftsForm.footerId}
    >
      {!requiresWorkshift ? (
        <FormCard tooltipPlacement={'top-start'} sx={circusSectionCardSx}>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              color: isCircusMode ? '#f0ddb7' : theme.palette.text.primary,
              fontFamily: isCircusMode ? '"Rye", serif' : undefined,
            }}
          >
            Kein Arbeitsdienst notwendig
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isCircusMode ? alpha('#f4ead6', 0.9) : theme.palette.text.secondary,
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            Mit diesem Ticket kannst du ohne Schichtprioritaeten fortfahren.
          </Typography>
        </FormCard>
      ) : (
        <>
          <WWFAQ items={faqItems} title="" description="" icon={<HelpIcon />} sx={{ mb: 3 }} />
          <FormCard tooltipPlacement={'top-start'} sx={circusSectionCardSx}>
            <Box sx={circusHeadingOverrideSx}>
              <MissionHeading
                title={userAreaTexts.workshiftsForm.shiftsCountTitle}
                subtitle={userAreaTexts.workshiftsForm.shiftsCountHelperText}
                withDivider={true}
              />
            </Box>
            <WWSelect
              options={numberOfShiftsOptions}
              value={currentBooking.amount_shifts}
              onChange={updateAmountShifts}
              minWidth="100%"
            />
          </FormCard>

          <FormCard
            sx={{
              marginTop: 3,
              marginBottom: 3,
              ...(circusSectionCardSx || {}),
            }}
          >
            <Box sx={circusHeadingOverrideSx}>
              <MissionHeading
                title={userAreaTexts.workshiftsForm.crewPartner}
                subtitle={userAreaTexts.workshiftsForm.crewPartnerDescription}
                withDivider={true}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1.2, sm: 2 },
              }}
            >
              {isCircusMode ? (
                <>
                  <Box sx={{ flex: 1 }}>
                    <OrnateInput
                      label="Vorname"
                      value={supporterBuddyFirstName}
                      onChange={(e) => setSupporterBuddyFirstName(e.target.value)}
                      icon={<PersonIcon fontSize="large" />}
                      size="compact"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <OrnateInput
                      label="Nachname"
                      value={supporterBuddyLastName}
                      onChange={(e) => setSupporterBuddyLastName(e.target.value)}
                      icon={<BadgeIcon fontSize="large" />}
                      size="compact"
                    />
                  </Box>
                </>
              ) : (
                <>
                  <FormField
                    error={!!formValidation.supporter_buddy}
                    id="first_name"
                    label="Vorname"
                    name="first_name"
                    value={supporterBuddyFirstName}
                    onChange={(e) => setSupporterBuddyFirstName(e.target.value)}
                  />
                  <FormField
                    error={!!formValidation.supporter_buddy}
                    id="last_name"
                    label="Nachname"
                    name="last_name"
                    value={supporterBuddyLastName}
                    onChange={(e) => setSupporterBuddyLastName(e.target.value)}
                  />
                </>
              )}
            </Box>
          </FormCard>

          <MissionHeading title="Verfuegbare Schichten" withDivider={true} />

          {/* Work Shifts List */}
          <List>
            {formContent.work_shifts
              .filter((workshift) => workshift.title.toLowerCase() !== 'already employed')
              .sort(compareWorkshiftsByNumBooked)
              .concat(
                formContent.work_shifts.filter(
                  (workshift) => workshift.title.toLowerCase() === 'already employed'
                )
              )
              .map((workShift, index) => (
                <React.Fragment key={workShift.id}>
                  <WorkShift
                    workShift={workShift}
                    availablePriorities={availablePriorities}
                    currentBooking={currentBooking}
                    updateBooking={updateBooking}
                  />
                  {index < formContent.work_shifts.length - 1 && (
                    <Divider
                      sx={{
                        my: 3,
                        borderColor: isCircusMode
                          ? alpha('#d8b87a', 0.35)
                          : alpha(theme.palette.primary.main, 0.2),
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
          </List>
        </>
      )}
    </ThemedFormLayout>
  );
}

export default WorkShiftForm;
