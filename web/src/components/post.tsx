import React, { MouseEventHandler } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';
import styles from "../styles/post.module.css";

interface postProps {
    post: PostSnippetFragment
    username: string
}

const Post: React.FC<postProps> = ({post, username}) => {
    const [,vote] = useVoteMutation();

    const upVote = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (post.voteStatus !== 1) {
            vote({postId: post.id, value: 1});
        }
    }

    const downVote = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (post.voteStatus !== -1) {
            vote({postId: post.id, value: -1});
        }
    }

	return (
		<div className={styles.post}>
            <div className={styles.post__content}>
                <div className={styles.post__top}>
                    <h2>{post.title}</h2>
                    <div className={styles.post__topInfo}>
                        <h3>{username}</h3>
                        <p>{new Date(parseInt(post.createdAt)).toTimeString()}</p>
                    </div>
                </div>
                <div className={styles.post__bottom}>
                    <p>{post.textSnippet}</p>
                    <br/>
                </div>
            </div>
            <div className={styles.post__voting}>
                {/* Not sure how to use "post__upvote--active" here... using upvote_active as temporary substitute */}
                <button className={post.voteStatus === 1 ? styles.post__upvote_active : styles.post__upvote} onClick={upVote}>⬆</button>
                <p>{post.points}</p>
                <button className={post.voteStatus === -1 ? styles.post__downvote_active : styles.post__downvote} onClick={downVote}>⬇</button>
            </div>
		</div>
	)
}

export default Post;