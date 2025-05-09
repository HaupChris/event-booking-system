import React, {useEffect, useState} from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import WorkShift from "../components/workShift";
import {
    Box,
    ClickAwayListener,
    Divider,
    FormControl,
    IconButton,
    List,
    MenuItem,
    Paper,
    Select,
    TextField,
    Tooltip,
    Typography,
    alpha
} from "@mui/material";
import {Info, Engineering, PersonAdd} from "@mui/icons-material";
import {PRIORITIES} from "./constants";

import '../../css/workShift.css';

import {TimeSlot} from "./interface";

function WorkShiftForm(props: FormProps) {
    const [availablePriorities, setAvailablePriorities] = useState<string[]>([
        PRIORITIES.FIRST,
        PRIORITIES.SECOND,
        PRIORITIES.THIRD,
        "",
    ]);

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipNumShiftsOpen, setTooltipNumShiftsOpen] = useState(false);
    const [supporterBuddyFirstName, setSupporterBuddyFirstName] = useState(props.currentBooking.supporter_buddy.split(" ")[0]);
    const [supporterBuddyLastName, setSupporterBuddyLastName] = useState(props.currentBooking.supporter_buddy.split(" ")[1] || "");

    useEffect(() => {
        props.updateBooking("supporter_buddy", supporterBuddyFirstName + " " + supporterBuddyLastName);
    }, [supporterBuddyFirstName, supporterBuddyLastName]);

    useEffect(() => {
        updateAvailablePriorities();
    }, [
        props.currentBooking.timeslot_priority_1,
        props.currentBooking.timeslot_priority_2,
        props.currentBooking.timeslot_priority_3,
    ]);

    function updateAvailablePriorities() {
        let availablePriorities = [
            PRIORITIES.FIRST,
            PRIORITIES.SECOND,
            PRIORITIES.THIRD,
        ];
        if (props.currentBooking.timeslot_priority_1 !== -1) {
            availablePriorities.splice(
                availablePriorities.indexOf(PRIORITIES.FIRST),
                1
            );
        }
        if (props.currentBooking.timeslot_priority_2 !== -1) {
            availablePriorities.splice(
                availablePriorities.indexOf(PRIORITIES.SECOND),
                1
            );
        }
        if (props.currentBooking.timeslot_priority_3 !== -1) {
            availablePriorities.splice(
                availablePriorities.indexOf(PRIORITIES.THIRD),
                1
            );
        }

        setAvailablePriorities(availablePriorities);
    }


    const infoText = `Wir sind ein nicht kommerzielles Event. 
Jeder Teilnehmer*in übernimmt mindestens eine Schicht. Bitte gib uns drei Prioritäten: 
<ul>
<li><u>${PRIORITIES.FIRST}</u></li>
<li><u>${PRIORITIES.SECOND}</u> und</li>
<li> <u>${PRIORITIES.THIRD}</u></li>
</ul>

Nach der Anmeldungsphase planen wir die Schichten und versuchen, alle Vorlieben zu berücksichtigen.<br/><br/>
Solltest du mehr als eine Schicht übernehmen wollen, teile uns bitte die Anzahl mit. Vielen Dank für deine Unterstützung!`;

    const numShiftsHelperText = `Wähle, ob du eine, zwei oder drei Schichten übernehmen möchtest. Anhand deiner Prioritäten bekommst du dann mehrere Schichten zugeteilt.<br/><br/>`;

    return (
        <Box sx={{ width: '98%', maxWidth: 900, mx: 'auto' }}>
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
                        <span style={{ color: '#64b5f6' }}>MISSION:</span> Wähle deine bevorzugten Supportschichten, um der Raumstation zu helfen. Wähle <u>drei</u> Prioritäten.
                    </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{
                            fontSize: '0.95rem',
                            mb: 2,
                            color: alpha('#fff', 0.8)
                        }}
                    >
                        Links neben jeder Schicht stehen zwei Zahlen. Die erste zeigt, wie viele
                        Astronaut:innen schon dabei, die zweite wie viele wir insgesamt brauchen.{" "}
                        <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
                            <span style={{display: "inline-block", verticalAlign: "middle"}}>
                                <Tooltip
                                    title={<span dangerouslySetInnerHTML={{__html: infoText}}/>}
                                    PopperProps={{
                                        disablePortal: true,
                                    }}
                                    onClose={() => setTooltipOpen(false)}
                                    open={tooltipOpen}
                                    disableFocusListener
                                    enterTouchDelay={0}
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                bgcolor: 'background.paper',
                                                color: 'text.primary',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                                border: '1px solid',
                                                borderColor: alpha('#1e88e5', 0.2),
                                                '& ul': { pl: 2 },
                                                borderRadius: 2,
                                                p: 2
                                            }
                                        }
                                    }}
                                >
                                    <IconButton
                                        color="secondary"
                                        onClick={() => setTooltipOpen(true)}
                                        style={{padding: 0, marginLeft: 4, verticalAlign: "middle"}}
                                    >
                                        <Info fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </span>
                        </ClickAwayListener>
                    </Typography>

                    {/* Shift Count Section */}
                    <Paper
                        elevation={2}
                        sx={{
                            mb: 3,
                            mt: 4,
                            p: 2,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: alpha('#1e88e5', 0.3),
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                        }}>
                            <Engineering sx={{ color: '#64b5f6', mr: 1 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium'
                                }}
                            >
                                Anzahl der Schichten
                                <ClickAwayListener onClickAway={() => setTooltipNumShiftsOpen(false)}>
                                    <span style={{display: "inline-block", verticalAlign: "middle"}}>
                                        <Tooltip
                                            title={<span dangerouslySetInnerHTML={{__html: numShiftsHelperText}}/>}
                                            PopperProps={{
                                                disablePortal: true,
                                            }}
                                            onClose={() => setTooltipNumShiftsOpen(false)}
                                            open={tooltipNumShiftsOpen}
                                            disableFocusListener
                                            enterTouchDelay={0}
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        bgcolor: 'background.paper',
                                                        color: 'text.primary',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                                        border: '1px solid',
                                                        borderColor: alpha('#1e88e5', 0.2),
                                                        borderRadius: 2,
                                                        p: 2
                                                    }
                                                }
                                            }}
                                        >
                                            <IconButton
                                                color="secondary"
                                                onClick={() => setTooltipNumShiftsOpen(true)}
                                                style={{padding: 0, marginLeft: 4, verticalAlign: "middle"}}
                                            >
                                                <Info fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </span>
                                </ClickAwayListener>
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                            <Select
                                sx={{
                                    minWidth: {xs: '80%', sm: '60%'},
                                    backgroundColor: alpha('#020c1b', 0.4),
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: alpha('#64b5f6', 0.3),
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: alpha('#64b5f6', 0.5),
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#1e88e5',
                                    },
                                }}
                                variant="outlined"
                                labelId="shift-select-label"
                                id="shift-select"
                                value={props.currentBooking.amount_shifts}
                                onChange={(e) =>
                                    props.updateBooking("amount_shifts", e.target.value as number)
                                }
                            >
                                <MenuItem value={1}>1 Schicht</MenuItem>
                                <MenuItem value={2}>2 Schichten</MenuItem>
                                <MenuItem value={3}>3 Schichten</MenuItem>
                            </Select>
                        </Box>
                    </Paper>

                    {/* Crew Partner Section */}
                    <Paper
                        elevation={2}
                        sx={{
                            mb: 4,
                            p: 2,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: alpha('#1e88e5', 0.3),
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                        }}>
                            <PersonAdd sx={{ color: '#64b5f6', mr: 1 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium'
                                }}
                            >
                                Crew Partner:in
                            </Typography>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                mb: 2,
                                color: alpha('#fff', 0.7)
                            }}
                        >
                            Mit wem möchtest du zusammen arbeiten?
                        </Typography>

                        <Box sx={{
                            display: "flex",
                            flexDirection: {xs: "column", sm: "row"},
                            gap: 2
                        }}>
                            <TextField
                                fullWidth
                                error={!!props.formValidation.supporter_buddy}
                                variant="outlined"
                                margin="normal"
                                id="supporter-buddy-first"
                                label="Vorname"
                                name="first_name"
                                value={supporterBuddyFirstName}
                                onChange={(e) => setSupporterBuddyFirstName(e.target.value)}
                                sx={{
                                    mt: 0,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: alpha('#020c1b', 0.4),
                                        '& fieldset': {
                                            borderColor: alpha('#64b5f6', 0.3),
                                        },
                                        '&:hover fieldset': {
                                            borderColor: alpha('#64b5f6', 0.5),
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1e88e5',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: alpha('#fff', 0.7),
                                        '&.Mui-focused': {
                                            color: '#64b5f6',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: alpha('#fff', 0.9),
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                error={!!props.formValidation.supporter_buddy}
                                variant="outlined"
                                margin="normal"
                                id="supporter-buddy-last"
                                label="Nachname"
                                name="last_name"
                                value={supporterBuddyLastName}
                                onChange={(e) => setSupporterBuddyLastName(e.target.value)}
                                sx={{
                                    mt: 0,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: alpha('#020c1b', 0.4),
                                        '& fieldset': {
                                            borderColor: alpha('#64b5f6', 0.3),
                                        },
                                        '&:hover fieldset': {
                                            borderColor: alpha('#64b5f6', 0.5),
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1e88e5',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: alpha('#fff', 0.7),
                                        '&.Mui-focused': {
                                            color: '#64b5f6',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: alpha('#fff', 0.9),
                                    },
                                }}
                            />
                        </Box>
                    </Paper>

                    {/* Available Shifts Header */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        mt: 4,
                        borderBottom: '1px solid',
                        borderColor: alpha('#64b5f6', 0.3),
                        pb: 1
                    }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#64b5f6',
                                fontWeight: 'medium'
                            }}
                        >
                            Verfügbare Schichten
                        </Typography>
                    </Box>

                    {/* Work Shifts List */}
                    <List>
                        {props.formContent.work_shifts
                            .sort((shift_a, shift_b) => {
                                const shift_a_workers = shift_a.time_slots.reduce(
                                    (sum: number, timeslot: TimeSlot) =>
                                        sum + timeslot.num_needed - timeslot.num_booked,
                                    0
                                );
                                const shift_b_workers = shift_b.time_slots.reduce(
                                    (sum: number, timeslot: TimeSlot) =>
                                        sum + timeslot.num_needed - timeslot.num_booked,
                                    0
                                );
                                if (shift_a_workers > shift_b_workers) {
                                    return -1;
                                }
                                if (shift_a_workers < shift_b_workers) {
                                    return 1;
                                }
                                return 0;
                            })
                            .map((workShift, index) => (
                                <React.Fragment key={workShift.id}>
                                    <WorkShift
                                        workShift={workShift}
                                        availablePriorities={availablePriorities}
                                        currentBooking={props.currentBooking}
                                        updateBooking={props.updateBooking}
                                    />
                                    {index < props.formContent.work_shifts.length - 1 && (
                                        <Divider
                                            sx={{
                                                my: 3,
                                                borderColor: alpha('#64b5f6', 0.2),
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
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
                        WWWW-CREW-ASSIGNMENTS // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default WorkShiftForm;