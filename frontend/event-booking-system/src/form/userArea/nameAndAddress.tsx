import React, {useContext, useState} from "react";
import {AuthContext, PasswordContext} from "../../AuthContext";
import {useNavigate} from "react-router-dom";
import {Button, Container, TextField, Typography} from "@mui/material";
import {FormProps} from "./formContainer";


function NameAndAddressForm(props: FormProps) {
    const {auth} = useContext(AuthContext);
    const {password} = useContext(PasswordContext);
    const history = useNavigate();

    return auth ? (
        <Container component="main" maxWidth="xs">
            <Typography variant="body1">
                Do, 29.08. - So, 01.09.2024
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
                    error={!! props.formValidation.phone}
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
        </Container>
    ) : null;
}

export default NameAndAddressForm;