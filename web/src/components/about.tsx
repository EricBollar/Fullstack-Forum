import React from "react";
import styles from "../styles/about.module.css";

interface aboutProps {

}

const About: React.FC<aboutProps> = () => {
    return (
        <div className={styles.about}>
            <div className={styles.about__info}>
                <h2>About Fullstack-Forum</h2>
                <p>Here i will talk about fullstack-forum.</p>
            </div>
		</div>
    );
}

export default About;