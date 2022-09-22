import React, { useState } from 'react'
import { useLoginMutation } from '../generated/graphql'
import styles from '../styles/login.module.css'
import Router from 'next/router'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'

interface loginProps {

}

const Login: React.FC<loginProps> = ({}) => {
    const [,login] = useLoginMutation();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
	const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // called when user clicks "login" button
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // No Page Refresh

		const response = await login({usernameOrEmail, password});

        // error was returned
        if (response.data?.login.errors) {
            // update error message
            const newErrorMessage = response.data.login.errors[0].message
            setErrorMessage(newErrorMessage);
        // no errors, successful login
        } else {
            // reset ui, reroute to home page
            setUsernameOrEmail("");
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

                {/* Username/Email Input */}
                <h3 className={styles.login__inputHeader}>Username or Email</h3>
                <input value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} placeholder="Username/Email..." type="text"/>
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

export default withUrqlClient(createUrqlClient)(Login);