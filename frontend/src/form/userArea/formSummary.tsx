import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { Booking, FormContent, TimeSlot, WorkShift } from './interface';
import "../../css/formSummary.css";
import { PRIORITIES } from "./constants";

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
    } = props.booking;

    const ticket = findItemById(props.formContent.ticket_options, ticket_id);
    const beverage = findItemById(props.formContent.beverage_options, beverage_id);
    const food = findItemById(props.formContent.food_options, food_id);
    const shift_slot_1 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_1);
    const shift_slot_2 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_2);
    const shift_slot_3 = getShiftAndTimeslot(props.formContent.work_shifts, timeslot_priority_3);
    const materials = material_ids.map(id => findItemById(props.formContent.materials, id)).filter(Boolean);

    return (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom align="center">Zusammenfassung deiner Buchung</Typography>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Persönliche Informationen
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <List dense={true} className={"summary-list-personal"}>
                        <ListItem>
                            <ListItemText
                                primary={<Typography color={"text.primary"} variant="subtitle1">
                                    <strong>Vorname:</strong> <Typography color={"text.secondary"} display={"inline"}>{first_name}</Typography>
                                </Typography>}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary={<Typography color={"text.primary"} variant="subtitle1">
                                    <strong>Nachname:</strong> <Typography color={"text.secondary"} display={"inline"}>{last_name}</Typography>
                                </Typography>}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary={<Typography color={"text.primary"} variant="subtitle1">
                                    <strong>E-Mail:</strong> <Typography color={"text.secondary"} display={"inline"}>{email}</Typography>
                                </Typography>}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary={<Typography color={"text.primary"} variant="subtitle1">
                                    <strong>Telefon:</strong> <Typography color={"text.secondary"} display={"inline"}>{phone}</Typography>
                                </Typography>}
                            />
                        </ListItem>
                    </List>
                </Box>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Buchungsdetails
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <List className={"summary-list-booking"} dense={true}>
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="h5" color="primary">
                                    <strong>Dein Beitrag: {total_price}€</strong>
                                </Typography>}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={<Typography color={"text.primary"} variant="subtitle1">
                                    <strong>Teilnahmeoption:</strong> <Typography variant="body1" color={"text.secondary"} display={"inline"}>{ticket?.title} - {ticket?.price}€</Typography>
                                </Typography>}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1" color={"text.primary"}>
                                    <strong>Bierflatrate:</strong> <Typography variant="body1" color={"text.secondary"} display={"inline"}>{beverage !== undefined ? beverage.title + " - " + beverage.price + "€" : "Keine"}</Typography>
                                </Typography>}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1" color={"text.primary"}>
                                    <strong>Essensauswahl:</strong> <Typography variant="body1" color={"text.secondary"} display={"inline"}>{food !== undefined ? food.title + " - " + food.price + "€" : "Keine"}</Typography>
                                </Typography>}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1" color={"text.primary"}>
                                    <strong>Support Prioritäten:</strong>
                                </Typography>}
                                secondary={
                                    <Typography variant="body1" component="div" color={"text.secondary"} sx={{ mt: 1 }}>
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
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={<Typography color={"text.primary"} variant="subtitle1">
                                    <strong>Supporter Buddy:</strong> <Typography color={"text.secondary"} component="span">{supporter_buddy}</Typography>
                                </Typography>}
                                secondary={<Typography color={"text.primary"} variant="subtitle1" sx={{ mt: 1 }}>
                                    <strong>Deine Anzahl Schichten:</strong> <Typography variant="h6" component="span" color={"text.secondary"}>{amount_shifts}</Typography>
                                </Typography>}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1" color={"text.primary"}>
                                    <strong>Ich bringe mit:</strong>
                                </Typography>}
                                secondary={
                                    <Typography variant="body1" color={"text.secondary"} sx={{ mt: 1 }}>
                                        {materials.length > 0 ?
                                            materials.map(material => material?.title).join(', ') :
                                            "Keine Materialien ausgewählt"}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>
        </Box>
    );
}

export default FormSummary;