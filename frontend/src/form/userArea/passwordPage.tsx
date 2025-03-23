import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext, TokenContext} from "../../AuthContext";

const SHA256 = require("crypto-js/sha256");
import axios from "axios";
import {Alert, Box, Button, Snackbar, TextField, Typography} from "@mui/material";

import "../../css/formContainer.css"

function PasswordPage() {
	const [password, setPassword] = useState('');
	const [display, setDisplay] = useState(false);
	const {auth, setAuth} = useContext(AuthContext);
	const {token, setToken} = useContext(TokenContext);
	const navigate = useNavigate();
	const [passwordIsWrong, setPasswordIsWrong] = useState(false);

	const handleSubmit = () => {

		// Post the plain-text password to the server
		axios.post('/api/auth', {password})
			.then(response => {
				setToken(response.data.access_token);
				setAuth(true);
				navigate('/form');
			})
			.catch(error => {
				setPasswordIsWrong(true);
			});
	};

	const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setPasswordIsWrong(false);
	};

	return <Box sx={{
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: "100vh",
	}}>
		{!display && (
			<Box sx={{position: "absolut", top: "10%"}}>
				<Typography variant={"h6"} align={"center"} sx={{marginBottom:"1em", backdropFilter: 'blur(5px)'}}>Wer hat mehr Arme, eine Qualle oder ein Tausendfüßler?</Typography>
				<Box sx={{display: "flex", width:{xs: '90%', sm: '100%'}, justifyContent: "center"}}>
					<Button variant="contained" color={"primary"} sx={{marginRight: "2em"}} onClick={() => {
					}}>Ein Tausendfüßler</Button>
					<Button variant="contained" color={"secondary"} onClick={() => setDisplay(true)}>Eine Qualle</Button>
				</Box>

			</Box>)}

		{display && (
			<div className={"div-password-input"}>
				<TextField
					sx={{marginBottom: '1em'}}
					label="Password"
					type="password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							handleSubmit();
						}
					}}
				/>
				<Button variant={"contained"} onClick={() => handleSubmit()}>Einloggen</Button>
				<Snackbar
					anchorOrigin={{vertical: 'top', horizontal: 'center'}}
					open={passwordIsWrong}
					autoHideDuration={4000}
					onClose={handleClose}
				>
					<Alert onClose={handleClose} severity="error" sx={{width: '100%'}}>
						Falsches Passwort!
					</Alert>
				</Snackbar>
			</div>
		)}
	</Box>;
}

export default PasswordPage;
