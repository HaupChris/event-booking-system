// frontend/src/form/artistArea/artistFoodSelection.tsx

import React from 'react';
import {
    List, ListItem, ListItemButton, ListItemText,
    ListItemAvatar, Avatar, Typography, Paper, Box
} from '@mui/material';
import { ArtistFormProps } from './artistFormContainer';

// Import images
import gyros from '../../img/gyros.png';
import grillgemuese from '../../img/grillgemuese.png';
import vegan_diet from '../../img/vegan_diet.png';
import vegetarian_diet from '../../img/vegetarian_diet.png';
import portholeImage from '../../img/porthole_transparent.png';

import '../../css/formBeverageSelection.css';

const index_to_image = [gyros, gyros, grillgemuese, grillgemuese, vegan_diet, vegetarian_diet];

function ArtistFoodSelection(props: ArtistFormProps) {
    const handleFoodSelect = (id: number) => () => {
        props.updateBooking('food_id', id);
    };

    // Determine if option is free for artist (first meal is free)
    const getArtistFoodPrice = (option: any) => {
        if (option.title.includes("Beide Essen")) {
            return `${option.price}€`;
        } else {
            return "Kostenlos";
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Als Künstler*in erhältst du eine kostenlose Mahlzeit.
                    Wenn du "Beide Essen" wählst, musst du nur eine Mahlzeit bezahlen.
                </Typography>

                <List dense sx={{ width: '100%' }}>
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
                                        <div className="avatar-container">
                                            <Avatar
                                                alt={option.title}
                                                src={index_to_image[option.id]}
                                                sx={{width: '4em', height: '4em', marginRight: '1.5em'}}
                                            />
                                            <img src={portholeImage} className="porthole-image"/>
                                        </div>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={`${option.title} - ${getArtistFoodPrice(option)}`}
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

export default ArtistFoodSelection;