import React from "react";
import { TextField, Typography, Paper, Box } from "@mui/material";
import { ArtistFormProps } from "./artistFormContainer";

function ArtistPersonalDetailsForm(props: ArtistFormProps) {
    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="subtitle1" align={"center"} sx={{padding: "1em 0em"}}>
                    Do, 28.08. - So, 31.08.2025
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Bitte gib deine Kontaktinformationen als Künstler*in ein.
                </Typography>

                <form>
                    <TextField
                        error={!!props.formValidation.first_name}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Vorname"
                        name="name"
                        value={props.currentBooking.first_name}
                        onChange={e => props.updateBooking("first_name", e.target.value)}
                        autoFocus
                    />
                    <TextField
                        error={!!props.formValidation.last_name}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="last_name"
                        label="Nachname"
                        id="last_name"
                        value={props.currentBooking.last_name}
                        onChange={e => props.updateBooking("last_name", e.target.value)}
                    />
                    <TextField
                        error={!!props.formValidation.email}
                        type={"email"}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="email"
                        label="E-Mail (für deine Bestätigung)"
                        id="email"
                        value={props.currentBooking.email}
                        onChange={e => props.updateBooking("email", e.target.value)}
                    />
                    <TextField
                        error={!!props.formValidation.phone}
                        type={"tel"}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="phone"
                        label="Telefon"
                        id="phone"
                        value={props.currentBooking.phone}
                        onChange={e => props.updateBooking("phone", e.target.value)}
                    />
                </form>
            </Paper>
        </Box>
    );
}

export default ArtistPersonalDetailsForm;