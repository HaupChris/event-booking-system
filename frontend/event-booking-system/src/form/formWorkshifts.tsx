import {FormProps} from "./formContainer";
import React, {useEffect, useState} from "react";
import WorkShift from "./components/workShift";
import {
    Box,
    Divider,
    FormControl,
    FormHelperText,
    InputLabel,
    List,
    MenuItem,
    Select,
    TextField, Typography
} from "@mui/material";
import {TimeSlot} from "./interface";
import {styled} from "@mui/system";
import Avatar from "@mui/material/Avatar";

import jellyfish_1 from '../img/jellyfish_1.png';
import jellyfish_2 from '../img/jellyfish_2.png';
import jellyfish_3 from '../img/jellyfish_3.png';

const CustomDivider = styled(Divider)(({theme}) => ({
    margin: '16px 0',
    borderColor: theme.palette.primary.main,
    borderWidth: '2px',
}));

function WorkShiftForm(props: FormProps) {
    const [availablePriorities, setAvailabelPriorities] = useState<string[]>(["Höchste", "Mittlere", "Notnagel", ""]);
    const errorMessage = props.formValidation["timeslot_priority_1"];


    useEffect(() => {
        updateAvailablePriorities();
    }, [props.currentBooking.timeslot_priority_1, props.currentBooking.timeslot_priority_2, props.currentBooking.timeslot_priority_3])

    function updateAvailablePriorities() {

        let availablePriorities = ["Höchste", "Mittlere", "Notnagel"];
        if (props.currentBooking.timeslot_priority_1 !== -1) {
            availablePriorities.splice(availablePriorities.indexOf("Höchste"), 1);
        }
        if (props.currentBooking.timeslot_priority_2 !== -1) {
            availablePriorities.splice(availablePriorities.indexOf("Mittlere"), 1);
        }
        if (props.currentBooking.timeslot_priority_3 !== -1) {
            availablePriorities.splice(availablePriorities.indexOf("Notnagel"), 1);
        }

        setAvailabelPriorities(prevPriorities => availablePriorities);
    }

    const renderJellyfishImage = () => {
        switch (props.currentBooking.amount_shifts) {
            case 1:
                return <Avatar sx={{width: 56, height: 56}} src={jellyfish_1} alt="Moderately Happy Jellyfish"/>;
            case 2:
                return <Avatar sx={{width: 56, height: 56}} src={jellyfish_2} alt="Happy Jellyfish"/>;
            case 3:
                return <Avatar sx={{width: 56, height: 56}} src={jellyfish_3} alt="Very Happy Jellyfish"/>;
            default:
                return <Avatar sx={{width: 56, height: 56}} src={jellyfish_1} alt="Moderately Happy Jellyfish"/>;
        }
    };


    return <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '90vw'
        }}>
        <Typography variant="body2">
            Wir freuen uns, wenn du uns bei einer Supportschicht unterstützen könntest!
            Wähle bitte <strong>drei</strong> Prioritäten aus.
            Die Zahlen zeigen, wie viele Helfer:innen schon dabei sind und wie viele wir noch brauchen.

        </Typography>
        <CustomDivider sx={{width: '100%', margin: '1em'}}/>
        <Typography variant="body2">
            Mit wem möchtest du zusammen arbeiten?
        </Typography>
        <FormControl sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            marginTop: '16px',
            marginBottom: '8px'
        }}>
            <TextField
                sx={{mt: '8px', width: '90%'}}
                error={!!props.formValidation.supporter_buddy}
                variant="outlined"
                margin="normal"
                id="supporter-buddy"
                label="Dein Buddy..."
                name="name"
                value={props.currentBooking.supporter_buddy}
                onChange={e => props.updateBooking("supporter_buddy", e.target.value)}
            />
        </FormControl>
        <CustomDivider sx={{width: '100%', margin: '1em'}}/>
        <Typography variant="body2" align={"center"}>
            Wie viele Schichten möchtest du maximal übernehmen?
        </Typography>
        <FormControl sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '95%',
            marginTop: '16px',
            marginBottom: '8px'
        }}>
            <div style={{paddingRight: "1em"}}>
                {renderJellyfishImage()}
            </div>
            <Select
                sx={{ml: 1, minWidth: '70%'}}
                variant={"filled"}
                label="Anzahl Schichten"
                labelId="shift-select-label"
                id="shift-select"
                value={props.currentBooking.amount_shifts}
                onChange={e => props.updateBooking('amount_shifts', e.target.value)}>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
            </Select>

        </FormControl>


        <CustomDivider sx={{width: '100%', margin: '1em'}}/>
        <List>
            {props.formContent.work_shifts
                .sort((shift_a, shift_b) => {
                    const shift_a_workers = shift_a.time_slots.reduce((sum: number, timeslot: TimeSlot) => (sum + timeslot.num_needed - timeslot.num_booked), 0);
                    const shift_b_workers = shift_b.time_slots.reduce((sum: number, timeslot: TimeSlot) => (sum + timeslot.num_needed - timeslot.num_booked), 0);
                    if (shift_a_workers > shift_b_workers) {
                        return -1;
                    }
                    if (shift_a_workers < shift_b_workers) {
                        return 1;
                    }
                    return 0;
                })
                .map((workShift, index) => (
                    <>
                        <WorkShift
                            key={workShift.id}
                            workShift={workShift}
                            availablePriorities={availablePriorities}
                            currentBooking={props.currentBooking}
                            updateBooking={props.updateBooking}
                        />
                        <CustomDivider
                            style={{display: index >= props.formContent.work_shifts.length - 1 ? "None" : ""}}/>
                    </>
                ))}
        </List>


    </Box>;
}

export default WorkShiftForm;
