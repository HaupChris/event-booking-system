import React from 'react';
import type { ArtistFormProps } from './ArtistRegistrationFormContainer';
import { artistAreaTexts } from '../constants/texts';
import PersonalDetailsFormBase from '../../components/core/forms/PersonalDetailsFormBase';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

function ArtistPersonalDetailsForm(props: ArtistFormProps) {
  return (
    <PersonalDetailsFormBase
      updateBooking={props.updateBooking}
      currentBooking={props.currentBooking}
      formValidation={props.formValidation}
      texts={artistAreaTexts.personalDetailsForm}
      icon={<MusicNoteIcon />}
      formContent={props.formContent}
      onDevSeedForm={props.onDevSeedForm}
    />
  );
}

export default ArtistPersonalDetailsForm;
