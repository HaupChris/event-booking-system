import {Booking, FormContent, Material} from "./interface";
import React from "react";
import {Checkbox, List, ListItem, ListItemAvatar, ListItemButton, ListItemText} from "@mui/material";
import {CircularProgressWithLabel} from "../components/circularProgressWithLabel";
import "../../css/formMaterials.css";


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
      {props.formContent.materials
		  .filter((material) => material.num_needed > material.num_booked || props.currentBooking.material_ids.includes(material.id))
		  .sort((a, b) => (b.num_needed -b.num_booked) - (a.num_needed - a.num_booked) )
		  .map((material: Material) => {
        const labelId = `checkbox-list-secondary-label-${material.id}`;
		const num_booked = material.num_booked + (props.currentBooking.material_ids.includes(material.id) ? 1 : 0);

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
				  <CircularProgressWithLabel valueCurrent={num_booked} valueMax={material.num_needed}/>
              </ListItemAvatar>
              <ListItemText id={labelId} primary={material.title} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
}

export default MaterialsForm;