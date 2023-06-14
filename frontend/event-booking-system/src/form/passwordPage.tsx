import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext, TokenContext} from "../AuthContext";

const SHA256 = require("crypto-js/sha256");

import axios from "axios";
import {Box, Button, TextField} from "@mui/material";

function hashPassword(password: string) {
	return SHA256(password).toString();
}

function PasswordPage() {
	const [password, setPassword] = useState('');
	const [display, setDisplay] = useState(false);
	const {auth, setAuth} = useContext(AuthContext);
	const {token, setToken} = useContext(TokenContext);
	const navigate = useNavigate();

	const handleSubmit = () => {

		// Post the plain-text password to the server
		axios.post('/api/auth', {password})
			.then(response => {
				setToken(response.data.access_token);
				setAuth(true);
				navigate('/form');
			})
			.catch(error => {
				console.error('There was an error!', error);
				alert('Incorrect password');
			});
	};

	return <Box sx={{
		display: 'flex',
		'flex-direction': 'column',
		'align-items': 'center',
		'justify-content': 'center',
		height: "100vh"
	}}>
		{! display && (
		<div>
			<p>Kommst du mit uns in den Kanienchenbau?</p>

			<Button variant="contained" style={{backgroundColor: 'red', 'marginRight': '3em'}} onClick={() => {}}>Red Pill</Button>
			<Button variant="contained" style={{backgroundColor: 'blue'}} onClick={() => setDisplay(true)}>Blue Pill</Button>
		</div>)}

		{display && (
			<>
				<TextField
					id="outlined-password-input"
					label="Password"
					type="password"
					autoComplete="current-password"
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				<Button variant="contained" onClick={() => handleSubmit()}>Einloggen</Button>
			</>
		)}
	</Box>;
}

export default PasswordPage;
