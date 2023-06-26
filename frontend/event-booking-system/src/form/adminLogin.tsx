import axios from "axios";
import {useNavigate} from "react-router-dom";
import {AuthContext, TokenContext} from "../AuthContext";
import React, {useContext, useState} from "react";
import {Box} from "@mui/material";

const AdminLogin = () => {
	const [password, setPassword] = useState("");
	const {setToken} = useContext(TokenContext);
	const {isAdmin, setIsAdmin} = useContext(AuthContext);
	const navigate = useNavigate();

	const handleSubmit = () => {
		// Post the plain-text password to the server
		axios.post('/api/auth/admin', {password})
			.then(response => {
				setToken(response.data.access_token);
				setIsAdmin(true);
				navigate('/admin/dashboard');
			})
			.catch(error => {
				console.error('There was an error!', error);
			});
	};

	return <Box sx={{
		display: 'flex',
		'flexDirection': 'column',
		'alignItems': 'center',
		'justifyContent': 'center',
		height: "100vh"
	}}>
		<div className={"div-password-input"}>
			<h2>Admin Login</h2>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
			/>
			<button onClick={handleSubmit}>Submit</button>
		</div>
	</Box>;
};

export default AdminLogin;