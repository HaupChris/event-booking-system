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
import LocalBarIcon from '@mui/icons-material/LocalBar';

// Import images
import beverages_0 from '../../img/beverages_1.jpg';
import beverages_1 from '../../img/beverages_2.jpg';
import beverages_2 from '../../img/beverages_3.jpg';

import '../../css/formBeverageSelection.css';
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";
import FormCard from "../../components/core/display/FormCard";
import SelectionOptionWithImage from "../../components/core/display/SelectionOptionWithImage";


function BeverageSelectionForm(props: FormProps) {
    // Function to handle beverage selection
    const handleBeverageSelect = (id: number) => () => {
        props.updateBooking('beverage_id', id);
    };

    const getImageSource = (beverage_id: number) => {
        if (beverage_id === 0) {
            return beverages_0
        }
        if (beverage_id === 1) {
            return beverages_1;
        }
        if (beverage_id === 2) {
            return beverages_2;
        }
        return "";
    }

    return <SpacePanelLayout
        missionBriefing="Auf dem Festival steht eine frei zugängliche Zapfanlage, an der du dich für den gewählten Zeitraum bedienen kannst."
        footerId="WWWW-BEVERAGE-STATION // ID-2025"
    >
        <List sx={{p: {xs: 1, sm: 2}}}>
            <FormCard selected={props.currentBooking.beverage_id === -1}>
                <ListItemButton
                    onClick={handleBeverageSelect(-1)}
                    sx={{
                        py: 1.5,
                        px: {xs: 2, sm: 3},
                        '&:hover': {
                            backgroundColor: alpha('#1e88e5', 0.1),
                        }
                    }}
                >
                    <ListItemAvatar sx={{minWidth: {xs: 36, sm: 40}}}>
                        <LocalBarIcon
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
                                Kein Bier für mich
                            </Typography>
                        }
                    />
                </ListItemButton>
            </FormCard>


            {props.formContent.beverage_options.map((option) => {
                const isSelected = props.currentBooking.beverage_id === option.id;

                return (
                    <SelectionOptionWithImage selected={isSelected}
                                              onClick={handleBeverageSelect(option.id)}
                                              title={option.title}
                                              description={option.description}
                                              imageSource={getImageSource(option.id)}
                                              price={option.price}
                    />
                );
            })}
        </List>
    </SpacePanelLayout>


}

export default BeverageSelectionForm;