import {Typography, Box, List, ListItem, ListItemText, Divider} from '@mui/material';
import {Booking, FormContent, TimeSlot, WorkShift} from './interface';

import "../../css/formSummary.css";
import React from "react";
import {PRIORITIES} from "./constants";


function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

function getShiftAndTimeslot(work_shifts: WorkShift[], timeslot_id: number) {
    const shift = work_shifts.find(shift => shift.time_slots.find((slot: TimeSlot) => slot.id === timeslot_id));
    const timeslot = shift?.time_slots.find(slot => slot.id === timeslot_id);
    return {shift, timeslot};
}

interface IProps {
    booking: Booking;
    formContent: FormContent;
}

function FormSummary(props: IProps) {
    const {
        ticket_id,
        beverage_id,
        timeslot_priority_1,
        timeslot_priority_2,
        timeslot_priority_3,
        material_ids,
        supporter_buddy,
        amount_shifts,
        total_price,

    } = props.booking;
    const ticket = findItemById(props.formContent.ticket_options, ticket_id);
    const beverage = findItemById(props.formContent.beverage_options, beverage_id);
    const food = findItemById(props.formContent.food_options, props.booking.food_id);
    const shift_slot_1 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_1);
    const shift_slot_2 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_2);
    const shift_slot_3 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_3);
    const materials = material_ids.map(id => findItemById(props.formContent.materials, id));
    const personalInfoKeys = ['first_name', 'last_name', 'email', 'phone'];
    const personalInfoValues = ['Vorname', 'Nachname', 'E-Mail', 'Telefon'];


    return (
        <Box sx={{mt: 3, p: {xs: 1, sm:2}, borderRadius: '5px'}}>
            <Typography variant="h6" component="div" sx={{mb: 1}}>
                Persönliche Informationen
            </Typography>
            <List dense={true} className={"summary-list-personal"}>

                {/* Personal Details */}
                {Object.keys(props.booking).map((key, index) => {
                    if (personalInfoKeys.includes(key)) {
                        return (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={<Typography color={"text.primary"} variant="subtitle1" component="div">
                                        <strong>{personalInfoValues[index]}: </strong> <Typography
                                        color={"text.secondary"}
                                        display={"inline"}>{props.booking[key as keyof Booking]}</Typography>
                                    </Typography>}
                                />
                            </ListItem>
                        )
                    }
                    return null;
                })}
            </List>
            <Divider sx={{width: '100%', margin: '1em 0'}}/>
            <Typography variant="h6" component="div" sx={{mt: 2, mb: 1}}>
                Buchungsdetails
            </Typography>
			<List>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="h5" color="text.primary">
                            <strong>Dein Beitrag: &nbsp;<Typography variant="h5" display={"inline"}
                                                              color={"text.secondary"}>{total_price}€</Typography></strong>
                        </Typography>}
                    />
                </ListItem>
            </List>
            <List className={"summary-list-booking"} dense={true}>

                <ListItem>
                    <ListItemText
                        primary={<Typography color={"text.primary"}
                                             variant="subtitle1"><strong>Teilnahmeoption:  </strong>
                            <Typography variant="body1" color={"text.secondary"}
                                        display={"inline"}>{ticket?.title} - {ticket?.price}€</Typography>
                        </Typography>
                        }
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="subtitle1" color={"text.primary"}><strong>Bierflatrate:  </strong>
                            <Typography variant="body1" color={"text.secondary"}
                                        display={"inline"}>{beverage !== undefined ? beverage.title + " - " + beverage.price + "€" : "Keine"}</Typography>
                        </Typography>}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="subtitle1" color={"text.primary"}><strong>Essensauswahl:  </strong>
                            <Typography variant="body1" color={"text.secondary"}
                                        display={"inline"}>{food !== undefined ? food.title + " - " + food.price + "€" : "Keine"}</Typography>
                        </Typography>}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="subtitle1" color={"text.primary"}><strong>Support
                            Prioritäten:</strong></Typography>}
                        secondary={
                            <Typography variant="body1" component="div" color={"text.secondary"}>
                                {(shift_slot_1 !== undefined && shift_slot_1.shift !== undefined && shift_slot_1.timeslot !== undefined) ?
                                    (PRIORITIES.FIRST + ": " + shift_slot_1.shift.title + ", " + shift_slot_1.timeslot.title + " " + shift_slot_1.timeslot.start_time + " - " + shift_slot_1.timeslot.end_time)
                                    : ""}
                                <br/>
                                {(shift_slot_2 !== undefined && shift_slot_2.shift !== undefined && shift_slot_2.timeslot !== undefined) ?
                                    (PRIORITIES.SECOND + ": " + shift_slot_2.shift.title + ", " + shift_slot_2.timeslot.title + " " + shift_slot_2.timeslot.start_time + " - " + shift_slot_2.timeslot.end_time)
                                    : ""}
                                <br/>
                                {(shift_slot_3 !== undefined && shift_slot_3.shift !== undefined && shift_slot_3.timeslot !== undefined) ?
                                    (PRIORITIES.THIRD + ": " + shift_slot_3.shift.title + ", " + shift_slot_3.timeslot.title + " " + shift_slot_3.timeslot.start_time + " - " + shift_slot_3.timeslot.end_time)
                                    : ""}
                            </Typography>}
                    />
                </ListItem>
                <ListItem>
                    <Typography color={"text.primary"}>Supporter Buddy: <Typography color={"text.secondary"}>{supporter_buddy}</Typography>
                        <br/>
                        Deine Anzahl Schichten: <Typography variant="h6" component="span"
                                                            color={"text.secondary"}>{amount_shifts}</Typography></Typography>
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography variant="subtitle1"
                                             color={"text.primary"}><strong>Ich bringe mit:</strong></Typography>}
                        secondary={
                            <Typography variant="body1" color={"text.secondary"}>
                                {materials.map(material => material?.title).join(', ')}
                            </Typography>}
                    />
                </ListItem>
            </List>
        </Box>
    )
        ;
}

export default FormSummary;
