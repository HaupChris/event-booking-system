import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import {FormProps} from "./formContainer";

// import image from the image folder
import beverages_0 from '../img/beverages_1.jpg';
import beverages_1 from '../img/beverages_2.jpg';
import beverages_2 from '../img/beverages_3.jpg';
import portholeImage from '../img/porthole_transparent.png';

import '../css/formBeverageSelection.css';


function FoodForm(props: FormProps) {
    // Function to handle beverage selection
    const handleFoodSelect = (id: number) => () => {
        props.updateBooking('food_id', id);
    };

    return (
        <div>
            <Typography variant="body1" sx={{mb: 2, mt: 2}}>
                Auf dem Festival steht eine frei zugängliche Zapfanlage, an der du dich für gewählten Zeitraum so oft du
                willst bedienen kannst.
            </Typography>

            <List dense sx={{width: '100%'}}>
                <ListItem disablePadding sx={{
                    border: props.currentBooking.food_id === -1 ? '4px solid' : '',
                    borderRadius: '8px',
                    mb: 1
                }}>
                    <ListItemButton onClick={handleFoodSelect(-1)}>
                        <ListItemText primary="Kein Essen für mich"/>
                    </ListItemButton>
                </ListItem>
                {props.formContent.food_options.map((option) => {
                    return (
                        <ListItem
                            sx={{
                                border: props.currentBooking.food_id === option.id ? '4px solid ' : '',
                                borderRadius: '8px',
                                mb: 1
                            }}
                            key={option.id}
                            disablePadding

                        >
                            <ListItemButton onClick={handleFoodSelect(option.id)}>
                                <ListItemAvatar>
                                    <div className="avatar-container"> {/* New container */}
                                        <Avatar alt={option.title}
                                                src={option.id === 1 ? beverages_1 : option.id === 2 ? beverages_2 : beverages_0}
                                                sx={{width: '4em', height: '4em', marginRight: '1.5em'}}
                                        />
                                        <img src={portholeImage} className="porthole-image"/> {/* Porthole */}
                                    </div>
                                </ListItemAvatar>


                                <ListItemText
                                    primary={option.title}
                                    primaryTypographyProps={{variant: 'h5'}}
                                    secondary={option.price + "€"}
                                    secondaryTypographyProps={{variant: 'h6'}}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}

export default FoodForm;
