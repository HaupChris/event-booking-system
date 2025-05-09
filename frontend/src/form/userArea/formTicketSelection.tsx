import React from "react";
import {FormControl, RadioGroup, Typography, Paper, Box, alpha} from "@mui/material";
import {FormProps} from './formContainer';
import {FormContent, TicketOption} from './interface';
import TicketOptionComponent from "../../components/core/display/TicketOption";
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";

interface TicketFormProps extends FormProps {
    formContent: FormContent;
}


function TicketForm(props: TicketFormProps) {
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
    };

    const maxNumTicketsPerDay = 120;
    let visitorsThursday = 0;
    let visitorsFriday = 0;
    let visitorsSaturday = 0;

    props.formContent.ticket_options.forEach((option: TicketOption) => {
        if (option.title.includes('Donnerstag')) {
            visitorsThursday += option.num_booked;
        }
        if (option.title.includes('Freitag')) {
            visitorsFriday += option.num_booked;
        }
        if (option.title.includes('Samstag')) {
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
        missionBriefing="Wähle die Tage aus, an denen du am Festival teilnehmen möchtest. Sonntag ist Abbautag."
        footerId="WWWW-MISSION-CONTROL // ID-2025"
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

export default TicketForm;