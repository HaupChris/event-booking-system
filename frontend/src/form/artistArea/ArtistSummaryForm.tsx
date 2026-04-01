/* eslint-disable complexity */
import React from 'react';
import { Typography, Box, alpha, Divider, useTheme } from '@mui/material';
import type { ArtistBooking, ArtistFormContent, ArtistMaterial } from './interface';
import { artistAreaTexts } from '../constants/texts';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BackpackIcon from '@mui/icons-material/Backpack';
import SettingsIcon from '@mui/icons-material/Settings';
import EuroIcon from '@mui/icons-material/Euro';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InfoPair from '../../components/core/display/InfoPair';
import FormCard from '../../components/core/display/FormCard';
import WorkIcon from '@mui/icons-material/Work';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
  return array.find((item) => item.id === id);
}

interface ArtistSummaryProps {
  currentBooking: ArtistBooking;
  formContent: ArtistFormContent;
}

interface PerformanceDetails {
  preferredDay?: string;
  preferredTime?: string;
  duration?: string | number;
  genre?: string;
  description?: string;
  bandMembers?: string | number;
}

const getTicketLabel = (formContent: ArtistFormContent, value: number): string => {
  const option = findItemById(formContent.ticket_options, value);
  return option ? option.title : 'Nicht ausgewaehlt';
};

const getBeverageLabel = (formContent: ArtistFormContent, value: number): string => {
  if (value < 0) {
    return 'Kein Getraenk';
  }
  const option = findItemById(formContent.beverage_options, value);
  return option ? option.title : 'Nicht ausgewaehlt';
};

const getFoodLabel = (formContent: ArtistFormContent, value: number): string => {
  if (value < 0) {
    return 'Kein Essen';
  }
  const option = findItemById(formContent.food_options, value);
  return option ? option.title : 'Nicht ausgewaehlt';
};

