import React from "react";
import {
    Box,
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Typography,
    alpha,
    CircularProgress,
    Chip
} from "@mui/material";
import "../../css/formMaterials.css";
import {Material} from "./interface";
import InventoryIcon from '@mui/icons-material/Inventory';
import BackpackIcon from '@mui/icons-material/Backpack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {FormProps} from "./formContainer";


function MaterialsForm(props: FormProps) {
    function handleToggle(material_id: number) {
        if (props.currentBooking.material_ids.indexOf(material_id) === -1) {
            props.updateBooking("material_ids", [...props.currentBooking.material_ids, material_id])
        } else {
            props.updateBooking("material_ids",
                props.currentBooking.material_ids.filter((id) => id !== material_id));
        }
    }


    // Get dynamic styling for the capacity indicator
    const getCapacityColor = (numBooked: number, numNeeded: number) => {
        if (numBooked >= numNeeded) return '#f44336'; // error.main
        if (numBooked / numNeeded > 0.7) return '#ff9800'; // warning.main
        return '#4caf50'; // success.main
    };

    return (
        <Box sx={{width: '98%', maxWidth: 700, mx: 'auto'}}>
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
                        '0%': {backgroundPosition: '0% 0%'},
                        '100%': {backgroundPosition: '300% 0%'},
                    }
                }}/>

                {/* Mission Briefing */}
                <Box sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: alpha('#000', 0.3),
                    borderLeft: '4px solid',
                    borderColor: '#1e88e5',
                    mx: {xs: 1, sm: 2},
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
                        <span style={{color: '#64b5f6'}}>MISSION:</span> Wähle aus, welche Ausrüstung und Materialien du
                        für unsere interstellare Expedition mitbringen kannst.
                    </Typography>
                </Box>

                <Box sx={{p: {xs: 2, sm: 3}}}>
                    {/* Header Section */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <BackpackIcon sx={{color: '#64b5f6', mr: 1, fontSize: '1.5rem'}}/>
                        <Typography variant="h6" sx={{color: alpha('#fff', 0.9), fontWeight: 'medium'}}>
                            Mitzubringende Materialien
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        paragraph
                        sx={{
                            mb: 3,
                            color: alpha('#fff', 0.7),
                            lineHeight: 1.6
                        }}
                    >
                        Deine Unterstützung hilft uns, das Festival zu einem unvergesslichen Erlebnis zu machen.
                        Bitte wähle die Materialien aus, die du mitbringen kannst.
                    </Typography>

                    {/* Selected Items Summary - if any */}
                    {props.currentBooking.material_ids.length > 0 && (
                        <Box sx={{
                            mb: 3,
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: alpha('#64b5f6', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#64b5f6', 0.3)
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1.5
                            }}>
                                <InventoryIcon sx={{color: '#64b5f6', fontSize: '1.2rem', mr: 1}}/>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: alpha('#fff', 0.9),
                                        fontWeight: 'medium'
                                    }}
                                >
                                    Du bringst mit
                                    ({props.currentBooking.material_ids.length} {props.currentBooking.material_ids.length === 1 ? 'Gegenstand' : 'Gegenstände'}):
                                </Typography>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                pl: 3
                            }}>
                                {props.formContent.materials
                                    .filter(material => props.currentBooking.material_ids.includes(material.id))
                                    .map(material => (
                                        <Chip
                                            key={material.id}
                                            label={material.title}
                                            color="primary"
                                            size="small"
                                            icon={<CheckCircleIcon/>}
                                            sx={{
                                                fontWeight: 'medium',
                                                bgcolor: alpha('#1e88e5', 0.2),
                                                '& .MuiChip-label': {px: 1}
                                            }}
                                            onDelete={() => handleToggle(material.id)}
                                        />
                                    ))
                                }
                            </Box>
                        </Box>
                    )}

                    {/* Materials List */}
                    <List dense className={'material-list'}>
                        {props.formContent.materials
                            .filter((material) => material.num_needed > material.num_booked || props.currentBooking.material_ids.includes(material.id))
                            .sort((a, b) => (b.num_needed - b.num_booked) - (a.num_needed - a.num_booked))
                            .map((material: Material) => {
                                const labelId = `checkbox-list-secondary-label-${material.id}`;
                                const isSelected = props.currentBooking.material_ids.indexOf(material.id) !== -1;
                                const num_booked = material.num_booked + (isSelected ? 1 : 0);
                                const capacityColor = getCapacityColor(num_booked, material.num_needed);

                                return (
                                    <Paper
                                        elevation={2}
                                        key={material.id}
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
                                                    background: 'linear-gradient(to right, transparent, #1e88e5, transparent)',
                                                    top: 0,
                                                    animation: 'scanDown 2s infinite',
                                                },
                                                '@keyframes scanDown': {
                                                    '0%': {transform: 'translateY(0)'},
                                                    '100%': {transform: 'translateY(100%)'}
                                                }
                                            }}/>
                                        )}

                                        <ListItem
                                            disablePadding
                                            sx={{
                                                position: 'relative',
                                                zIndex: 2,
                                            }}
                                        >
                                            <ListItemButton
                                                onClick={() => handleToggle(material.id)}
                                                sx={{
                                                    py: 1.5,
                                                    px: {xs: 2, sm: 2.5},
                                                    '&:hover': {
                                                        backgroundColor: alpha('#1e88e5', 0.1),
                                                    }
                                                }}
                                            >
                                                {/* Progress Circle */}
                                                <Box sx={{
                                                    position: 'relative',
                                                    mr: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <CircularProgress
                                                        variant="determinate"
                                                        value={num_booked > 0 ? (num_booked / material.num_needed) * 100 : 0}
                                                        size={46}
                                                        thickness={4}
                                                        sx={{
                                                            color: capacityColor,
                                                            backgroundColor: alpha('#000', 0.3),
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            top: 0,
                                                            left: 0,
                                                            bottom: 0,
                                                            right: 0,
                                                            position: 'absolute',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            component="div"
                                                            sx={{
                                                                color: alpha('#fff', 0.9),
                                                                fontWeight: 'medium'
                                                            }}
                                                        >
                                                            {`${num_booked}/${material.num_needed}`}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <ListItemText
                                                    id={labelId}
                                                    primary={
                                                        <Typography
                                                            variant={"subtitle1"}
                                                            sx={{
                                                                color: alpha('#fff', 0.9),
                                                                fontWeight: isSelected ? 'medium' : 'normal'
                                                            }}
                                                        >
                                                            {material.title}
                                                        </Typography>
                                                    }
                                                />

                                                {/* Status indicator */}
                                                {isSelected ? (
                                                    <Chip
                                                        label="Ausgewählt"
                                                        color="primary"
                                                        size="small"
                                                        icon={<CheckCircleIcon/>}
                                                        sx={{ml: 1}}
                                                    />
                                                ) : (
                                                    <Checkbox
                                                        edge="end"
                                                        onChange={() => handleToggle(material.id)}
                                                        checked={isSelected}
                                                        inputProps={{'aria-labelledby': labelId}}
                                                        sx={{
                                                            color: alpha('#64b5f6', 0.7),
                                                            '&.Mui-checked': {
                                                                color: '#64b5f6',
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </ListItemButton>
                                        </ListItem>
                                    </Paper>
                                );
                            })}
                    </List>
                </Box>

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
                        WWWW-CARGO-MANIFEST // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default MaterialsForm;