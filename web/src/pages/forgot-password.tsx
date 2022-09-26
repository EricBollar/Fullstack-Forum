import React, { useState } from 'react'
import { useForgotPasswordMutation } from '../generated/graphql'
import styles from '../styles/forgotpassword.module.css'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'
import Navbar from '../components/navbar'

interface forgotPasswordProps {

}

const ForgotPassword: React.FC<forgotPasswordProps> = ({}) => {
    const [,forgotPassword] = useForgotPasswordMutation();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    // called when user clicks "login" button
    const handleSubmit = async (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault(); // No Page Refresh

        setMessage("If there is an account associated with that email, a reset-password link has been sent.")
	
        await forgotPassword({email});
    }

    return(
        <>
        <Navbar />
        <div className={styles.forgotpassword}>
            <div className={styles.forgotpassword__form}>
                {/* Title */}
                <h2 className={styles.forgotpassword__title}>Reset Your Password</h2>

                {/* Email Input */}
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email..." type="text"/>
        
                {/* Submit Button */}
                <div className={styles.forgotpassword__button} onClick={handleSubmit}>Send Email</div>
                {/*  Messages */}
                <h3 className={styles.forgotpassword__message}>{message}</h3>
            </div>
        </div>
        </>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);