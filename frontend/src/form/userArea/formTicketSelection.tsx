import React from "react";
import {FormControl, RadioGroup, Typography, Paper, Box, alpha} from "@mui/material";
import {FormProps} from './formContainer';
import {FormContent, TicketOption} from './interface';
import TicketOptionComponent from "../../components/core/display/TicketOption";

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

    return (
        <Box sx={{width: '98%', maxWidth: 600, mx: 'auto'}}>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    p: 0,
                    borderRadius: '14px',
                    background: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                }}
            >
                {/* Decorative top pattern */}
                <Box sx={{
                    width: '100%',
                    height: '6px',
                    background: 'linear-gradient(90deg, #1e88e5, #64b5f6, #bbdefb, #1e88e5)',
                    backgroundSize: '300% 100%',
                    animation: 'gradientMove 12s linear infinite',
                    '@keyframes gradientMove': {
                        '0%': {backgroundPosition: '0% 0%'},
                        '100%': {backgroundPosition: '300% 0%'},
                    }
                }}/>

                {/* Mission Briefing */}
                <Box sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: alpha('#000', 0.3),
                    borderLeft: '4px solid',
                    borderColor: '#1e88e5',
                    mx: {xs: 1, sm: 2},
                    my: 2,
                    borderRadius: '0 8px 8px 0',
                }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha('#fff', 0.9),
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                        }}
                    >
                        <span style={{color: '#64b5f6'}}>MISSION:</span> Wähle die Tage aus, an denen du am Festival
                        teilnehmen möchtest. Sonntag ist Abbautag.
                    </Typography>
                </Box>

                {/* Ticket selection */}
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

                {/* Footer with space station ID */}
                <Box sx={{
                    p: 1.5,
                    backgroundColor: '#041327',
                    borderTop: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: 'monospace',
                            color: alpha('#fff', 0.7),
                            letterSpacing: '1px',
                            fontSize: '0.7rem'
                        }}
                    >
                        WWWW-MISSION-CONTROL // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default TicketForm;