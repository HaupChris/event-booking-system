import React from "react";
import {ArtistFormProps} from "./ArtistRegistrationFormContainer";
import {artistAreaTexts} from "../constants/texts";
import FoodSelectionFormBase from "../../components/core/forms/FoodSelectionFormBase";
import {foodImages} from "../../constants/foodImages";

function ArtistFoodSelectionForm(props: ArtistFormProps) {
    return <FoodSelectionFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={props.formContent}
        texts={artistAreaTexts.foodSelectionForm}
        images={foodImages}
    />;
}

export default ArtistFoodSelectionForm;