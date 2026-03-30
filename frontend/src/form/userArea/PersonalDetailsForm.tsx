import React from 'react';
import type { FormProps } from './UserRegistrationFormContainer';
import { userAreaTexts } from '../constants/texts';
import PersonalDetailsFormBase from '../../components/core/forms/PersonalDetailsFormBase';

function PersonalDetailsForm(props: FormProps) {
  return (
    <PersonalDetailsFormBase
      updateBooking={props.updateBooking}
      currentBooking={props.currentBooking}
      formValidation={props.formValidation}
      texts={userAreaTexts.personalDetailsForm}
      formContent={props.formContent}
    />
  );
}

export default PersonalDetailsForm;
