import React, { useState } from 'react'
import { useForgotPasswordMutation, useLoginMutation } from '../generated/graphql'
import styles from '../styles/login.module.css'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'

interface forgotPasswordProps {

}

const ForgotPassword: React.FC<forgotPasswordProps> = ({}) => {
    const [,forgotPassword] = useForgotPasswordMutation();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    // called when user clicks "login" button
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // No Page Refresh

        setMessage("If there is an account associated with that email, a reset-password link has been sent.")
	
        await forgotPassword({email});
    }

    return(
        <div className={styles.forgotpassword}>
            <form>
                {/* Title */}
                <h2 className={styles.forgotpassword__title}>Reset Your Password</h2>

                {/* Email Input */}
                <h3 className={styles.forgotpassword__inputHeader}>Email</h3>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email..." type="text"/>
        
                {/* Submit Button */}
                <button onClick={handleSubmit} type="submit">Send Email</button>
                {/*  Messages */}
                <h3 className={styles.forgotpassword__message}>{message}</h3>
            </form>
        </div>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);