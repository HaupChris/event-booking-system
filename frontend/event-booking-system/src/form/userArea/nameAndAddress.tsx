import React, {useContext, useState} from "react";
import {AuthContext, PasswordContext} from "../../AuthContext";
import {useNavigate} from "react-router-dom";
import {Button, Container, MenuItem, TextField, Typography} from "@mui/material";
import {FormProps} from "./formContainer";


function NameAndAddressForm(props: FormProps) {
    const {auth} = useContext(AuthContext);
    const {role} = useContext(AuthContext);
    const {password} = useContext(PasswordContext);
    const history = useNavigate();

    return auth ? (
        <Container component="main" maxWidth="xs">
            <Typography variant="body1">
                Do, 28.08. - So, 31.08.2025
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
                    label="E-Mail (für deine Ticketbestätigung)"
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
                {role === "ArtistOrArtistGuest" && (
                    <TextField
                        error={!!props.formValidation.role}
                        select
                        margin="normal"
                        required
                        label="Rolle auswählen"
                        value={props.currentBooking.role}
                        onChange={(e) => props.updateBooking("role", e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="Artist">DJ oder Bandmitglied</MenuItem>
                        <MenuItem value="ArtistGuest">Gast eines Künstlers</MenuItem>
                    </TextField>
                )}


                {role === "ArtistOrArtistGuest" && (props.currentBooking.role === "ArtistGuest" || props.currentBooking.role === "Artist") && (
                    <TextField
                        required
                        error={!!props.formValidation.artist_reference}
                        label={props.currentBooking.role === "Artist" ? "Wie ist dein Band oder DJ Name?" : "Mit welcher Band oder DJ kommst du?"}
                        value={props.currentBooking.artist_reference}
                        onChange={(e) => props.updateBooking("artist_reference", e.target.value)}
                        fullWidth
                    />
                )}
            </form>


        </Container>
    ) : null;
}

export default NameAndAddressForm;