import React from 'react';
import type { FormProps } from './UserRegistrationFormContainer';
import { userAreaTexts } from '../constants/texts';
import { getStepDescription } from '../utils/stepDescription';
import MaterialsFormBase from '../../components/core/forms/MaterialsFormBase';

function MaterialsForm(props: FormProps) {
  const texts = {
    ...userAreaTexts.materialsForm,
    missionBriefing: getStepDescription(
      props.formContent.step_descriptions,
      'material',
      userAreaTexts.materialsForm.missionBriefing
    ),
  };

  return (
    <MaterialsFormBase<'material_ids'>
      currentBooking={props.currentBooking}
      updateBooking={(key, value) => props.updateBooking(key, value)}
      formContent={props.formContent}
      texts={texts}
    />
  );
}

export default MaterialsForm;
