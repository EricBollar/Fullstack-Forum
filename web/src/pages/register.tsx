import React, { useState } from 'react'
import { useRegisterMutation } from '../generated/graphql'
import styles from '../styles/register.module.css'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'
import Navbar from '../components/navbar'

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [,register] = useRegisterMutation();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // called when user clicks "register" button
    const handleSubmit = async (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault(); // No Page Refresh

		const response = await register({options: {email, username, password}});

        // error was returned
        if (response.data?.register.errors) {
            // update error message
            const newErrorMessage = response.data.register.errors[0].message
            setErrorMessage(newErrorMessage);
        // no errors, successful register
        } else {
            // reset ui, reroute to home page
            setEmail("");
            setUsername("");
            setPassword("");
            setErrorMessage("Success! Logging in...");
            router.push("/");
        }
	}

    return(
        <>
        <Navbar />
        <div className={styles.register}>
            <div className={styles.register__form}>
                {/* Title */}
                <h2 className={styles.register__title}>Register</h2>

                {/* Username Input */}
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email..." type="text"/>
                {/* Email Input */}
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username..." type="text"/>
                {/* Password Input */}
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." type="password"/>

                {/* Submit Button */}
                <div className={styles.register__button} onClick={handleSubmit}>Register</div>
                {/* Error Messages */}
                <h3 className={styles.register__error}>{errorMessage}</h3>
            </div>
        </div>
        </>
    );
}

export default withUrqlClient(createUrqlClient)(Register);