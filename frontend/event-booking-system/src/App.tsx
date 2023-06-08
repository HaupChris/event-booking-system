import React, {useEffect, useState} from 'react';
import {BrowserRouter, BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import PasswordPage from "./form/passwordPage";
import NameAndAddressForm from "./form/nameAndAddress";
import {AuthContext, PasswordContext} from "./AuthContext";
import {FormContainer} from "./form/formContainer";

const App = () => {
	const [auth, setAuth] = useState(false);
	const [password, setPassword] = useState('');

	useEffect(() => {
		fetch("/password")
			.then(response => response.text())
			.then(data => setPassword(data));
	}, []);

	return <AuthContext.Provider value={{auth, setAuth}}>
		<PasswordContext.Provider value={{password, setPassword}}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<PasswordPage/>}/>
					<Route path="/form" element={auth ? <FormContainer/> : <Navigate replace to="/"/>}/>
					<Route path="*" element={<PasswordPage/>}/>
				</Routes>
			</BrowserRouter>
		</PasswordContext.Provider>
	</AuthContext.Provider>;
};

export default App;
