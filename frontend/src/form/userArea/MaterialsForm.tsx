import React from 'react';
import type { FormProps } from './UserRegistrationFormContainer';
import { userAreaTexts } from '../constants/texts';
import MaterialsFormBase from '../../components/core/forms/MaterialsFormBase';

function MaterialsForm(props: FormProps) {
  return (
    <MaterialsFormBase<'material_ids'>
      currentBooking={props.currentBooking}
      updateBooking={(key, value) => props.updateBooking(key, value)}
      formContent={props.formContent}
      texts={userAreaTexts.materialsForm}
    />
  );
}

export default MaterialsForm;
