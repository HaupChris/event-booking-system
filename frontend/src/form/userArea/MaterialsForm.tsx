import React from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import {userAreaTexts} from "../constants/texts";
import MaterialsFormBase from "../../components/core/forms/MaterialsFormBase";

function MaterialsForm(props: FormProps) {
    return <MaterialsFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={props.formContent}
        texts={userAreaTexts.materialsForm}
    />;
}

export default MaterialsForm;