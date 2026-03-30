import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import EuroIcon from '@mui/icons-material/Euro';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import type { Booking, FormContent, TimeSlot, WorkShift } from './interface';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';
import { userAreaTexts } from '../constants/texts';
import { getDiscountUser } from '../../components/core/utils/Pricing';
import {
  PriceItem,
  SummaryPersonalCard,
  SummaryProfessionsCard,
  SummaryCateringCard,
  SummaryWorkShiftsCard,
  SummaryMaterialsCard,
} from './summary';
import '../../css/formSummary.css';

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
  return array.find((item) => item.id === id);
}

function getShiftAndTimeslot(workShifts: WorkShift[], timeslotId: number) {
  const shift = workShifts.find((s) =>
    s.time_slots.find((slot: TimeSlot) => slot.id === timeslotId)
  );
  const timeslot = shift?.time_slots.find((slot) => slot.id === timeslotId);
  return { shift, timeslot };
}

interface SummaryFormProps {
  currentBooking: Booking;
  formContent: FormContent;
}

function SummaryForm({ currentBooking, formContent }: SummaryFormProps) {
  const theme = useTheme();

  const ticket = findItemById(formContent.ticket_options, currentBooking.ticket_id);
  const beverage = findItemById(formContent.beverage_options, currentBooking.beverage_id);
  const food = findItemById(formContent.food_options, currentBooking.food_id);
  const shiftSlot1 = getShiftAndTimeslot(
    formContent.work_shifts,
    currentBooking.timeslot_priority_1
  );
  const shiftSlot2 = getShiftAndTimeslot(
    formContent.work_shifts,
    currentBooking.timeslot_priority_2
  );
  const shiftSlot3 = getShiftAndTimeslot(
    formContent.work_shifts,
    currentBooking.timeslot_priority_3
  );
  const materials = currentBooking.material_ids.map((id) =>
    findItemById(formContent.materials, id)
  );
  const discount = getDiscountUser(currentBooking, formContent);

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.summaryForm.missionBriefing}
      footerId={userAreaTexts.summaryForm.footerId}
      title={userAreaTexts.summaryForm.title}
    >
      {/* Price Overview */}
      <FormCard
        title={userAreaTexts.summaryForm.missionContribution}
        icon={<EuroIcon />}
        selected={true}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
            {currentBooking.total_price}€
          </Typography>
        </Box>
      </FormCard>

      <SummaryPersonalCard
        firstName={currentBooking.first_name}
        lastName={currentBooking.last_name}
        email={currentBooking.email}
        phone={currentBooking.phone}
      />

      <SummaryProfessionsCard
        professionIds={currentBooking.profession_ids}
        professions={formContent.professions}
      />

      {/* Ticket Information */}
      <FormCard
        title={userAreaTexts.summaryForm.participationOption}
        icon={<ConfirmationNumberIcon />}
      >
        <PriceItem item={ticket} />
      </FormCard>

      <SummaryCateringCard beverage={beverage} food={food} discount={discount} />

      <SummaryWorkShiftsCard
        shiftSlot1={shiftSlot1}
        shiftSlot2={shiftSlot2}
        shiftSlot3={shiftSlot3}
        supporterBuddy={currentBooking.supporter_buddy}
        amountShifts={currentBooking.amount_shifts}
      />

      <SummaryMaterialsCard materials={materials} />
    </ThemedFormLayout>
  );
}

export default SummaryForm;
