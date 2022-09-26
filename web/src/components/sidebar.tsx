import React from "react";
import styles from "../styles/sidebar.module.css";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';

interface sidebarProps {

}

const Sidebar: React.FC<sidebarProps> = () => {
    return (
        <div className={styles.sidebar}>
			<a href="https://www.ericbollar.com" target="_blank">
				<div className={styles.sidebar__option}>
					<img src="fishpic.png" alt="pic of me"/>
					<h4>My Website!</h4>
				</div>
			</a>
			<a href="https://www.linkedin.com/in/eric-bollar/" target="_blank">
				<div className={styles.sidebar__option}>
					<LinkedInIcon />
					<h4>LinkedIn</h4>
				</div>
			</a>
			<a href="https://github.com/EricBollar" target="_blank">
				<div className={styles.sidebar__option}>
					<GitHubIcon />
					<h4>GitHub</h4>
				</div>
			</a>
			<a href="https://www.instagram.com/ericbollar/" target="_blank">
				<div className={styles.sidebar__option}>
					<InstagramIcon />
					<h4>Instagram</h4>
				</div>
			</a>
		</div>
    );
}

export default Sidebar;