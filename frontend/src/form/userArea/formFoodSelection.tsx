import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Box } from '@mui/material';
import { FormProps } from "./formContainer";

// Import images
import gyros from '../../img/gyros.png';
import grillgemuese from '../../img/grillgemuese.png';
import vegan_diet from '../../img/vegan_diet.png';
import vegetarian_diet from '../../img/vegetarian_diet.png';
import portholeImage from '../../img/rocket_porthole.png';

import '../../css/formBeverageSelection.css'; // Reusing the same CSS for consistency

const index_to_image = [gyros, gyros, grillgemuese, grillgemuese, vegan_diet, vegetarian_diet];

function FormFoodSelection(props: FormProps) {
    // Function to handle food selection
    const handleFoodSelect = (id: number) => () => {
        props.updateBooking('food_id', id);
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Dieses Jahr kannst du dein Essen bei uns vorbestellen. Es wird jeweils Freitag und Samstag Abend ein Gericht geben.
                    Wann es was gibt, werden wir noch über die WhatsApp Gruppe bekannt geben.
                </Typography>

                <List dense sx={{ width: '100%' }}>
                    <ListItem
                        disablePadding
                        sx={{
                            border: props.currentBooking.food_id === -1 ? '4px solid' : '',
                            borderColor: 'primary.main',
                            borderRadius: '8px',
                            mb: 1
                        }}
                    >
                        <ListItemButton onClick={handleFoodSelect(-1)}>
                            <ListItemText primary="Kein Essen für mich"/>
                        </ListItemButton>
                    </ListItem>

                    {props.formContent.food_options.map((option) => {
                        return (
                            <ListItem
                                sx={{
                                    border: props.currentBooking.food_id === option.id ? '4px solid' : '',
                                    borderColor: 'primary.main',
                                    borderRadius: '8px',
                                    mb: 1
                                }}
                                key={option.id}
                                disablePadding
                            >
                                <ListItemButton onClick={handleFoodSelect(option.id)}>
                                    <ListItemAvatar>
                                        <div className="avatar-container">
                                            <Avatar
                                                alt={option.title}
                                                src={index_to_image[option.id]}
                                                sx={{width: '4em', height: '4em', marginRight: '1.5em'}}
                                            />
                                            <img src={portholeImage} className="porthole-image" alt="porthole"/>
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
            </Paper>
        </Box>
    );
}

export default FormFoodSelection;