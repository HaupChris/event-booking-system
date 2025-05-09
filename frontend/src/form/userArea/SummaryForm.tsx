import React from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
    Chip,
    Avatar,
    Divider,
    alpha
} from '@mui/material';
import {Booking, FormContent, TimeSlot, WorkShift} from './interface';
import "../../css/formSummary.css";
import {PRIORITIES} from "./constants";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GroupIcon from '@mui/icons-material/Group';
import BackpackIcon from '@mui/icons-material/Backpack';
import EuroIcon from '@mui/icons-material/Euro';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AssignmentIcon from '@mui/icons-material/Assignment';

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

function getShiftAndTimeslot(work_shifts: WorkShift[], timeslot_id: number) {
    const shift = work_shifts.find(shift => shift.time_slots.find((slot: TimeSlot) => slot.id === timeslot_id));
    const timeslot = shift?.time_slots.find(slot => slot.id === timeslot_id);
    return {shift, timeslot};
}

interface IProps {
    currentBooking: Booking;
    formContent: FormContent;
}

function SummaryForm(props: IProps) {
    const {
        ticket_id,
        beverage_id,
        food_id,
        timeslot_priority_1,
        timeslot_priority_2,
        timeslot_priority_3,
        material_ids,
        supporter_buddy,
        amount_shifts,
        total_price,
        first_name,
        last_name,
        email,
        phone
    } = props.currentBooking;

    const ticket = findItemById(props.formContent.ticket_options, ticket_id);
    const beverage = findItemById(props.formContent.beverage_options, beverage_id);
    const food = findItemById(props.formContent.food_options, food_id);
    const shift_slot_1 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_1);
    const shift_slot_2 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_2);
    const shift_slot_3 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_3);
    const materials = material_ids.map(id => findItemById(props.formContent.materials, id)).filter(Boolean);

    return (
        <Box sx={{width: '98%', maxWidth: 800, mx: 'auto'}}>
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
                        <span style={{color: '#64b5f6'}}>MISSION:</span> Überprüfe deine Reisedaten und Einsatzdetails
                        vor dem Start. Alle Systeme bereit für Countdown.
                    </Typography>
                </Box>

                <Box sx={{p: {xs: 2, sm: 3}}}>
                    {/* Title */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <AssignmentIcon sx={{
                            color: '#64b5f6',
                            fontSize: '2.5rem',
                            mb: 1
                        }}/>
                        <Typography
                            variant="h5"
                            align="center"
                            sx={{
                                color: alpha('#fff', 0.9),
                                fontWeight: 'bold'
                            }}
                        >
                            Missionsübersicht
                        </Typography>
                    </Box>

                    {/* Total cost banner */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 4,
                            bgcolor: alpha('#1e88e5', 0.15),
                            color: alpha('#fff', 0.9),
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: alpha('#1e88e5', 0.3),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <EuroIcon sx={{mr: 1, fontSize: '2rem', color: '#64b5f6'}}/>
                        <Typography variant="h5" fontWeight="bold">
                            Missionsbeitrag: {total_price}€
                        </Typography>
                    </Paper>

                    {/* Personal Information Section */}
                    <Paper
                        elevation={2}
                        sx={{
                            mb: 3,
                            p: 2.5,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: alpha('#90caf9', 0.3),
                            position: 'relative',
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <PersonIcon sx={{color: '#64b5f6', mr: 1}}/>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium'
                                }}
                            >
                                Astronautendaten
                            </Typography>
                        </Box>

                        <Divider sx={{
                            mb: 2,
                            borderColor: alpha('#64b5f6', 0.2)
                        }}/>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{display: 'flex', mb: 1.5}}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 'medium',
                                            mr: 1,
                                            color: alpha('#fff', 0.7),
                                            flexShrink: 0
                                        }}
                                    >
                                        Vorname:
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: alpha('#fff', 0.9),
                                            fontWeight: 'medium',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        {first_name}
                                    </Typography>
                                </Box>

                                <Box sx={{display: 'flex', mb: 1.5}}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 'medium',
                                            mr: 1,
                                            color: alpha('#fff', 0.7),
                                            flexShrink: 0
                                        }}
                                    >
                                        Nachname:
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: alpha('#fff', 0.9),
                                            fontWeight: 'medium',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        {last_name}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{display: 'flex', mb: 1.5, alignItems: 'flex-start'}}>
                                    <EmailIcon sx={{
                                        mr: 1,
                                        color: '#64b5f6',
                                        fontSize: '1.2rem',
                                        mt: 0.3,
                                        flexShrink: 0
                                    }}/>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: alpha('#fff', 0.9),
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        {email}
                                    </Typography>
                                </Box>

                                <Box sx={{display: 'flex', mb: 1.5, alignItems: 'flex-start'}}>
                                    <PhoneIcon sx={{
                                        mr: 1,
                                        color: '#64b5f6',
                                        fontSize: '1.2rem',
                                        mt: 0.3,
                                        flexShrink: 0
                                    }}/>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: alpha('#fff', 0.9),
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        {phone}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid> </Paper>

                    {/* Booking Details Section */}
                    <Paper
                        elevation={2}
                        sx={{
                            mb: 3,
                            p: 2.5,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: alpha('#90caf9', 0.3),
                            position: 'relative',
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <ConfirmationNumberIcon sx={{color: '#64b5f6', mr: 1}}/>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium'
                                }}
                            >
                                Missionsprofil
                            </Typography>
                        </Box>

                        <Divider sx={{
                            mb: 2,
                            borderColor: alpha('#64b5f6', 0.2)
                        }}/>

                        {/* Ticket Information */}
                        <Box sx={{mb: 3}}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 'medium',
                                    mb: 1,
                                    color: alpha('#fff', 0.8)
                                }}
                            >
                                Teilnahmeoption
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1.5,
                                bgcolor: alpha('#000', 0.2),
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: alpha('#64b5f6', 0.2)
                            }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: alpha('#fff', 0.9),
                                        fontWeight: 'medium'
                                    }}
                                >
                                    {ticket?.title}
                                </Typography>
                                <Chip
                                    label={`${ticket?.price}€`}
                                    color="primary"
                                    size="small"
                                    sx={{
                                        bgcolor: alpha('#1e88e5', 0.2),
                                        '& .MuiChip-label': {fontWeight: 'bold'}
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Beverage Information */}
                        <Box sx={{mb: 3}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1
                            }}>
                                <LocalDrinkIcon sx={{mr: 1, color: '#64b5f6', fontSize: '1rem'}}/>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        color: alpha('#fff', 0.8)
                                    }}
                                >
                                    Bierflatrate
                                </Typography>
                            </Box>

                            {beverage ? (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.5,
                                    bgcolor: alpha('#000', 0.2),
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: alpha('#64b5f6', 0.2)
                                }}>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: alpha('#fff', 0.9),
                                            fontWeight: 'medium'
                                        }}
                                    >
                                        {beverage.title}
                                    </Typography>
                                    <Chip
                                        label={`${beverage.price}€`}
                                        color="primary"
                                        size="small"
                                        sx={{
                                            bgcolor: alpha('#1e88e5', 0.2),
                                            '& .MuiChip-label': {fontWeight: 'bold'}
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: alpha('#fff', 0.7),
                                        fontStyle: 'italic',
                                        pl: 1
                                    }}
                                >
                                    Keine Bierflatrate ausgewählt
                                </Typography>
                            )}
                        </Box>

                        {/* Food Information */}
                        <Box sx={{mb: 0}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1
                            }}>
                                <RestaurantIcon sx={{mr: 1, color: '#64b5f6', fontSize: '1rem'}}/>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        color: alpha('#fff', 0.8)
                                    }}
                                >
                                    Essensauswahl
                                </Typography>
                            </Box>

                            {food ? (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.5,
                                    bgcolor: alpha('#000', 0.2),
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: alpha('#64b5f6', 0.2)
                                }}>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: alpha('#fff', 0.9),
                                            fontWeight: 'medium'
                                        }}
                                    >
                                        {food.title}
                                    </Typography>
                                    <Chip
                                        label={`${food.price}€`}
                                        color="primary"
                                        size="small"
                                        sx={{
                                            bgcolor: alpha('#1e88e5', 0.2),
                                            '& .MuiChip-label': {fontWeight: 'bold'}
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: alpha('#fff', 0.7),
                                        fontStyle: 'italic',
                                        pl: 1
                                    }}
                                >
                                    Kein Essen ausgewählt
                                </Typography>
                            )}
                        </Box>
                    </Paper>

                    {/* Work Shifts Section */}
                    <Paper
                        elevation={2}
                        sx={{
                            mb: 3,
                            p: 2.5,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: alpha('#90caf9', 0.3),
                            position: 'relative',
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <WorkIcon sx={{color: '#64b5f6', mr: 1}}/>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium'
                                }}
                            >
                                Einsatzplan
                            </Typography>
                        </Box>

                        <Divider sx={{
                            mb: 2,
                            borderColor: alpha('#64b5f6', 0.2)
                        }}/>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'medium',
                                mb: 2,
                                color: alpha('#fff', 0.8)
                            }}
                        >
                            Deine Support-Prioritäten:
                        </Typography>

                        {/* Priority 1 */}
                        {(shift_slot_1?.shift && shift_slot_1?.timeslot) && (
                            <Box sx={{
                                mb: 2,
                                py: 1.5,
                                px: 2,
                                bgcolor: alpha('#4caf50', 0.1),
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: alpha('#4caf50', 0.3)
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5
                                }}>
                                    <Chip
                                        label="1. Priorität"
                                        size="small"
                                        color="success"
                                        sx={{
                                            mr: 1,
                                            fontWeight: 'bold',
                                            bgcolor: alpha('#4caf50', 0.2)
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        sx={{color: alpha('#fff', 0.9)}}
                                    >
                                        {shift_slot_1.shift.title}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    pl: 4,
                                    color: alpha('#fff', 0.7)
                                }}>
                                    <Typography variant="body2">
                                        {shift_slot_1.timeslot.title}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        ml: 1
                                    }}>
                                        <AccessTimeIcon sx={{fontSize: '0.8rem', mx: 0.5}}/>
                                        <Typography variant="body2">
                                            {shift_slot_1.timeslot.start_time} - {shift_slot_1.timeslot.end_time}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Priority 2 */}
                        {(shift_slot_2?.shift && shift_slot_2?.timeslot) && (
                            <Box sx={{
                                mb: 2,
                                py: 1.5,
                                px: 2,
                                bgcolor: alpha('#2196f3', 0.1),
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: alpha('#2196f3', 0.3)
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5
                                }}>
                                    <Chip
                                        label="2. Priorität"
                                        size="small"
                                        color="info"
                                        sx={{
                                            mr: 1,
                                            fontWeight: 'bold',
                                            bgcolor: alpha('#2196f3', 0.2)
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        sx={{color: alpha('#fff', 0.9)}}
                                    >
                                        {shift_slot_2.shift.title}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    pl: 4,
                                    color: alpha('#fff', 0.7)
                                }}>
                                    <Typography variant="body2">
                                        {shift_slot_2.timeslot.title}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        ml: 1
                                    }}>
                                        <AccessTimeIcon sx={{fontSize: '0.8rem', mx: 0.5}}/>
                                        <Typography variant="body2">
                                            {shift_slot_2.timeslot.start_time} - {shift_slot_2.timeslot.end_time}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Priority 3 */}
                        {(shift_slot_3?.shift && shift_slot_3?.timeslot) && (
                            <Box sx={{
                                mb: 2,
                                py: 1.5,
                                px: 2,
                                bgcolor: alpha('#ff9800', 0.1),
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: alpha('#ff9800', 0.3)
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5
                                }}>
                                    <Chip
                                        label="3. Priorität"
                                        size="small"
                                        color="warning"
                                        sx={{
                                            mr: 1,
                                            fontWeight: 'bold',
                                            bgcolor: alpha('#ff9800', 0.2)
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        sx={{color: alpha('#fff', 0.9)}}
                                    >
                                        {shift_slot_3.shift.title}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    pl: 4,
                                    color: alpha('#fff', 0.7)
                                }}>
                                    <Typography variant="body2">
                                        {shift_slot_3.timeslot.title}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        ml: 1
                                    }}>
                                        <AccessTimeIcon sx={{fontSize: '0.8rem', mx: 0.5}}/>
                                        <Typography variant="body2">
                                            {shift_slot_3.timeslot.start_time} - {shift_slot_3.timeslot.end_time}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Buddy and Shift Count */}
                        <Box sx={{
                            mt: 3,
                            bgcolor: alpha('#000', 0.2),
                            borderRadius: '8px',
                            p: 2,
                            border: '1px solid',
                            borderColor: alpha('#64b5f6', 0.2)
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1.5
                            }}>
                                <GroupIcon sx={{mr: 1, color: '#64b5f6', fontSize: '1.2rem'}}/>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        color: alpha('#fff', 0.8)
                                    }}
                                >
                                    Support-Informationen
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: alpha('#fff', 0.7),
                                            mb: 0.5
                                        }}
                                    >
                                        Supporter Buddy:
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                        sx={{color: alpha('#fff', 0.9)}}
                                    >
                                        {supporter_buddy || "Kein Buddy angegeben"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: alpha('#fff', 0.7),
                                            mb: 0.5
                                        }}
                                    >
                                        Anzahl Schichten:
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#64b5f6',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {amount_shifts}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>

                    {/* Materials Section */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2.5,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: alpha('#90caf9', 0.3),
                            position: 'relative',
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <BackpackIcon sx={{color: '#64b5f6', mr: 1}}/>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium'
                                }}
                            >
                                Ausrüstung
                            </Typography>
                        </Box>

                        <Divider sx={{
                            mb: 2,
                            borderColor: alpha('#64b5f6', 0.2)
                        }}/>

                        {materials.length > 0 ? (
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'medium',
                                        mb: 1.5,
                                        color: alpha('#fff', 0.8)
                                    }}
                                >
                                    Ich bringe mit:
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    p: 1.5,
                                    bgcolor: alpha('#000', 0.2),
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: alpha('#64b5f6', 0.2)
                                }}>
                                    {materials.map((material, index) => (
                                        <Chip
                                            key={index}
                                            label={material?.title}
                                            variant="outlined"
                                            sx={{
                                                borderColor: alpha('#64b5f6', 0.5),
                                                color: alpha('#fff', 0.9)
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            <Typography
                                variant="body1"
                                sx={{
                                    color: alpha('#fff', 0.7),
                                    fontStyle: 'italic',
                                    pl: 1
                                }}
                            >
                                Keine Materialien ausgewählt
                            </Typography>
                        )
                        }
                    </Paper>
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
                        WWWW-MISSION-SUMMARY // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default SummaryForm;