import React from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Typography,
    alpha
} from '@mui/material';
import {FormProps} from "./UserRegistrationFormContainer";
import RestaurantIcon from '@mui/icons-material/Restaurant';

import gyros from '../../img/gyros.png';
import grillgemuese from '../../img/grillgemuese.png';
import vegan_diet from '../../img/vegan_diet.png';
import vegetarian_diet from '../../img/vegetarian_diet.png';

import '../../css/formBeverageSelection.css';
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";
import FormCard from "../../components/core/display/FormCard";
import SelectionOptionWithImage from "../../components/core/display/SelectionOptionWithImage"; // Reusing the same CSS for consistency

const index_to_image = [gyros, gyros, grillgemuese, grillgemuese, vegan_diet, vegetarian_diet];

function FoodSelectionForm(props: FormProps) {
    // Function to handle food selection
    const handleFoodSelect = (id: number) => () => {
        props.updateBooking('food_id', id);
    };
    console.log(props.currentBooking.food_id);

    return <SpacePanelLayout
        missionBriefing="Bestell deine abendliche Astronautenkost bei uns vor. Wähle aus unseren galaktischen Spezialitäten!"
        footerId="WWWW-FOOD-STATION // ID-2025"
    >
         <List sx={{ p: { xs: 1, sm: 2 } }}>
                     <FormCard selected={props.currentBooking.food_id === -1}>
                         <ListItemButton
                             onClick={handleFoodSelect(-1)}
                             sx={{
                                 py: 1.5,
                                 px: { xs: 2, sm: 3 },
                                 '&:hover': {
                                     backgroundColor: alpha('#1e88e5', 0.1),
                                 }
                             }}
                         >
                             <ListItemAvatar sx={{ minWidth: { xs: 36, sm: 40 } }}>
                                 <RestaurantIcon
                                     sx={{
                                         color: alpha('#fff', 0.7),
                                         fontSize: '1.5rem',
                                     }}
                                 />
                             </ListItemAvatar>
                             <ListItemText
                                 primary={
                                     <Typography
                                         variant="body1"
                                         sx={{
                                             color: alpha('#fff', 0.9),
                                             fontWeight: 'medium'
                                         }}
                                     >
                                         Kein Essen für mich
                                     </Typography>
                                 }
                             />
                         </ListItemButton>
                     </FormCard>
             {props.formContent.food_options.map((option) => {
                        const isSelected = props.currentBooking.food_id === option.id;

                        return <SelectionOptionWithImage
                            selected={isSelected}
                            onClick={handleFoodSelect(option.id)}
                            title={option.title}
                            price={option.price}
                            description={option.description}
                            imageSource={index_to_image[option.id]}/>
             })}
         </List>
    </SpacePanelLayout>
}

export default FoodSelectionForm;