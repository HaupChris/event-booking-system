// src/form/userArea/FoodSelectionForm.tsx (updated)
import React from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import {userAreaTexts} from "../constants/texts";
import FoodSelectionFormBase from "../../components/core/forms/FoodSelectionFormBase";

import gyros from '../../img/gyros.png';
import grillgemuese from '../../img/grillgemuese.png';
import vegan_diet from '../../img/vegan_diet.png';
import vegetarian_diet from '../../img/vegetarian_diet.png';

function FoodSelectionForm(props: FormProps) {
    const foodImages = {
        0: gyros,
        1: gyros,
        2: grillgemuese,
        3: grillgemuese,
        4: vegan_diet,
        5: vegetarian_diet
    };

    return <FoodSelectionFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={props.formContent}
        texts={userAreaTexts.foodSelectionForm}
        images={foodImages}
    />;
}

export default FoodSelectionForm;