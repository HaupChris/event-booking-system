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
import gyros from '../../img/gyros.png';
import grillgemuese from '../../img/grillgemuese.png';
import vegan_diet from '../../img/vegan_diet.png';
import vegetarian_diet from '../../img/vegetarian_diet.png';

import portholeImage from '../../img/porthole_transparent.png';

import '../../css/formBeverageSelection.css';

const index_to_image = [gyros, gyros, grillgemuese, grillgemuese, vegan_diet, vegetarian_diet]


function FormFoodSelection(props: FormProps) {
    // Function to handle beverage selection
    const handleFoodSelect = (id: number) => () => {
        props.updateBooking('food_id', id);
    };

    return (
        <div>
            <Typography variant="body1" sx={{mb: 2, mt: 2}}>
                Dieses Jahr kannst du dein Essen bei uns vorbestellen. Es wird jeweils Freitag und Samstag Abend ein Gereicht geben.
                Wann es was gibt, werden wir noch über die WhatsApp Gruppe bekannt geben.
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
                                                src={index_to_image[option.id]}
                                                sx={{width: '4em', height: '4em', marginRight: '1.5em'}}
                                        />
                                        <img src={portholeImage} className="porthole-image"/> {/* Porthole */}
                                    </div>
                                </ListItemAvatar>


                                <ListItemText
                                    primary={option.title + " - " + option.price + "€"}
                                    primaryTypographyProps={{variant: 'h5'}}
                                    secondary={option.description}
                                    secondaryTypographyProps={{variant: 'subtitle1'}}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}

export default FormFoodSelection;
