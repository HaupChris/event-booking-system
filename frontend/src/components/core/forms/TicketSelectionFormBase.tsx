import React from "react";
import {FormControl, RadioGroup, Box} from "@mui/material";
import SpacePanelLayout from "../layouts/SpacePanelLayout";
import TicketOptionComponent from "../display/TicketOption";
import {TicketOption} from "../../../form/userArea/interface";
import {calculateDayVisitors, getMaxCapacityPerDay} from "../utils/CalculateNumberOfVisitors";


interface TicketSelectionTextProps {
    missionBriefing: string;
    footerId: string;
    title: string;
}

interface TicketSelectionFormBaseProps {
    currentBooking: {
        ticket_id: number;
    };
    updateBooking: (key: any, value: any) => void;
    formContent: {
        ticket_options: TicketOption[];
    };
    formValidation: { [key: string]: string | undefined };
    texts: TicketSelectionTextProps;
}

function TicketSelectionFormBase(props: TicketSelectionFormBaseProps) {
    const { texts } = props;

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
    };

    const { visitorsThursday, visitorsFriday, visitorsSaturday } = calculateDayVisitors(props.formContent);
    const maxCapacityPerDay = getMaxCapacityPerDay(props.formContent);

    // Calculate remaining capacity per day
    const remainingThursday = Math.max(0, maxCapacityPerDay - visitorsThursday);
    const remainingFriday = Math.max(0, maxCapacityPerDay - visitorsFriday);
    const remainingSaturday = Math.max(0, maxCapacityPerDay - visitorsSaturday);

    // Calculate availability for each ticket option
    const getTicketAvailability = (option: TicketOption) => {
        const title = option.title.toLowerCase();
        let maxPossible = maxCapacityPerDay; // Start with max possible

        // Limit by each day this ticket includes
        if (title.includes('do')) {
            maxPossible = Math.min(maxPossible, remainingThursday);
        }
        if (title.includes('fr')) {
            maxPossible = Math.min(maxPossible, remainingFriday);
        }
        if (title.includes('sa')) {
            maxPossible = Math.min(maxPossible, remainingSaturday);
        }

        const remaining = Math.max(0, maxPossible);
        const isSoldOut = remaining === 0;
        const isLowStock = remaining <= 15 && remaining > 0;

        return {
            remaining,
            isSoldOut,
            isLowStock
        };
    };

    return <SpacePanelLayout
        missionBriefing={texts.missionBriefing}
        footerId={texts.footerId}
    >
        <Box sx={{p: {xs: 1.5, sm: 2}}}>
            <FormControl component="fieldset" error={!!props.formValidation.ticket_id} required fullWidth>
                <RadioGroup
                    name="ticketOptions"
                    value={props.currentBooking.ticket_id}
                    onChange={handleRadioChange}
                >
                    {props.formContent.ticket_options.map((option: TicketOption) => {
                        const availability = getTicketAvailability(option);

                        return (
                            <TicketOptionComponent
                                key={option.id}
                                currentBooking={props.currentBooking}
                                option={option}
                                soldOut={availability.isSoldOut}
                                remaining={availability.remaining}
                                isLowStock={availability.isLowStock}
                                maxCapacity={maxCapacityPerDay}
                            />
                        );
                    })}
                </RadioGroup>
            </FormControl>
        </Box>
    </SpacePanelLayout>
}

export default TicketSelectionFormBase;