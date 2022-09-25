import React from 'react';
import { PostSnippetFragment } from '../generated/graphql';
import styles from "../styles/post.module.css";
import NextLink from "next/link";
import Voting from './voting';

interface postProps {
    post: PostSnippetFragment
    username: string
}

const Post: React.FC<postProps> = ({post, username}) => {
	return (
		<div className={styles.post}>
            <NextLink href="/post/[id]" as={`/post/${post.id}`}>
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
            </NextLink>
            <Voting
                postId={post.id} 
                points={post.points} 
                voteStatus={post.voteStatus as number | undefined}
                />
		</div>
	)
}

export default Post;