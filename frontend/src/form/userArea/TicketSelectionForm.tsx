import React from 'react';
import type { FormProps } from './UserRegistrationFormContainer';
import { userAreaTexts } from '../constants/texts';
import { getStepDescription } from '../utils/stepDescription';
import TicketSelectionFormBase from '../../components/core/forms/TicketSelectionFormBase';

function TicketSelectionForm(props: FormProps) {
  const texts = {
    ...userAreaTexts.ticketSelectionForm,
    missionBriefing: getStepDescription(
      props.formContent.step_descriptions,
      'ticket',
      userAreaTexts.ticketSelectionForm.missionBriefing
    ),
  };

  return (
    <TicketSelectionFormBase
      currentBooking={props.currentBooking}
      updateBooking={props.updateBooking}
      formContent={props.formContent}
      formValidation={props.formValidation}
      texts={texts}
    />
  );
}

export default TicketSelectionForm;
