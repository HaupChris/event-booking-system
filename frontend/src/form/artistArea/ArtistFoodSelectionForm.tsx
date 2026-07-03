import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import { getStepDescription } from '../utils/stepDescription';
import FoodSelectionFormBase from '../../components/core/forms/FoodSelectionFormBase';
import { foodImages } from '../../constants/foodImages';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';
import MissionHeading from '../../components/core/display/MissionHeading';
import WWSelect from '../../components/core/inputs/WWSelect';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const formatPrice = (price: number): string => {
  if (price <= 0) {
    return 'kostenlos';
  }
  return `${price.toFixed(2)}€`;
};

const getDietType = (description: string): string => {
  const lowerDescription = description.toLowerCase();

  if (lowerDescription.includes('vegan')) {
    return 'vegan';
  }

  if (lowerDescription.includes('vegetar')) {
    return 'vegetarisch';
  }

  return 'nicht angegeben';
};

const parseFoodDescription = (description: string): { text: string; dietType: string } => {
  const [rawText = '', rawDiet = ''] = description.split('//').map((part) => part.trim());

  const normalizedDiet = rawDiet.toLowerCase();
  if (normalizedDiet.includes('vegan')) {
    return { text: rawText, dietType: 'vegan' };
  }

  if (normalizedDiet.includes('vegetar')) {
    return { text: rawText, dietType: 'vegetarisch' };
  }

  return {
    text: rawText || description,
    dietType: getDietType(description),
  };
};

function ArtistBandFoodSelectionForm(props: ArtistFormProps) {
  const bandMembers = props.currentBooking.band_members ?? [];
  const missionBriefing = getStepDescription(
    props.formContent.step_descriptions,
    'food',
    artistAreaTexts.foodSelectionForm.missionBriefing
  );
  const foodOptions = [
    { value: -1, label: artistAreaTexts.foodSelectionForm.noFood },
    ...props.formContent.food_options.map((option) => {
      const parsed = parseFoodDescription(option.description);
      return {
        value: option.id,
        label: `${option.title} - ${parsed.text} - ${parsed.dietType} - ${formatPrice(option.price)}`,
      };
    }),
  ];

  const updateBandMemberFood = (memberId: string, foodId: number) => {
    props.updateBooking(
      'band_members',
      bandMembers.map((member) =>
        member.id === memberId ? { ...member, food_id: foodId } : member
      )
    );
  };

  return (
    <ThemedFormLayout
      missionBriefing={missionBriefing}
      footerId={artistAreaTexts.foodSelectionForm.footerId}
    >
      <FormCard>
        <MissionHeading
          title="Essen pro Person"
          subtitle="Bitte waehle fuer jede Person eine Essensoption."
          icon={<RestaurantIcon />}
          withDivider={true}
        />

        <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Hauptansprechperson: {props.currentBooking.first_name}{' '}
              {props.currentBooking.last_name}
            </Typography>
            <WWSelect
              options={foodOptions}
              value={props.currentBooking.food_id}
              onChange={(value) =>
                props.updateBooking('food_id', value === null ? -1 : Number(value))
              }
              placeholder="Essensoption auswaehlen"
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
                options={foodOptions}
                value={member.food_id}
                onChange={(value) =>
                  updateBandMemberFood(member.id, value === null ? -1 : Number(value))
                }
                placeholder="Essensoption auswaehlen"
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

function ArtistFoodSelectionForm(props: ArtistFormProps) {
  if (props.currentBooking.artist_type === 'band') {
    return <ArtistBandFoodSelectionForm {...props} />;
  }

  const texts = {
    ...artistAreaTexts.foodSelectionForm,
    missionBriefing: getStepDescription(
      props.formContent.step_descriptions,
      'food',
      artistAreaTexts.foodSelectionForm.missionBriefing
    ),
  };

  return (
    <FoodSelectionFormBase
      currentBooking={props.currentBooking}
      updateBooking={props.updateBooking}
      formContent={props.formContent}
      texts={texts}
      images={foodImages}
    />
  );
}

export default ArtistFoodSelectionForm;
