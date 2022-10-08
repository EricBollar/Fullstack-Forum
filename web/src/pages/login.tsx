import React, { useState } from 'react'
import { useLoginMutation } from '../generated/graphql'
import styles from '../styles/login.module.css'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'
import Navbar from '../components/navbar'

interface loginProps {

}

const Login: React.FC<loginProps> = ({}) => {
    const router = useRouter();
    const [,login] = useLoginMutation();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
	const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // called when user clicks "login" button
    const handleSubmit = async (event: React.MouseEvent<HTMLDivElement>) => {
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

            // reroute to either next (if sent here by say create-post)
            if (typeof router.query.next === "string") {
                router.push(router.query.next);
            // or home page by default
            } else {
                router.push("/");
            }
        }
	}

    return(
        <>
        <Navbar />
        <div className={styles.login}>
            <div className={styles.login__form}>
                {/* Title */}
                <h2 className={styles.login__title}>Login</h2>

                {/* Username/Email Input */}
                <input value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} placeholder="Username/Email..." type="text"/>
                {/* Password Input */}
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." type="password"/>
            
                {/* Submit Button */}
                <div className={styles.login__button} onClick={handleSubmit}>Login</div>

                {/* This won't work unless I setup an email and I don't care for this project. */}
                {/* <a className={styles.login__forgotpassword} href="/forgot-password">Forgot Password?</a> */}

                {/* Error Messages */}
                <h3 className={styles.login__error}>{errorMessage}</h3>
            </div>
        </div>
        </>
    );
}

export default withUrqlClient(createUrqlClient)(Login);