import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import { getStepDescription } from '../utils/stepDescription';
import BeverageSelectionFormBase from '../../components/core/forms/BeverageSelectionFormBase';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../components/core/display/FormCard';
import MissionHeading from '../../components/core/display/MissionHeading';
import WWSelect from '../../components/core/inputs/WWSelect';
import LocalBarIcon from '@mui/icons-material/LocalBar';

import beverages_0 from '../../img/beverages_1.jpg';
import beverages_1 from '../../img/beverages_2.jpg';
import beverages_2 from '../../img/beverages_3.jpg';

const formatPrice = (price: number): string => {
  if (price <= 0) {
    return 'kostenlos';
  }
  return `${price.toFixed(2)}€`;
};

function ArtistBandBeverageSelectionForm(props: ArtistFormProps) {
  const bandMembers = props.currentBooking.band_members ?? [];
  const missionBriefing = getStepDescription(
    props.formContent.step_descriptions,
    'beverage',
    artistAreaTexts.beverageSelectionForm.missionBriefing
  );
  const beverageOptions = [
    { value: -1, label: artistAreaTexts.beverageSelectionForm.noBeverage },
    ...props.formContent.beverage_options.map((option) => ({
      value: option.id,
      label: `${option.title} - ${option.description} - ${formatPrice(option.price)}`,
    })),
  ];

  const updateBandMemberBeverage = (memberId: string, beverageId: number) => {
    props.updateBooking(
      'band_members',
      bandMembers.map((member) =>
        member.id === memberId ? { ...member, beverage_id: beverageId } : member
      )
    );
  };

  return (
    <ThemedFormLayout
      missionBriefing={missionBriefing}
      footerId={artistAreaTexts.beverageSelectionForm.footerId}
    >
      <FormCard>
        <MissionHeading
          title="Getraenke pro Person"
          subtitle="Bitte waehle fuer jede Person die Getraenkeoption."
          icon={<LocalBarIcon />}
          withDivider={true}
        />

        <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Hauptansprechperson: {props.currentBooking.first_name}{' '}
              {props.currentBooking.last_name}
            </Typography>
            <WWSelect
              options={beverageOptions}
              value={props.currentBooking.beverage_id}
              onChange={(value) =>
                props.updateBooking('beverage_id', value === null ? -1 : Number(value))
              }
              placeholder="Getraenkeoption auswaehlen"
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
                options={beverageOptions}
                value={member.beverage_id}
                onChange={(value) =>
                  updateBandMemberBeverage(member.id, value === null ? -1 : Number(value))
                }
                placeholder="Getraenkeoption auswaehlen"
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

function ArtistBeverageSelectionForm(props: ArtistFormProps) {
  if (props.currentBooking.artist_type === 'band') {
    return <ArtistBandBeverageSelectionForm {...props} />;
  }

  const texts = {
    ...artistAreaTexts.beverageSelectionForm,
    missionBriefing: getStepDescription(
      props.formContent.step_descriptions,
      'beverage',
      artistAreaTexts.beverageSelectionForm.missionBriefing
    ),
  };

  const getImageSource = (beverage_id: number) => {
    if (beverage_id === 0) return beverages_0;
    if (beverage_id === 1) return beverages_1;
    if (beverage_id === 2) return beverages_2;
    return '';
  };

  return (
    <BeverageSelectionFormBase
      currentBooking={props.currentBooking}
      updateBooking={props.updateBooking}
      formContent={props.formContent}
      texts={texts}
      getImageSource={getImageSource}
    />
  );
}

export default ArtistBeverageSelectionForm;
