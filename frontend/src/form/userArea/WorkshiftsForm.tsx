import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FormProps } from './UserRegistrationFormContainer';
import WorkShift from '../../components/core/inputs/workShift';
import type { WorkShift as WorkShiftType } from '../userArea/interface';
import { Box, Divider, List, Typography, alpha, useTheme } from '@mui/material';
import { Engineering, PersonAdd } from '@mui/icons-material';
import { PRIORITIES } from './constants';

import '../../css/workShift.css';

import type { TimeSlot } from './interface';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';
import FormField from '../../components/core/inputs/FormField';
import WWSelect from '../../components/core/inputs/WWSelect';
import WWFAQ from '../../components/core/display/WWFAQ';
import { userAreaTexts } from '../constants/texts';

function HelpIcon() {
  return null;
}

function WorkShiftForm(props: FormProps) {
  const theme = useTheme();
  const { currentBooking, updateBooking, formValidation, formContent } = props;
  // availablePriorities is computed via useMemo below

  const [supporterBuddyFirstName, setSupporterBuddyFirstName] = useState(
    currentBooking.supporter_buddy.split(' ')[0]
  );
  const [supporterBuddyLastName, setSupporterBuddyLastName] = useState(
    currentBooking.supporter_buddy.split(' ')[1] || ''
  );

  const numberOfShiftsOptions = [
    { value: 1, label: '1 Schicht' },
    { value: 2, label: '2 Schichten (1 Essen gratis)' },
    { value: 3, label: '3 Schichten (2 Essen gratis)' },
  ];

  const updateBookingRef = useRef(updateBooking);
  updateBookingRef.current = updateBooking;

  useEffect(() => {
    updateBookingRef.current(
      'supporter_buddy',
      supporterBuddyFirstName + ' ' + supporterBuddyLastName
    );
  }, [supporterBuddyFirstName, supporterBuddyLastName]);

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

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.workshiftsForm.missionBriefing}
      footerId={userAreaTexts.workshiftsForm.footerId}
    >
      <WWFAQ items={faqItems} title="" description="" icon={<HelpIcon />} sx={{ mb: 3 }} />
      <FormCard
        icon={<Engineering sx={{ color: theme.palette.primary.main, mr: 1 }} />}
        title={userAreaTexts.workshiftsForm.shiftsCountTitle}
        description={userAreaTexts.workshiftsForm.shiftsCountHelperText}
        // tooltipText={userAreaTexts.workshiftsForm.shiftsCountHelperText}
        tooltipPlacement={'top-start'}
      >
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingX: 2 }}>
          <WWSelect
            options={numberOfShiftsOptions}
            value={currentBooking.amount_shifts}
            onChange={updateAmountShifts}
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.5),
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                },
              },
            }}
          />
        </Box>
      </FormCard>
      <FormCard
        title={userAreaTexts.workshiftsForm.crewPartner}
        description={userAreaTexts.workshiftsForm.crewPartnerDescription}
        icon={<PersonAdd sx={{ color: theme.palette.primary.main, mr: 1 }} />}
        sx={{ marginTop: 3, marginBottom: 3 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            marginX: 2,
            gap: 2,
          }}
        >
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
            id="first_name"
            label="Nachname"
            name="first_name"
            value={supporterBuddyLastName}
            onChange={(e) => setSupporterBuddyLastName(e.target.value)}
          />
        </Box>
      </FormCard>

      {/* Available Shifts Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          mt: 4,
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          pb: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 'medium',
          }}
        >
          Verfügbare Schichten
        </Typography>
      </Box>

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
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  }}
                />
              )}
            </React.Fragment>
          ))}
      </List>
    </ThemedFormLayout>
  );
}

export default WorkShiftForm;
