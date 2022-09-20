import React, { useState } from 'react'
import styles from '../styles/register.module.css'

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

    const handleSubmit = e => {
		e.preventDefault(); // No Page Refresh

        console.log(username, password);

        setUsername("");
        setPassword("");
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
                <h3 className={styles.register__errorFont}>Example Error</h3>
            </form>
        </div>
    );
}

export default Register;