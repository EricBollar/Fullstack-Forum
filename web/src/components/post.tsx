import React from 'react';
import styles from "../styles/post.module.css";

interface postProps {
    title: string,
    text: string,
    timestamp: string,
    //creator: string
}

const Post: React.FC<postProps> = ({title, text, timestamp}) => {
	return (
		<div className={styles.post}>
            <div className={styles.post__content}>
                <div className={styles.post__top}>
                    <h2>{title}</h2>
                    <div className={styles.post__topInfo}>
                        {/* <h3>{creator}</h3> */}
                        <p>{timestamp}</p>
                    </div>
                </div>
                <div className={styles.post__bottom}>
                    <p>{text}</p>
                </div>
            </div>
            <div className={styles.post__voting}>
                <button>⬆</button>
                <p>0</p>
                <button>⬇</button>
            </div>
		</div>
	)
}

export default Post;