import React from 'react';
import { PostSnippetFragment, useMeQuery } from '../generated/graphql';
import styles from "../styles/post.module.css";
import NextLink from "next/link";
import Voting from './voting';
import DeletePost from './deletePost';
import EditPostButton from './editPostButton';

interface postProps {
    post: PostSnippetFragment
    creatorUsername: string
}

const Post: React.FC<postProps> = ({post, creatorUsername}) => {
    const [{data, fetching}] = useMeQuery();
    const borderName =
        (data?.me?.username) === creatorUsername
            ? styles.post__owned
            : styles.post;

	return (
		<div className={borderName}>
            <div className={styles.post__content}>
                <div className={styles.post__top}>
                    <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                        <div className={styles.post__topInfo}>
                            <h2>{post.title}</h2>
                            <div className={styles.post__authorship}>
                                <h3>by {creatorUsername}</h3>
                                <p>Posted at {new Date(parseInt(post.createdAt)).toLocaleTimeString()} on {new Date(parseInt(post.createdAt)).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </NextLink>
                    <div className={styles.post__engagement}>
                        <EditPostButton
                            route = ""
                            postId={post.id}
                            creatorUsername={creatorUsername}
                            />
                        <DeletePost
                            postId={post.id}
                            creatorUsername={creatorUsername}
                            />
                        <Voting
                            postId={post.id} 
                            points={post.points} 
                            voteStatus={post.voteStatus as number | undefined}
                            />
                    </div>
                </div>
                <div className={styles.post__bottom}>
                    <p>{post.textSnippet + (post.textSnippet.length >= 200 ? "..." : "")}</p>
                    <br/>
                </div>
            </div>
		</div>
	)
}

export default Post;