import { NextPage } from "next";
import React, { useState } from "react"
import styles from '../../styles/change-password.module.css'
import { useChangePasswordMutation } from "../../generated/graphql";
import Router from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const ChangePassword: NextPage = () => {
    const [,changePassword] = useChangePasswordMutation();
    const [passwordA, setPasswordA] = useState("");
	const [passwordB, setPasswordB] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // called when user clicks "login" button
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // No Page Refresh

        if (passwordA !== passwordB) {
            setErrorMessage("Passwords do not match!");
            return;
        }

		const response = await changePassword({
            token: typeof Router.query.token === "string" ? Router.query.token : "", 
            newPassword: passwordA
        });

        // error was returned
        if (response.data?.changePassword.errors) {
            // update error message
            const newErrorMessage = response.data.changePassword.errors[0].message
            setErrorMessage(newErrorMessage);
        // no errors
        } else {
            setErrorMessage("Success! Password has been successfully changed.");
            Router.push("/");
        }
	}

    return(
        <div className={styles.changepassword}>
            <form>
                {/* Title */}
                <h2 className={styles.changepassword__title}>Change Your Password</h2>

                {/* Username/Email Input */}
                <h3 className={styles.changepassword__inputHeader}>New Password</h3>
                <input value={passwordA} onChange={(e) => setPasswordA(e.target.value)} placeholder="Password..." type="password"/>
                {/* Password Input */}
                <h3 className={styles.changepassword__inputHeader}>Confirm New Password</h3>
                <input value={passwordB} onChange={(e) => setPasswordB(e.target.value)} placeholder="Password..." type="password"/>
            
                {/* Submit Button */}
                <button onClick={handleSubmit} type="submit">Change Password</button>
                {/* Error Messages */}
                <h3 className={styles.changepassword__error}>{errorMessage}</h3>
            </form>
        </div>
    );
} 

export default withUrqlClient(createUrqlClient)(ChangePassword);