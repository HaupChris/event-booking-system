// frontend/src/form/artistArea/artistBeverageSelection.tsx

import React from 'react';
import {
    List, ListItem, ListItemButton, ListItemText,
    ListItemAvatar, Avatar, Typography, Paper, Box
} from '@mui/material';
import { ArtistFormProps } from './artistFormContainer';

// Import images
import beverages_0 from '../../img/beverages_1.jpg';
import beverages_1 from '../../img/beverages_2.jpg';
import beverages_2 from '../../img/beverages_3.jpg';
import portholeImage from '../../img/rocket_porthole.png';

import '../../css/formBeverageSelection.css';

function ArtistBeverageForm(props: ArtistFormProps) {
    const handleBeverageSelect = (id: number) => () => {
        props.updateBooking('beverage_id', id);
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Auf dem Festival steht eine frei zugängliche Zapfanlage zur Verfügung.
                    Als Künstler*in ist deine Getränkeflatrate kostenlos. Bitte wähle dennoch eine Option aus,
                    damit wir die Menge besser planen können.
                </Typography>

                <List dense sx={{ width: '100%' }}>
                    <ListItem disablePadding sx={{
                        border: props.currentBooking.beverage_id === -1 ? '4px solid' : '',
                        borderRadius: '8px',
                        mb: 1
                    }}>
                        <ListItemButton onClick={handleBeverageSelect(-1)}>
                            <ListItemText primary="Kein Bier für mich"/>
                        </ListItemButton>
                    </ListItem>

                    {props.formContent.beverage_options.map((option) => {
                        return (
                            <ListItem
                                sx={{
                                    border: props.currentBooking.beverage_id === option.id ? '4px solid ' : '',
                                    borderRadius: '8px',
                                    mb: 1
                                }}
                                key={option.id}
                                disablePadding
                            >
                                <ListItemButton onClick={handleBeverageSelect(option.id)}>
                                    <ListItemAvatar>
                                        <div className="avatar-container">
                                            <Avatar
                                                alt={option.title}
                                                src={option.id === 1 ? beverages_1 : option.id === 2 ? beverages_2 : beverages_0}
                                                sx={{width: '4em', height: '4em', marginRight: '1.5em'}}
                                            />
                                            <img src={portholeImage} className="porthole-image"/>
                                        </div>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={option.title}
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

export default ArtistBeverageForm;