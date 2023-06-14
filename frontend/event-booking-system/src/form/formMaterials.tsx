import {Booking, FormContent, Material} from "./interface";
import React from "react";
import {Checkbox, List, ListItem, ListItemAvatar, ListItemButton, ListItemText} from "@mui/material";
import {CircularProgressWithLabel} from "./components/circularProgressWithLabel";
import "../css/formMaterials.css";


export interface MaterialFormProps {
	updateMaterialIds: (material_ids: Array<number>) => void;
	currentBooking: Booking;
	formValidation: { [key in keyof Booking]?: string };
	formContent: FormContent;
}

function MaterialsForm(props: MaterialFormProps) {

	function handleToggle(material_id: number) {
		if (props.currentBooking.material_ids.indexOf(material_id) === -1) {
			props.updateMaterialIds([...props.currentBooking.material_ids, material_id]);
		} else {
			props.updateMaterialIds(props.currentBooking.material_ids.filter((id) => id !== material_id));
		}

	}

	return  <List dense sx={{}} className={'material-list'}>
      {props.formContent.materials.map((material: Material) => {
        const labelId = `checkbox-list-secondary-label-${material.id}`;
        return (
          <ListItem
            key={material.id}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={() => handleToggle(material.id)}
                checked={props.currentBooking.material_ids.indexOf(material.id) !== -1}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            }
            disablePadding
          >
            <ListItemButton onClick={() => handleToggle(material.id)}>
              <ListItemAvatar>
				  <CircularProgressWithLabel valueCurrent={material.num_booked} valueMax={material.num_needed}/>
              </ListItemAvatar>
              <ListItemText id={labelId} primary={material.title} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
}

export default MaterialsForm;