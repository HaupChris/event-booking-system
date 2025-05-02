import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Paper,
    Box
} from '@mui/material';
import {FormProps} from "./formContainer";

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
        <Box sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
            <Paper elevation={0} sx={{p: 3}}>
                <Typography variant="body1" sx={{mb: 3}}>
                    Bestell deine Abendliche Kost bei uns vor!
                </Typography>

                <List dense sx={{width: '100%'}}>
                    {/* "No food" option */}
                    <Paper elevation={3} sx={{borderRadius: 2, mb: 2, overflow: 'hidden'}}>
                        <ListItem
                            disablePadding
                            sx={{
                                border: props.currentBooking.food_id === -1 ? '4px solid' : '',
                                borderColor: 'primary.main',
                                borderRadius: '8px',
                            }}
                        >
                            <ListItemButton onClick={handleFoodSelect(-1)}>
                                <ListItemText primary="Kein Essen für mich"/>
                            </ListItemButton>
                        </ListItem>
                    </Paper>

                    {/* Food options */}
                    {props.formContent.food_options.map((option) => {
                        return (
                            <Paper elevation={3} sx={{borderRadius: 2, mb: 2, overflow: 'hidden'}} key={option.id}>
                                <ListItem
                                    sx={{
                                        border: props.currentBooking.food_id === option.id ? '4px solid' : '',
                                        borderColor: 'primary.main',
                                        borderRadius: '8px',
                                        p: 0
                                    }}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={handleFoodSelect(option.id)}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: {xs: 'column', sm: 'row'},
                                            alignItems: {xs: 'stretch', sm: 'center'},
                                            p: {xs: 2, sm: 1}
                                        }}
                                    >
                                        <Box sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: {xs: 'column', sm: 'row'},
                                            alignItems: {xs: 'flex-start', sm: 'center'}
                                        }}>
                                            {/* Primary text - only on mobile will be full width at top */}
                                            <Box sx={{
                                                width: '100%',
                                                display: {xs: 'block', sm: 'none'},
                                                mb: 2
                                            }}>
                                                <Typography variant="h5">
                                                    {option.title} - {option.price}€
                                                </Typography>
                                            </Box>

                                            {/* Avatar and content container */}
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: {xs: 'row', sm: 'row'},
                                                alignItems: 'center',
                                                width: '100%'
                                            }}>
                                                {/* Avatar */}
                                                <ListItemAvatar sx={{minWidth: {xs: '80px', sm: '100px'}}}>
                                                    <div className="avatar-container">
                                                        <Avatar
                                                            alt={option.title}
                                                            src={index_to_image[option.id]}
                                                            sx={{width: '4em', height: '4em', marginRight: '1.5em'}}
                                                        />
                                                        <img src={portholeImage} className="porthole-image"
                                                             alt="porthole"/>
                                                    </div>
                                                </ListItemAvatar>

                                                {/* Content - on desktop, includes both texts */}
                                                <Box sx={{flexGrow: 1}}>
                                                    {/* Primary text - only visible on desktop */}
                                                    <Box sx={{display: {xs: 'none', sm: 'block'}}}>
                                                        <Typography variant="h5">
                                                            {option.title} - {option.price}€
                                                        </Typography>
                                                    </Box>

                                                    {/* Secondary text */}
                                                    <Typography variant="subtitle1" color="text.secondary">
                                                        {option.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </ListItemButton>
                                </ListItem>
                            </Paper>
                        );
                    })}
                </List> </Paper>
        </Box>
    );
}

export default FormFoodSelection;