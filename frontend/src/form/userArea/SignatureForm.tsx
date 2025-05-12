import React from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import {userAreaTexts} from "../constants/texts";
import SignatureFormBase from "../../components/core/forms/SignatureFormBase";

function SignatureForm(props: FormProps) {
    return <SignatureFormBase
        updateBooking={props.updateBooking}
        currentBooking={props.currentBooking}
        formValidation={props.formValidation}
        texts={userAreaTexts.signatureForm}
    />;
}

export default SignatureForm;