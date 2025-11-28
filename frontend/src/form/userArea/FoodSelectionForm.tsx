import React from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import {userAreaTexts} from "../constants/texts";
import FoodSelectionFormBase from "../../components/core/forms/FoodSelectionFormBase";
import {foodImages} from "../../constants/foodImages";

function FoodSelectionForm(props: FormProps) {
    return <FoodSelectionFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={props.formContent}
        texts={userAreaTexts.foodSelectionForm}
        images={foodImages}
    />;
}

export default FoodSelectionForm;