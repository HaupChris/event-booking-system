import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import TicketSelectionFormBase from '../../components/core/forms/TicketSelectionFormBase';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';
import MissionHeading from '../../components/core/display/MissionHeading';
import WWSelect from '../../components/core/inputs/WWSelect';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const formatPrice = (price: number): string => {
  if (price <= 0) {
    return 'kostenlos';
  }
  return `${price.toFixed(2)}€`;
};

function ArtistBandTicketSelectionForm(props: ArtistFormProps) {
  const bandMembers = props.currentBooking.band_members ?? [];
  const ticketOptions = props.formContent.ticket_options.map((option) => ({
    value: option.id,
    label: `${option.title} - ${formatPrice(option.price)}${option.amount > 0 ? ` - max ${option.amount}` : ''}`,
  }));

  const updateBandMemberTicket = (memberId: string, ticketId: number) => {
    props.updateBooking(
      'band_members',
      bandMembers.map((member) =>
        member.id === memberId ? { ...member, ticket_id: ticketId } : member
      )
    );
  };

  return (
    <ThemedFormLayout
      missionBriefing={artistAreaTexts.ticketSelectionForm.missionBriefing}
      footerId={artistAreaTexts.ticketSelectionForm.footerId}
    >
      <FormCard>
        <MissionHeading
          title="Tickets pro Person"
          subtitle="Bitte waehle fuer jedes Bandmitglied ein Ticket."
          icon={<ConfirmationNumberIcon />}
          withDivider={true}
        />

        <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Hauptansprechperson: {props.currentBooking.first_name}{' '}
              {props.currentBooking.last_name}
            </Typography>
            <WWSelect
              options={ticketOptions}
              value={props.currentBooking.ticket_id >= 0 ? props.currentBooking.ticket_id : null}
              onChange={(value) =>
                props.updateBooking('ticket_id', value === null ? -1 : Number(value))
              }
              placeholder="Ticket auswaehlen"
              isFullWidth={true}
              minWidth="100%"
            />
          </Box>

          {bandMembers.map((member, index) => (
            <Box key={member.id}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Bandmitglied {index + 1}: {member.first_name || 'Vorname'}{' '}
                {member.last_name || 'Nachname'}
              </Typography>
              <WWSelect
                options={ticketOptions}
                value={member.ticket_id >= 0 ? member.ticket_id : null}
                onChange={(value) =>
                  updateBandMemberTicket(member.id, value === null ? -1 : Number(value))
                }
                placeholder="Ticket auswaehlen"
                isFullWidth={true}
                minWidth="100%"
              />
            </Box>
          ))}
        </Box>
      </FormCard>
    </ThemedFormLayout>
  );
}

function ArtistTicketSelectionForm(props: ArtistFormProps) {
  if (props.currentBooking.artist_type === 'band') {
    return <ArtistBandTicketSelectionForm {...props} />;
  }

  return (
    <TicketSelectionFormBase
      currentBooking={props.currentBooking}
      updateBooking={props.updateBooking}
      formContent={props.formContent}
      formValidation={props.formValidation}
      texts={artistAreaTexts.ticketSelectionForm}
    />
  );
}

export default ArtistTicketSelectionForm;
