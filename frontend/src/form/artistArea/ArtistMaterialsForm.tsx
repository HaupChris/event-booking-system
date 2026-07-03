import React from 'react';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import { getStepDescription } from '../utils/stepDescription';
import MaterialsFormBase from '../../components/core/forms/MaterialsFormBase';

function ArtistMaterialsForm(props: ArtistFormProps) {
  const texts = {
    ...artistAreaTexts.materialsForm,
    missionBriefing: getStepDescription(
      props.formContent.step_descriptions,
      'material',
      artistAreaTexts.materialsForm.missionBriefing
    ),
  };

  return (
    <MaterialsFormBase<'artist_material_ids'>
      currentBooking={props.currentBooking}
      updateBooking={(key, value) => props.updateBooking(key, value)}
      formContent={{ materials: props.formContent.artist_materials }}
      texts={texts}
      materialsPropName="artist_material_ids"
    />
  );
}

export default ArtistMaterialsForm;
