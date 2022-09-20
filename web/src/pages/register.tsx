import React, { useState } from 'react'
import { useRegisterMutation } from '../generated/graphql'
import styles from '../styles/register.module.css'

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    const [,register] = useRegisterMutation();
    const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // called when user clicks "register" button
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // No Page Refresh

		const response = await register({username, password});
        if (response.data?.register.errors) {
            const newErrorMessage = response.data.register.errors[0].message
            setErrorMessage(newErrorMessage);
            console.log(newErrorMessage);
        } else {
            setUsername("");
            setPassword("");
            setErrorMessage("Success! Logging in...");
        }
	}

    return(
        <div className={styles.register}>
            <form>
                {/* Title */}
                <h2 className={styles.register__title}>Register</h2>

                {/* Username Input */}
                <h3 className={styles.register__inputFont}>Username</h3>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username..." type="text"/>
                {/* Password Input */}
                <h3 className={styles.register__inputFont}>Password</h3>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." type="text"/>
            
                {/* Submit Button */}
                <button onClick={handleSubmit} type="submit">Register</button>
                {/* Error Messages */}
                <h3 className={styles.register__errorFont}>{errorMessage}</h3>
            </form>
        </div>
    );
}

export default Register;