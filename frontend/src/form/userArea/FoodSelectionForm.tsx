import React from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import {userAreaTexts} from "../constants/texts";
import FoodSelectionFormBase from "../../components/core/forms/FoodSelectionFormBase";

import gyros from '../../img/gyros.png';
import wraps from '../../img/wraps.png';
import vegan_diet from '../../img/both_meals_vegan.png';
import vegetarian_diet from '../../img/both_meals_vegetarian.png';

function FoodSelectionForm(props: FormProps) {
    const foodImages = {
        0: gyros,
        1: gyros,
        2: wraps,
        3: wraps,
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