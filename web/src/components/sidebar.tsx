import React from "react";
import styles from "../styles/sidebar.module.css";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import Image from "next/image";

interface sidebarProps {

}

const Sidebar: React.FC<sidebarProps> = () => {
    return (
        <div className={styles.sidebar}>
			<a href="https://www.ericbollar.com">
				<div className={styles.sidebar__option}>
                    <img src="/fishPic.png" alt="fish pic"/>
					<h4>My Website!</h4>
				</div>
			</a>
			<a href="https://www.linkedin.com/in/eric-bollar/">
				<div className={styles.sidebar__option}>
					<LinkedInIcon />
					<h4>LinkedIn</h4>
				</div>
			</a>
			<a href="https://github.com/EricBollar">
				<div className={styles.sidebar__option}>
					<GitHubIcon />
					<h4>GitHub</h4>
				</div>
			</a>
			<a href="https://www.instagram.com/ericbollar/">
				<div className={styles.sidebar__option}>
					<InstagramIcon />
					<h4>Instagram</h4>
				</div>
			</a>
		</div>
    );
}

export default Sidebar;