function ArtistSummaryForm({ currentBooking, formContent }: ArtistSummaryProps) {
  const theme = useTheme();
  const {
    first_name,
    last_name,
    email,
    phone,
    ticket_id,
    beverage_id,
    food_id,
    equipment,
    special_requests,
    performance_details,
    artist_material_ids,
    total_price,
  } = currentBooking;

  const ticket = findItemById(formContent.ticket_options, ticket_id);
  const beverage = findItemById(formContent.beverage_options, beverage_id);
  const food = findItemById(formContent.food_options, food_id);
  const bandMembers = currentBooking.band_members ?? [];
  const isBand = currentBooking.artist_type === 'band';

  let parsedPerformanceDetails: PerformanceDetails = {};
  try {
    if (performance_details) {
      parsedPerformanceDetails = JSON.parse(performance_details);
    }
  } catch (e) {
    // ignore parse errors
  }

  const artistMaterials = artist_material_ids
    ?.map((id) => findItemById(formContent.artist_materials || [], id))
    .filter(Boolean) as ArtistMaterial[];

  return (
    <ThemedFormLayout
      missionBriefing={artistAreaTexts.summaryForm.missionBriefing}
      footerId={artistAreaTexts.summaryForm.footerId}
    >
      <FormCard
        title={artistAreaTexts.summaryForm.artistContribution}
        icon={<EuroIcon />}
        selected={true}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
            {total_price}€
          </Typography>
        </Box>
      </FormCard>

      <FormCard title={artistAreaTexts.summaryForm.personalData} icon={<PersonIcon />}>
        <Box sx={{ px: 2 }}>
          <InfoPair label="Vorname" value={first_name} />
          <InfoPair label="Nachname" value={last_name} />
          <InfoPair label="Email" value={email} />
          <InfoPair label="Telefon" value={phone} />
          {isBand && (
            <InfoPair
              label="Act"
              value={
                currentBooking.band_name?.trim() || `Band (${bandMembers.length + 1} Personen)`
              }
            />
          )}
        </Box>
      </FormCard>

      {isBand && bandMembers.length > 0 && (
        <FormCard title="Bandmitglieder" icon={<GroupsIcon />}>
          <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <InfoPair
              label="Hauptansprechperson"
              value={`${first_name} ${last_name} | Ticket: ${getTicketLabel(formContent, ticket_id)} | Getraenk: ${getBeverageLabel(formContent, beverage_id)} | Essen: ${getFoodLabel(formContent, food_id)}`}
            />
            {bandMembers.map((member, index) => (
              <InfoPair
                key={member.id}
                label={`Bandmitglied ${index + 1}`}
                value={`${member.first_name} ${member.last_name} (${member.email}) | Ticket: ${getTicketLabel(formContent, member.ticket_id)} | Getraenk: ${getBeverageLabel(formContent, member.beverage_id)} | Essen: ${getFoodLabel(formContent, member.food_id)}`}
              />
            ))}
          </Box>
        </FormCard>
      )}

      {currentBooking.profession_ids?.length > 0 ? (
        <FormCard title={artistAreaTexts.summaryForm.professionsTitle} icon={<WorkIcon />}>
          <Box sx={{ px: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 1.5,
                bgcolor: alpha(theme.palette.background.default, 0.2),
                borderRadius: '8px',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              {currentBooking.profession_ids.map((id) => {
                const profession = formContent.professions?.find((p) => p.id === id);
                return profession ? (
                  <Box
                    key={id}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      borderRadius: '4px',
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      {profession.title}
                    </Typography>
                  </Box>
                ) : null;
              })}
            </Box>
          </Box>
        </FormCard>
      ) : null}

      <FormCard title={artistAreaTexts.summaryForm.performanceDetails} icon={<MusicNoteIcon />}>
        <Box sx={{ px: 2 }}>
          {parsedPerformanceDetails.preferredDay && (
            <InfoPair label="Bevorzugter Tag" value={parsedPerformanceDetails.preferredDay} />
          )}
          {parsedPerformanceDetails.preferredTime && (
            <InfoPair label="Bevorzugte Zeit" value={parsedPerformanceDetails.preferredTime} />
          )}
          {parsedPerformanceDetails.duration && (
            <InfoPair label="Set-Dauer" value={`${parsedPerformanceDetails.duration} Minuten`} />
          )}
          {parsedPerformanceDetails.genre && (
            <InfoPair label="Genre/Musikstil" value={parsedPerformanceDetails.genre} />
          )}
          {parsedPerformanceDetails.description && (
            <InfoPair label="Beschreibung" value={parsedPerformanceDetails.description} />
          )}
          {parsedPerformanceDetails.bandMembers && (
            <InfoPair label="Bandmitglieder" value={parsedPerformanceDetails.bandMembers} />
          )}
        </Box>
      </FormCard>

      <FormCard
        title={artistAreaTexts.summaryForm.participationOption}
        icon={<ConfirmationNumberIcon />}
      >
        <Box sx={{ px: 2 }}>
          <InfoPair
            label="Ticket"
            value={
              ticket
                ? `${ticket.title} (${ticket.price > 0 ? ticket.price + '€' : 'Kostenlos für Künstler'})`
                : 'Nicht ausgewählt'
            }
          />
        </Box>
      </FormCard>

      <FormCard title={artistAreaTexts.summaryForm.catering} icon={<RestaurantIcon />}>
        <Box sx={{ px: 2 }}>
          <InfoPair
            label={artistAreaTexts.summaryForm.beverageTitle}
            value={
              beverage
                ? `${beverage.title} (${beverage.price > 0 ? beverage.price + '€' : 'Kostenlos für Künstler'})`
                : 'Keine Getränkeoption'
            }
            icon={<LocalDrinkIcon />}
          />

          <Divider sx={{ my: 1.5, borderColor: alpha(theme.palette.primary.main, 0.2) }} />

          <InfoPair
            label={artistAreaTexts.summaryForm.foodTitle}
            value={
              food
                ? `${food.title} (${food.price > 0 ? food.price + '€' : 'Kostenlos für Künstler'})`
                : 'Keine Essensoption'
            }
            icon={<RestaurantIcon />}
          />
        </Box>
      </FormCard>

      <FormCard title={artistAreaTexts.summaryForm.technicalRequirements} icon={<SettingsIcon />}>
        <Box sx={{ px: 2 }}>
          <InfoPair label="Benötigte Ausrüstung" value={equipment || 'Keine angegeben'} />

          {special_requests && (
            <>
              <Divider sx={{ my: 1.5, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
              <InfoPair
                label={artistAreaTexts.summaryForm.specialRequests}
                value={special_requests}
              />
            </>
          )}
        </Box>
      </FormCard>

      {artistMaterials && artistMaterials.length > 0 && (
        <FormCard title={artistAreaTexts.summaryForm.equipment} icon={<BackpackIcon />}>
          <Box sx={{ px: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: alpha(theme.palette.text.primary, 0.8) }}
            >
              {artistAreaTexts.summaryForm.bringingItems}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 1.5,
                bgcolor: alpha(theme.palette.background.default, 0.2),
                borderRadius: '8px',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              {artistMaterials.map((material) => (
                <Box
                  key={material.id}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: '4px',
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                    {material.title}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </FormCard>
      )}
    </ThemedFormLayout>
  );
}

export default ArtistSummaryForm;
