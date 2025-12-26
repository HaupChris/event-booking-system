import React from "react";
import type {ArtistFormProps} from "./ArtistRegistrationFormContainer";
import {artistAreaTexts} from "../constants/texts";
import SignatureFormBase from "../../components/core/forms/SignatureFormBase";

function ArtistSignatureForm(props: ArtistFormProps) {
    return <SignatureFormBase
        updateBooking={props.updateBooking}
        currentBooking={props.currentBooking}
        formValidation={props.formValidation}
        texts={artistAreaTexts.signatureForm}
    />;
}

export default ArtistSignatureForm;