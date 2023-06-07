import React, {useContext, useState} from "react";
import {AuthContext, PasswordContext} from "../AuthContext";
import {useNavigate} from "react-router-dom";
import {Button, Container, TextField, Typography} from "@mui/material";

const NameAndAddressForm = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const { auth } = useContext(AuthContext);
  const { password } = useContext(PasswordContext);
  const history = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch("/submitForm?key=" + password, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, address })
    })
      .then(response => response.text())
      .then(data => console.log(data));
  };

  return auth ? (
    <Container component="main" maxWidth="xs">
      <Typography component="h1" variant="h5">
        Name and Address Details
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="name"
          label="Name"
          name="name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="address"
          label="Address"
          id="address"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Next
        </Button>
      </form>
    </Container>
  ) : null;
};

export default NameAndAddressForm;
