import React from 'react';
import type { FormProps } from './UserRegistrationFormContainer';
import { userAreaTexts } from '../constants/texts';
import { getStepDescription } from '../utils/stepDescription';
import FoodSelectionFormBase from '../../components/core/forms/FoodSelectionFormBase';
import { foodImages } from '../../constants/foodImages';

function FoodSelectionForm(props: FormProps) {
  const texts = {
    ...userAreaTexts.foodSelectionForm,
    missionBriefing: getStepDescription(
      props.formContent.step_descriptions,
      'food',
      userAreaTexts.foodSelectionForm.missionBriefing
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

export default FoodSelectionForm;
