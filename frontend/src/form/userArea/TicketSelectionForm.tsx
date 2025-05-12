import React from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import {userAreaTexts} from "../constants/texts";
import TicketSelectionFormBase from "../../components/core/forms/TicketSelectionFormBase";

function TicketSelectionForm(props: FormProps) {
    return <TicketSelectionFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={props.formContent}
        formValidation={props.formValidation}
        texts={userAreaTexts.ticketSelectionForm}
    />;
}

export default TicketSelectionForm;