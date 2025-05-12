import React from "react";
import {ArtistFormProps} from "./ArtistRegistrationFormContainer";
import {artistAreaTexts} from "../constants/texts";
import FoodSelectionFormBase from "../../components/core/forms/FoodSelectionFormBase";

import gyros from '../../img/gyros.png';
import grillgemuese from '../../img/grillgemuese.png';

function ArtistFoodSelectionForm(props: ArtistFormProps) {
    const foodImages = {
        0: gyros,
        1: grillgemuese
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