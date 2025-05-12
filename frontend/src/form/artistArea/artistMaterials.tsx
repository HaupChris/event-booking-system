import React from "react";
import {ArtistFormProps} from "./ArtistRegistrationFormContainer";
import {artistAreaTexts} from "../constants/texts";
import MaterialsFormBase from "../../components/core/forms/MaterialsFormBase";

function ArtistMaterialsForm(props: ArtistFormProps) {
    return <MaterialsFormBase
        currentBooking={props.currentBooking}
        updateBooking={props.updateBooking}
        formContent={{ materials: props.formContent.artist_materials }}
        texts={artistAreaTexts.materialsForm}
        materialsPropName="artist_material_ids"
    />;
}

export default ArtistMaterialsForm;