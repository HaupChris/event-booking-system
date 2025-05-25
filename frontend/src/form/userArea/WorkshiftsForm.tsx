import React, {useEffect, useState} from "react";
import {FormProps} from "./UserRegistrationFormContainer";
import WorkShift from "../../components/core/inputs/workShift";
import {WorkShift as WorkShiftType} from '../userArea/interface';
import {
    Box,
    Divider,
    List,
    Typography,
    alpha
} from "@mui/material";
import {Engineering, PersonAdd} from "@mui/icons-material";
import {PRIORITIES} from "./constants";

import '../../css/workShift.css';

import {TimeSlot} from "./interface";
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";
import FormCard from "../../components/core/display/FormCard";
import FormField from "../../components/core/inputs/FormField";
import WWSelect from "../../components/core/inputs/WWSelect";
import WWFAQ from "../../components/core/display/WWFAQ";
import {userAreaTexts} from "../constants/texts";

function HelpIcon() {
    return null;
}

function WorkShiftForm(props: FormProps) {
    const [availablePriorities, setAvailablePriorities] = useState<string[]>([
        PRIORITIES.FIRST,
        PRIORITIES.SECOND,
        PRIORITIES.THIRD,
        "",
    ]);

    const [supporterBuddyFirstName, setSupporterBuddyFirstName] = useState(props.currentBooking.supporter_buddy.split(" ")[0]);
    const [supporterBuddyLastName, setSupporterBuddyLastName] = useState(props.currentBooking.supporter_buddy.split(" ")[1] || "");

    const numberOfShiftsOptions = [
        {value: 1, label: "1 Schicht"},
        {value: 2, label: "2 Schichten"},
        {value: 3, label: "3 Schichten"}
    ]


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


    const faqItems = [
        {
            question: "Was hat es hiermit auf sich?",
            answer: "Der Wiesenwahn ist ein nicht kommerzielles Event, das wir ohne eure Mithilfe weder stemmen, " +
                "noch genießen können. Aus diesem Grund sind wir so organisiert, das jede teilnehmende Person " +
                "mindestens eine kleine Schicht mitarbeitet. Damit nicht die ersten Registrierungen die besten Schichten abbekommen, " +
                "vergibst du Prioritäten und wir teilen nach der Anmeldephase alles zu." +
                "Bei Überbelegung einer Schicht entscheidet das Los.",
        }]

    const numShiftsHelperText = "Wähle, ob du eine, zwei oder drei Schichten übernehmen möchtest. Anhand deiner Prioritäten bekommst du dann mehrere Schichten zugeteilt."

    function updateAmountShifts(newValue: string | number | null) {
        if (newValue === null || newValue === undefined) {
            return
        } else {
            props.updateBooking("amount_shifts", newValue as number)
        }
    }

    function compareWorkshiftsByNumBooked(shift_a: WorkShiftType, shift_b: WorkShiftType) {
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
    }

    return <SpacePanelLayout
        missionBriefing={userAreaTexts.workshiftsForm.missionBriefing}
        footerId={userAreaTexts.workshiftsForm.footerId}
    >
        <WWFAQ
            items={faqItems}
            title=""
            description=""
            icon={<HelpIcon/>}
            sx={{mb: 3}}
        />
        <FormCard
            icon={<Engineering sx={{color: '#64b5f6', mr: 1}}/>}
            title={userAreaTexts.workshiftsForm.shiftsCountTitle}
            tooltipText={userAreaTexts.workshiftsForm.shiftsCountHelperText}
            tooltipPlacement={"top-start"}
        >
            <Box display="flex" alignItems="center" justifyContent="center" sx={{paddingX: 2}}>
                <WWSelect
                    options={numberOfShiftsOptions}
                    value={props.currentBooking.amount_shifts}
                    onChange={updateAmountShifts}
                />
            </Box>
        </FormCard>
        <FormCard
            title={userAreaTexts.workshiftsForm.crewPartner}
            description={userAreaTexts.workshiftsForm.crewPartnerDescription}
            icon={<PersonAdd sx={{color: '#64b5f6', mr: 1}}/>}
            sx={{marginTop: 3, marginBottom: 3}}
        >
            <Box sx={{
                display: "flex",
                flexDirection: {xs: "column", sm: "row"},
                marginX: 2,
                gap: 2
            }}>
                <FormField
                    error={!!props.formValidation.supporter_buddy}
                    id="first_name"
                    label="Vorname"
                    name="first_name"
                    value={supporterBuddyFirstName}
                    onChange={(e) => setSupporterBuddyFirstName(e.target.value)}
                />
                <FormField
                    error={!!props.formValidation.supporter_buddy}
                    id="first_name"
                    label="Nachname"
                    name="first_name"
                    value={supporterBuddyLastName}
                    onChange={(e) => setSupporterBuddyLastName(e.target.value)}
                />
            </Box>
        </FormCard>


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
            {props.formContent.work_shifts.filter((workshift) => workshift.title.toLowerCase() !== "already employed")
                .sort(compareWorkshiftsByNumBooked)
                .concat(props.formContent.work_shifts.filter((workshift) => workshift.title.toLowerCase() === "already employed"))
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
    </SpacePanelLayout>
}

export default WorkShiftForm;