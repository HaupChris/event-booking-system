import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Divider, Paper, Grid, Chip, Avatar } from '@mui/material';
import { Booking, FormContent, TimeSlot, WorkShift } from './interface';
import "../../css/formSummary.css";
import { PRIORITIES } from "./constants";
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
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Zusammenfassung deiner Buchung
                </Typography>

                {/* Total cost - Highlighted at the top */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 4,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <EuroIcon sx={{ mr: 1, fontSize: '2rem' }} />
                    <Typography variant="h5" fontWeight="bold">
                        Dein Beitrag: {total_price}€
                    </Typography>
                </Paper>

                {/* Personal Information Section */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1 }} /> Persönliche Informationen
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mr: 1 }}>
                                    Vorname:
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {first_name}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mr: 1 }}>
                                    Nachname:
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {last_name}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                                <Typography variant="body1" color="text.secondary">
                                    {email}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                                <Typography variant="body1" color="text.secondary">
                                    {phone}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Booking Details Section */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Buchungsdetails
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Ticket Information */}
                    <Paper elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Teilnahmeoption
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                                {ticket?.title}
                            </Typography>
                            <Chip label={`${ticket?.price}€`} color="primary" size="small" />
                        </Box>
                    </Paper>

                    {/* Beverage Information */}
                    <Paper elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocalDrinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Bierflatrate
                            </Typography>
                        </Box>

                        {beverage ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body1">
                                    {beverage.title}
                                </Typography>
                                <Chip label={`${beverage.price}€`} color="primary" size="small" />
                            </Box>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Keine Bierflatrate ausgewählt
                            </Typography>
                        )}
                    </Paper>

                    {/* Food Information */}
                    <Paper elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <RestaurantIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Essensauswahl
                            </Typography>
                        </Box>

                        {food ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body1">
                                    {food.title}
                                </Typography>
                                <Chip label={`${food.price}€`} color="primary" size="small" />
                            </Box>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Kein Essen ausgewählt
                            </Typography>
                        )}
                    </Paper>

                    {/* Work Shifts */}
                    <Paper elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Deine Support-Prioritäten
                            </Typography>
                        </Box>

                        {/* Priority 1 */}
                        {(shift_slot_1?.shift && shift_slot_1?.timeslot) && (
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Chip
                                        label="1. Priorität"
                                        size="small"
                                        color="success"
                                        sx={{ mr: 1, fontWeight: 'bold' }}
                                    />
                                    <Typography variant="body1" fontWeight="medium">
                                        {shift_slot_1.shift.title}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 4 }}>
                                    <Typography variant="body2">
                                        {shift_slot_1.timeslot.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: '0.8rem', mx: 0.5 }} />
                                        <Typography variant="body2">
                                            {shift_slot_1.timeslot.start_time} - {shift_slot_1.timeslot.end_time}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Priority 2 */}
                        {(shift_slot_2?.shift && shift_slot_2?.timeslot) && (
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Chip
                                        label="2. Priorität"
                                        size="small"
                                        color="info"
                                        sx={{ mr: 1, fontWeight: 'bold' }}
                                    />
                                    <Typography variant="body1" fontWeight="medium">
                                        {shift_slot_2.shift.title}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 4 }}>
                                    <Typography variant="body2">
                                        {shift_slot_2.timeslot.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: '0.8rem', mx: 0.5 }} />
                                        <Typography variant="body2">
                                            {shift_slot_2.timeslot.start_time} - {shift_slot_2.timeslot.end_time}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Priority 3 */}
                        {(shift_slot_3?.shift && shift_slot_3?.timeslot) && (
                            <Box sx={{ mb: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Chip
                                        label="3. Priorität"
                                        size="small"
                                        color="warning"
                                        sx={{ mr: 1, fontWeight: 'bold' }}
                                    />
                                    <Typography variant="body1" fontWeight="medium">
                                        {shift_slot_3.shift.title}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 4 }}>
                                    <Typography variant="body2">
                                        {shift_slot_3.timeslot.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: '0.8rem', mx: 0.5 }} />
                                        <Typography variant="body2">
                                            {shift_slot_3.timeslot.start_time} - {shift_slot_3.timeslot.end_time}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Paper>

                    {/* Buddy and Shift Count */}
                    <Paper elevation={1} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Support-Informationen
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Supporter Buddy:
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {supporter_buddy || "Kein Buddy angegeben"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Anzahl Schichten:
                                </Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {amount_shifts}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Materials */}
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <BackpackIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Ich bringe mit
                            </Typography>
                        </Box>

                        {materials.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {materials.map((material, index) => (
                                    <Chip
                                        key={index}
                                        label={material?.title}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Keine Materialien ausgewählt
                            </Typography>
                        )}
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );
}

export default FormSummary;