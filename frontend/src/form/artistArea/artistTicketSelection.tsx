// frontend/src/form/artistArea/artistTicketSelection.tsx

import React from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper, Box } from "@mui/material";
import { ArtistFormProps } from './artistFormContainer';

function ArtistTicketForm(props: ArtistFormProps) {
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Bitte wähle die Tage aus, an denen du am Festival teilnehmen wirst. Als Künstler*in ist dein Eintritt kostenlos.
                </Typography>

                <FormControl component="fieldset" error={!!props.formValidation.ticket_id} required>
                    <RadioGroup
                        name="ticketOptions"
                        value={props.currentBooking.ticket_id}
                        onChange={handleRadioChange}
                    >
                        {props.formContent.ticket_options.map((option) => (
                            <FormControlLabel
                                sx={{ padding: "0.5em 0" }}
                                key={option.id}
                                value={option.id}
                                control={<Radio />}
                                label={`${option.title} - Künstler-Pass (kostenlos)`}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Paper>
        </Box>
    );
}

export default ArtistTicketForm;