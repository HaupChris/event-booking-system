import React from 'react';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import MaterialsFormBase from '../../components/core/forms/MaterialsFormBase';

function ArtistMaterialsForm(props: ArtistFormProps) {
  return (
    <MaterialsFormBase<'artist_material_ids'>
      currentBooking={props.currentBooking}
      updateBooking={(key, value) => props.updateBooking(key, value)}
      formContent={{ materials: props.formContent.artist_materials }}
      texts={artistAreaTexts.materialsForm}
      materialsPropName="artist_material_ids"
    />
  );
}

export default ArtistMaterialsForm;
