import React from 'react';
import {
    Typography,
    Box,
    Grid,
    Chip,
    alpha,
} from '@mui/material';
import {Booking, FormContent, TimeSlot, WorkShift} from './interface';
import "../../css/formSummary.css";
import {PRIORITIES} from "./constants";
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
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";
import PriorityTimeSlot from "../../components/core/display/PriorityTimeSlot";
import InfoPair from "../../components/core/display/InfoPair";
import FormCard from "../../components/core/display/FormCard";
import {userAreaTexts} from "../constants/texts";

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

function getShiftAndTimeslot(work_shifts: WorkShift[], timeslot_id: number) {
    const shift = work_shifts.find(shift => shift.time_slots.find((slot: TimeSlot) => slot.id === timeslot_id));
    const timeslot = shift?.time_slots.find(slot => slot.id === timeslot_id);
    return {shift, timeslot};
}

interface SummaryFormProps {
    currentBooking: Booking;
    formContent: FormContent;
}

function SummaryForm({currentBooking, formContent}: SummaryFormProps) {
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
    } = currentBooking;

    const ticket = findItemById(formContent.ticket_options, ticket_id);
    const beverage = findItemById(formContent.beverage_options, beverage_id);
    const food = findItemById(formContent.food_options, food_id);
    const shift_slot_1 = getShiftAndTimeslot(formContent.work_shifts, timeslot_priority_1);
    const shift_slot_2 = getShiftAndTimeslot(formContent.work_shifts, timeslot_priority_2);
    const shift_slot_3 = getShiftAndTimeslot(formContent.work_shifts, timeslot_priority_3);
    const materials = material_ids.map(id => findItemById(formContent.materials, id)).filter(Boolean);

    // Helper to render an item with price
    const renderPriceItem = (item: any) => {
        return item ? (
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
                    {item.title}
                </Typography>
                <Chip
                    label={`${item.price}€`}
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
                Nicht ausgewählt
            </Typography>
        );
    };

    return (
        <SpacePanelLayout
            missionBriefing={userAreaTexts.summaryForm.missionBriefing}
            footerId={userAreaTexts.summaryForm.footerId}
            title={userAreaTexts.summaryForm.title}
        >
            {/* Price Overview */}
            <FormCard
                title={userAreaTexts.summaryForm.missionContribution}
                icon={<EuroIcon/>}
                selected={true}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{color: '#64b5f6'}}
                    >
                        {total_price}€
                    </Typography>
                </Box>
            </FormCard>

            {/* Personal Details */}
            <FormCard
                title={userAreaTexts.summaryForm.personalData}
                icon={<PersonIcon/>}
            >
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
                        <InfoPair
                            label="Email"
                            value={email}
                            icon={<EmailIcon/>}
                        />
                        <InfoPair
                            label="Telefon"
                            value={phone}
                            icon={<PhoneIcon/>}
                        />
                    </Grid>
                </Grid>
            </FormCard>

            {/* Ticket Information */}
            <FormCard
                title={userAreaTexts.summaryForm.participationOption}
                icon={<ConfirmationNumberIcon/>}
            >
                {renderPriceItem(ticket)}
            </FormCard>

            {/* Beverage and Food Info */}
            <FormCard
                title={userAreaTexts.summaryForm.catering}
                icon={<RestaurantIcon/>}
            >
                {/* Beverage */}
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
                            {userAreaTexts.summaryForm.beverageTitle}
                        </Typography>
                    </Box>
                    {renderPriceItem(beverage)}
                </Box>

                {/* Food */}
                <Box>
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
                            {userAreaTexts.summaryForm.foodTitle}
                        </Typography>
                    </Box>
                    {renderPriceItem(food)}
                </Box>
            </FormCard>

            {/* Work Shifts */}
            <FormCard
                title={userAreaTexts.summaryForm.deploymentPlan}
                icon={<WorkIcon/>}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 'medium',
                        mb: 2,
                        color: alpha('#fff', 0.8)
                    }}
                >
                    {userAreaTexts.summaryForm.supportPriorities}
                </Typography>

                {/* Priority 1 */}
                {(shift_slot_1?.shift && shift_slot_1?.timeslot) && (
                    <PriorityTimeSlot
                        priority={PRIORITIES.FIRST}
                        status="success"
                        shiftTitle={shift_slot_1.shift.title}
                        timeSlotTitle={shift_slot_1.timeslot.title}
                        startTime={shift_slot_1.timeslot.start_time}
                        endTime={shift_slot_1.timeslot.end_time}
                    />
                )}

                {/* Priority 2 */}
                {(shift_slot_2?.shift && shift_slot_2?.timeslot) && (
                    <PriorityTimeSlot
                        priority={PRIORITIES.SECOND}
                        status="info"
                        shiftTitle={shift_slot_2.shift.title}
                        timeSlotTitle={shift_slot_2.timeslot.title}
                        startTime={shift_slot_2.timeslot.start_time}
                        endTime={shift_slot_2.timeslot.end_time}
                    />
                )}

                {/* Priority 3 */}
                {(shift_slot_3?.shift && shift_slot_3?.timeslot) && (
                    <PriorityTimeSlot
                        priority={PRIORITIES.THIRD}
                        status="warning"
                        shiftTitle={shift_slot_3.shift.title}
                        timeSlotTitle={shift_slot_3.timeslot.title}
                        startTime={shift_slot_3.timeslot.start_time}
                        endTime={shift_slot_3.timeslot.end_time}
                    />
                )}

                {/* Support info */}
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
                            {userAreaTexts.summaryForm.supportInfo}
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <InfoPair
                                label="Supporter Buddy"
                                value={supporter_buddy || userAreaTexts.summaryForm.noSupportBuddy}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <InfoPair
                                label={userAreaTexts.summaryForm.shiftsCount} value={
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#64b5f6',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {amount_shifts}
                                </Typography>
                            }
                            />
                        </Grid>
                    </Grid>
                </Box>
            </FormCard>

            {/* Materials */}
            <FormCard
                title={userAreaTexts.summaryForm.equipment}
                icon={<BackpackIcon/>}
            >
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
                            {userAreaTexts.summaryForm.bringingItems}
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
                        {userAreaTexts.summaryForm.noMaterialsSelected}
                    </Typography>
                )}
            </FormCard>
        </SpacePanelLayout>
    );
}

export default SummaryForm;