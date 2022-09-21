import React, { useState } from 'react'
import { useLoginMutation } from '../generated/graphql'
import styles from '../styles/login.module.css'
import Router from 'next/router'

interface loginProps {

}

const Login: React.FC<loginProps> = ({}) => {
    const [,login] = useLoginMutation();
    const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // called when user clicks "login" button
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // No Page Refresh

		const response = await login({username, password});

        // error was returned
        if (response.data?.login.errors) {
            // update error message
            const newErrorMessage = response.data.login.errors[0].message
            setErrorMessage(newErrorMessage);
        // no errors, successful login
        } else {
            // reset ui, reroute to home page
            setUsername("");
            setPassword("");
            setErrorMessage("Success! Logging in...");
            Router.push("/");
        }
	}

    return(
        <div className={styles.login}>
            <form>
                {/* Title */}
                <h2 className={styles.login__title}>Login</h2>

                {/* Username Input */}
                <h3 className={styles.login__inputHeader}>Username</h3>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username..." type="text"/>
                {/* Password Input */}
                <h3 className={styles.login__inputHeader}>Password</h3>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." type="password"/>
            
                {/* Submit Button */}
                <button onClick={handleSubmit} type="submit">Login</button>
                {/* Error Messages */}
                <h3 className={styles.login__error}>{errorMessage}</h3>
            </form>
        </div>
    );
}

export default Login;