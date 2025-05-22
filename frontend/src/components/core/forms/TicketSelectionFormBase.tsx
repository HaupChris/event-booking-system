import React from "react";
import {FormControl, RadioGroup, Box} from "@mui/material";
import SpacePanelLayout from "../layouts/SpacePanelLayout";
import TicketOptionComponent from "../display/TicketOption";
import {TicketOption} from "../../../form/userArea/interface";


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
    const { texts,  } = props;
    const maxNumTicketsPerDay = Math.max(...props.formContent.ticket_options.map((ticketOption) => ticketOption.amount))

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
    };

    let visitorsThursday = 0;
    let visitorsFriday = 0;
    let visitorsSaturday = 0;

    props.formContent.ticket_options.forEach((option: TicketOption) => {
        if (option.title.includes('Do')) {
            visitorsThursday += option.num_booked;
        }
        if (option.title.includes('Fr')) {
            visitorsFriday += option.num_booked;
        }
        if (option.title.includes('Sa')) {
            visitorsSaturday += option.num_booked;
        }
    });

    function dayIsSoldOut(ticketTitle: string) {
        let isSoldOut = false;

        if (ticketTitle.includes('Donnerstag')) {
            isSoldOut = isSoldOut || visitorsThursday >= maxNumTicketsPerDay;
        }
        if (ticketTitle.includes('Freitag')) {
            isSoldOut = isSoldOut || visitorsFriday >= maxNumTicketsPerDay;
        }
        if (ticketTitle.includes('Samstag')) {
            isSoldOut = isSoldOut || visitorsSaturday >= maxNumTicketsPerDay;
        }
        return isSoldOut;
    }

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
                        const isSoldOut = dayIsSoldOut(option.title);
                        return (
                            <TicketOptionComponent key={option.id}
                                                   currentBooking={props.currentBooking}
                                                   option={option}
                                                   soldOut={isSoldOut}/>
                        );
                    })}
                </RadioGroup>
            </FormControl>
        </Box>
    </SpacePanelLayout>
}

export default TicketSelectionFormBase;