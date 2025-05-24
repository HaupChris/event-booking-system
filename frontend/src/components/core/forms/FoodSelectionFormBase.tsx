import React from "react";
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Typography,
    alpha
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SpacePanelLayout from "../layouts/SpacePanelLayout";
import FormCard from "../display/FormCard";
import SelectionOptionWithImage from "../display/SelectionOptionWithImage";
import {FoodOption} from "../../../form/userArea/interface";


interface FoodSelectionTextProps {
    missionBriefing: string;
    footerId: string;
    title: string;
    noFood: string;
}

interface FoodSelectionFormBaseProps {
    currentBooking: {
        food_id: number;
    };
    updateBooking: (key: any, value: any) => void;
    formContent: {
        food_options: FoodOption[];
    };
    texts: FoodSelectionTextProps;
    images: {[key: number]: string};
}

function FoodSelectionFormBase(props: FoodSelectionFormBaseProps) {
    const { texts, images } = props;

    // Function to handle food selection
    const handleFoodSelect = (id: number) => () => {
        props.updateBooking('food_id', id);
    };

    return <SpacePanelLayout
        missionBriefing={texts.missionBriefing}
        footerId={texts.footerId}
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
                                          {texts.noFood}
                                     </Typography>
                                 }
                             />
                         </ListItemButton>
                     </FormCard>
             {props.formContent.food_options.map((option) => {
                        const isSelected = props.currentBooking.food_id === option.id;

                        return <SelectionOptionWithImage
                            key={option.id}
                            selected={isSelected}
                            onClick={handleFoodSelect(option.id)}
                            title={option.title}
                            price={option.price}
                            description={option.description}
                            imageSource={images[option.id] || ''}
                        />
             })}
         </List>
    </SpacePanelLayout>
}

export default FoodSelectionFormBase;