import React from "react";
import {ArtistFormProps} from "./ArtistRegistrationFormContainer";
import {artistAreaTexts} from "../constants/texts";
import BeverageSelectionFormBase from "../../components/core/forms/BeverageSelectionFormBase";

import beverages_0 from '../../img/beverages_1.jpg';
import beverages_1 from '../../img/beverages_2.jpg';
import beverages_2 from '../../img/beverages_3.jpg';

function ArtistBeverageSelectionForm(props: ArtistFormProps) {
    const getImageSource = (beverage_id: number) => {
        if (beverage_id === 0) return beverages_0;
        if (beverage_id === 1) return beverages_1;
        if (beverage_id === 2) return beverages_2;
        return "";
    };

    return <BeverageSelectionFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={props.formContent}
        texts={artistAreaTexts.beverageSelectionForm}
        getImageSource={getImageSource}
    />;
}

export default ArtistBeverageSelectionForm;