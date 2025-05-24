import React from "react";
import {ArtistFormProps} from "./ArtistRegistrationFormContainer";
import {artistAreaTexts} from "../constants/texts";
import TicketSelectionFormBase from "../../components/core/forms/TicketSelectionFormBase";

function ArtistTicketSelectionForm(props: ArtistFormProps) {
    return <TicketSelectionFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={props.formContent}
        formValidation={props.formValidation}
        texts={artistAreaTexts.ticketSelectionForm}
    />;
}

export default ArtistTicketSelectionForm;