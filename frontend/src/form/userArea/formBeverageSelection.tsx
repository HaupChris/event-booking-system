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
import beverages_0 from '../../img/beverages_1.jpg';
import beverages_1 from '../../img/beverages_2.jpg';
import beverages_2 from '../../img/beverages_3.jpg';
import portholeImage from '../../img/rocket_porthole.png';

import '../../css/formBeverageSelection.css';

function BeverageForm(props: FormProps) {
    // Function to handle beverage selection
    const handleBeverageSelect = (id: number) => () => {
        props.updateBooking('beverage_id', id);
    };

    return (
        <Box sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
            <Paper elevation={0} sx={{p: 1}}>
                <Typography variant="body1" sx={{mb: 3}}>
                    Auf dem Festival steht eine frei zugängliche Zapfanlage, an der du dich für den gewählten Zeitraum
                    so oft du
                    willst bedienen kannst.
                </Typography>

                <List dense sx={{width: '100%'}}>
                    <Paper elevation={3} sx={{mb: 2}}>
                        <ListItem
                            disablePadding
                            sx={{
                                border: props.currentBooking.beverage_id === -1 ? '4px solid' : '',
                                borderColor: 'primary.main',
                                borderRadius: '8px',
                                mb: 1
                            }}
                        >
                            <ListItemButton onClick={handleBeverageSelect(-1)}>
                                <ListItemText primary="Kein Bier für mich"/>
                            </ListItemButton>
                        </ListItem>
                    </Paper>

                    {props.formContent.beverage_options.map((option) => {
                        return (
                            <Paper elevation={3} sx={{mb: 2}}>
                                <ListItem

                                    sx={{
                                        border: props.currentBooking.beverage_id === option.id ? '4px solid' : '',
                                        borderColor: 'primary.main',
                                        borderRadius: '8px',
                                        mb: 1
                                    }}
                                    key={option.id}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={handleBeverageSelect(option.id)}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: {xs: 'column', sm: 'row'},
                                            alignItems: {xs: 'stretch', sm: 'center'}
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
                                                <Typography variant="h5">{option.title}</Typography>
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
                                                            src={option.id === 1 ? beverages_1 : option.id === 2 ? beverages_2 : beverages_0}
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
                                                        <Typography variant="h5">{option.title}</Typography>
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
                </List>
            </Paper>
        </Box>
    );
}

export default BeverageForm;