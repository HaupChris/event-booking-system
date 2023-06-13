import React, {useContext, useState} from "react";
import {AuthContext, PasswordContext} from "../AuthContext";
import {useNavigate} from "react-router-dom";
import {Button, Container, TextField, Typography} from "@mui/material";
import {FormProps} from "./formContainer";


function NameAndAddressForm(props: FormProps) {
    const {auth} = useContext(AuthContext);
    const {password} = useContext(PasswordContext);
    const history = useNavigate();

    return auth ? (
        <Container component="main" maxWidth="xs">
            <Typography component="h1" variant="h5">
                Name and Address Details
            </Typography>
            <form>
                <TextField
                    error={!! props.formValidation.first_name}
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
                    error={!! props.formValidation.last_name}
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
                    error={!! props.formValidation.email}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="email"
                    label="E-Mail"
                    id="email"
                    value={props.currentBooking.email}
                    onChange={e => props.updateBooking("email", e.target.value)}
                />
                <TextField
                    error={!! props.formValidation.phone}
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
                <TextField
                    error={!! props.formValidation.street}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="street"
                    label="Straße"
                    id="street"
                    value={props.currentBooking.street}
                    onChange={e => props.updateBooking("street", e.target.value)}
                />
                <TextField
                    error={!! props.formValidation.postal_code}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="postal_code"
                    label="PLZ"
                    id="postal_code"
                    value={props.currentBooking.postal_code}
                    onChange={e => props.updateBooking("postal_code", e.target.value)}
                />
                <TextField
                    error={!! props.formValidation.city}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="city"
                    label="Stadt"
                    id="city"
                    value={props.currentBooking.city}
                    onChange={e => props.updateBooking("city", e.target.value)}
                />
            </form>
        </Container>
    ) : null;
}

export default NameAndAddressForm;