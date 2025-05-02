import React, {useEffect, useState} from "react";
import {FormProps} from "./formContainer";
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
} from "@mui/material";
import {styled} from "@mui/system";
import {Info} from "@mui/icons-material";
import {PRIORITIES} from "./constants";

import '../../css/workShift.css';

import {TimeSlot} from "./interface";

const CustomDivider = styled(Divider)(({theme}) => ({
    margin: "32px 0",
    width: "100%",
    borderColor: theme.palette.primary.main,
    borderWidth: "2px",
}));

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
        <Box sx={{width: '100%', maxWidth: 900, mx: 0}}>
            <Paper elevation={0}
                   sx={{p: 1}}
            >
                <Typography variant="subtitle1" component="div" sx={{mb: 2}}>
                    Wir freuen uns, wenn du uns bei einer Supportschicht unterstützen
                    könntest! Wähle bitte <u>drei</u> Prioritäten aus:
                    <ul>
                        <li><u>{PRIORITIES.FIRST}</u>,</li>
                        <li><u>{PRIORITIES.SECOND}</u> und</li>
                        <li><u>{PRIORITIES.THIRD}</u>.</li>
                    </ul>
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

                <CustomDivider/>

                <Box sx={{mb: 3}}>
                    <Typography variant="h6" align={"center"} gutterBottom>
                        Wie viele Schichten möchtest du maximal übernehmen?{" "}
                        <ClickAwayListener onClickAway={() => setTooltipNumShiftsOpen(false)}>
              <span style={{display: "inline-block", verticalAlign: "middle"}}>
                <Tooltip
                    title={
                        <span dangerouslySetInnerHTML={{__html: numShiftsHelperText}}/>
                    }
                    PopperProps={{
                        disablePortal: true,
                    }}
                    onClose={() => setTooltipNumShiftsOpen(false)}
                    open={tooltipNumShiftsOpen}
                    disableFocusListener
                    enterTouchDelay={0}
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

                    <FormControl
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            marginTop: "16px",
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" width="100%">
                            <Select
                                sx={{minWidth: "60%"}}
                                variant={"filled"}
                                label="Anzahl Schichten"
                                labelId="shift-select-label"
                                id="shift-select"
                                value={props.currentBooking.amount_shifts}
                                onChange={(e) =>
                                    props.updateBooking("amount_shifts", e.target.value as number)
                                }
                            >
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                            </Select>
                        </Box>
                    </FormControl>
                </Box>

                <CustomDivider/>

                <Box sx={{mb: 3}}>
                    <Typography align={"center"} variant="h6" gutterBottom>Mit wem möchtest du zusammen
                        arbeiten?</Typography>
                    <Box sx={{display: "flex", flexDirection: {xs: "column", sm: "row"}, gap: 2}}>
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
                        />
                    </Box>
                </Box>

                <CustomDivider/>

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
                                <CustomDivider
                                    style={{
                                        display: index >= props.formContent.work_shifts.length - 1 ? "None" : "",
                                    }}
                                />
                            </React.Fragment>
                        ))}
                </List>
            </Paper>
        </Box>
    );
}

export default WorkShiftForm;