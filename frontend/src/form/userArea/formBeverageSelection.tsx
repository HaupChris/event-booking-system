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
    Box,
    alpha
} from '@mui/material';
import {FormProps} from "./formContainer";
import LocalBarIcon from '@mui/icons-material/LocalBar';

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
        <Box sx={{ width: '98%', maxWidth: 600, mx: 'auto' }}>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    p: 0,
                    borderRadius: '14px',
                    background: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                }}
            >
                {/* Decorative top pattern */}
                <Box sx={{
                    width: '100%',
                    height: '6px',
                    background: 'linear-gradient(90deg, #1e88e5, #64b5f6, #bbdefb, #1e88e5)',
                    backgroundSize: '300% 100%',
                    animation: 'gradientMove 12s linear infinite',
                    '@keyframes gradientMove': {
                        '0%': { backgroundPosition: '0% 0%' },
                        '100%': { backgroundPosition: '300% 0%' },
                    }
                }} />

                {/* Mission Briefing */}
                <Box sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: alpha('#000', 0.3),
                    borderLeft: '4px solid',
                    borderColor: '#1e88e5',
                    mx: { xs: 1, sm: 2 },
                    my: 2,
                    borderRadius: '0 8px 8px 0',
                }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha('#fff', 0.9),
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                        }}
                    >
                        <span style={{ color: '#64b5f6' }}>MISSION:</span> Auf dem Festival steht eine frei zugängliche Zapfanlage, an der du dich für den gewählten Zeitraum bedienen kannst.
                    </Typography>
                </Box>

                <List sx={{ p: { xs: 1, sm: 2 } }}>
                    <Paper
                        elevation={2}
                        sx={{
                            mb: 2,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '8px',
                            border: props.currentBooking.beverage_id === -1 ? '2px solid' : '1px solid',
                            borderColor: props.currentBooking.beverage_id === -1 ? '#1e88e5' : alpha('#90caf9', 0.3),
                            overflow: 'hidden',
                            boxShadow: props.currentBooking.beverage_id === -1
                                ? `0 0 12px ${alpha('#1e88e5', 0.3)}`
                                : 'none',
                        }}
                    >
                        <ListItemButton
                            onClick={handleBeverageSelect(-1)}
                            sx={{
                                py: 1.5,
                                px: { xs: 2, sm: 3 },
                                '&:hover': {
                                    backgroundColor: alpha('#1e88e5', 0.1),
                                }
                            }}
                        >
                            <ListItemAvatar sx={{ minWidth: { xs: 36, sm: 40 } }}>
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
                    </Paper>

                    {props.formContent.beverage_options.map((option) => {
                        const isSelected = props.currentBooking.beverage_id === option.id;

                        return (
                            <Paper
                                elevation={2}
                                key={option.id}
                                sx={{
                                    mb: 2,
                                    backgroundColor: alpha('#020c1b', 0.7),
                                    borderRadius: '8px',
                                    border: isSelected ? '2px solid' : '1px solid',
                                    borderColor: isSelected ? '#1e88e5' : alpha('#90caf9', 0.3),
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: isSelected
                                        ? `0 0 12px ${alpha('#1e88e5', 0.3)}`
                                        : 'none',
                                }}
                            >
                                {/* Futuristic scanner line animation for selected option */}
                                {isSelected && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '100%',
                                        zIndex: 1,
                                        overflow: 'hidden',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            width: '100%',
                                            height: '2px',
                                            background: 'linear-gradient(to right, transparent, #64b5f6, transparent)',
                                            top: 0,
                                            animation: 'scanDown 2s infinite',
                                        },
                                        '@keyframes scanDown': {
                                            '0%': { transform: 'translateY(0)' },
                                            '100%': { transform: 'translateY(100%)' }
                                        }
                                    }} />
                                )}

                                <ListItem
                                    disablePadding
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                    }}
                                >
                                    <ListItemButton
                                        onClick={handleBeverageSelect(option.id)}
                                        sx={{
                                            p: { xs: 2, sm: 3 },
                                            width: '100%',
                                            position: 'relative',
                                            zIndex: 2,
                                            '&:hover': {
                                                backgroundColor: alpha('#1e88e5', 0.1),
                                            }
                                        }}
                                    >
                                        {/* Mobile Layout - Column */}
                                        <Box sx={{
                                            width: '100%',
                                            display: { xs: 'flex', sm: 'none' },
                                            flexDirection: 'column',
                                        }}>
                                            {/* Title */}
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: alpha('#fff', 0.9),
                                                    fontWeight: 'medium',
                                                    mb: 1.5
                                                }}
                                            >
                                                {option.title}
                                            </Typography>

                                            {/* Image and description row */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                width: '100%',

                                            }}>
                                                {/* Avatar */}
                                                <Box sx={{ position: 'relative', ml: 2, mr:5, mt:2}}>
                                                    <Avatar
                                                        alt={option.title}
                                                        src={option.id === 1 ? beverages_1 : option.id === 2 ? beverages_2 : beverages_0}
                                                        sx={{
                                                            width: 100,
                                                            height: 100,
                                                            border: '2px solid',
                                                            borderColor: alpha('#1e88e5', 0.3),
                                                        }}
                                                    />
                                                    <img
                                                        src={portholeImage}
                                                        alt="porthole"
                                                        style={{
                                                            position: 'absolute',
                                                            top: -15,
                                                            left: -15,
                                                            width: 140,
                                                            height: 140,
                                                            zIndex: 1,
                                                        }}
                                                    />
                                                </Box>

                                                {/* Description */}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: alpha('#fff', 0.7),
                                                        flexGrow: 1,
                                                    }}
                                                >
                                                    {option.description}
                                                </Typography>
                                            </Box>

                                            {/* Price tag */}
                                            <Box sx={{
                                                alignSelf: 'flex-end',
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: alpha('#1e88e5', 0.1),
                                                p: 0.5,
                                                px: 1.5,
                                                borderRadius: '4px',
                                                border: '1px solid',
                                                borderColor: alpha('#1e88e5', 0.3),
                                            }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: '#64b5f6',
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1rem'
                                                    }}
                                                >
                                                    {option.price}€
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Desktop Layout - Row */}
                                        <Box sx={{
                                            width: '100%',
                                            display: { xs: 'none', sm: 'flex' },
                                            alignItems: 'center',
                                        }}>
                                            {/* Avatar */}
                                            <Box sx={{ position: 'relative', mr: 3 }}>
                                                <Avatar
                                                    alt={option.title}
                                                    src={option.id === 1 ? beverages_1 : option.id === 2 ? beverages_2 : beverages_0}
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        border: '2px solid',
                                                        borderColor: alpha('#1e88e5', 0.3),
                                                    }}
                                                />
                                                <img
                                                    src={portholeImage}
                                                    alt="porthole"
                                                    style={{
                                                        position: 'absolute',
                                                        top: -12,
                                                        left: -12,
                                                        width: 104,
                                                        height: 104,
                                                        zIndex: 1,
                                                    }}
                                                />
                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: alpha('#fff', 0.9),
                                                        fontWeight: 'medium',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {option.title}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: alpha('#fff', 0.7),
                                                    }}
                                                >
                                                    {option.description}
                                                </Typography>
                                            </Box>

                                            {/* Price tag */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: alpha('#1e88e5', 0.1),
                                                p: 0.5,
                                                px: 1.5,
                                                borderRadius: '4px',
                                                border: '1px solid',
                                                borderColor: alpha('#1e88e5', 0.3),
                                                ml: 2
                                            }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: '#64b5f6',
                                                        fontWeight: 'bold',
                                                        fontSize: '1.25rem'
                                                    }}
                                                >
                                                    {option.price}€
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </ListItemButton>
                                </ListItem>
                            </Paper>
                        );
                    })}
                </List>

                {/* Footer with space station ID */}
                <Box sx={{
                    p: 1.5,
                    backgroundColor: '#041327',
                    borderTop: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: 'monospace',
                            color: alpha('#fff', 0.7),
                            letterSpacing: '1px',
                            fontSize: '0.7rem'
                        }}
                    >
                        WWWW-BEVERAGE-STATION // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default BeverageForm;