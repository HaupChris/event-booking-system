import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../AuthContext";


function PasswordPage() {
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const {setAuth} = useContext(AuthContext);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Compare the input password with your password
		if (password === 'password') {
			setAuth(true);
			navigate('/form');
		} else {
			alert('Incorrect password');
		}
	};

	return <form onSubmit={handleSubmit}>
		<label>
			Password:
			<input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
		</label>
		<input type="submit" value="Submit"/>
	</form>;

}

export default PasswordPage;
