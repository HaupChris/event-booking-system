import React from "react";
import {ArtistFormProps} from "./ArtistRegistrationFormContainer";
import {artistAreaTexts} from "../constants/texts";
import FoodSelectionFormBase from "../../components/core/forms/FoodSelectionFormBase";

import gyros from '../../img/gyros.png';
import wraps from '../../img/wraps.png';
import vegan_diet from '../../img/both_meals_vegan.png';
import vegetarian_diet from '../../img/both_meals_vegetarian.png';

function ArtistFoodSelectionForm(props: ArtistFormProps) {
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
        texts={artistAreaTexts.foodSelectionForm}
        images={foodImages}
    />;
}

export default ArtistFoodSelectionForm;