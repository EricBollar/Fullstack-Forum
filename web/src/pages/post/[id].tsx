import { withUrqlClient } from "next-urql";
import Router, { useRouter } from "next/router";
import Navbar from "../../components/navbar";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import styles from "../../styles/postpage.module.css";
import { useEffect } from "react";

interface postPageProps {
    
}

const PostPage: React.FC<postPageProps> = ({}) => {
    // must use useRouter(), should probably clean up in future
    const intId = typeof useRouter().query.id === "string" ? parseInt(useRouter().query.id as string) : -1;
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    const post = data?.post;

    // loading data
    if (fetching) {
        return (
            <div>Loading...</div>
        );
    }

    // no post found
    if (!post) {
        return (
            <>
            <Navbar />
            <div className={styles.post}>
                <h2 >Post not found.</h2>
            </div>
            </>
        );
    }

    return (
        <>
        <Navbar />
        <div className={styles.postpage__background}>
            <br/>
            <div className={styles.postpage}>
                <div className={styles.postpage__content}>
                    <div className={styles.postpage__top}>
                        <h1>{post.title}</h1>
                        <div className={styles.postpage__topInfo}>
                            <h2>{post.creator.username}</h2>
                            <h3>{new Date(parseInt(post.createdAt)).toTimeString()}</h3>
                        </div>
                    </div>
                    <div className={styles.postpage__bottom}>
                        <p>{post.text}</p>
                        <br/>
                    </div>
                </div>
                <div className={styles.postpage__voting}>
                    {/* Not sure how to use "post__upvote--active" here... using upvote_active as temporary substitute */}
                    {/* <button className={post.voteStatus === 1 ? styles.post__upvote_active : styles.post__upvote} onClick={upVote}>⬆</button>
                    <p>{post.points}</p>
                    <button className={post.voteStatus === -1 ? styles.post__downvote_active : styles.post__downvote} onClick={downVote}>⬇</button> */}
                </div>
            </div>
            <br/>
		</div>
        </>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(PostPage);