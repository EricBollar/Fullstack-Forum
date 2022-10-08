import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import Navbar from "../../components/navbar";
import { useMeQuery, usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import styles from "../../styles/postpage.module.css";
import Voting from "../../components/voting";
import DeletePost from "../../components/deletePost";
import EditPostButton from "../../components/editPostButton";

interface postPageProps {
    
}

const PostPage: React.FC<postPageProps> = ({}) => {
    const router = useRouter();
    const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    const [{data, error, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    const post = data?.post

    const [{data: meData}] = useMeQuery();
    const borderName =
        (meData?.me?.id === data?.post?.creator.id)
            ? styles.postpage__owned
            : styles.postpage;

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
            <h2 className={styles.postpage__title}>Post #{post.id}</h2>
            <div className={borderName}>
                <div className={styles.postpage__content}>
                    <div className={styles.postpage__top}>
                        <div className={styles.postpage__topInfo}>
                            <h2>{post.title}</h2>
                            <div className={styles.postpage__authorship}>
                                <h3>by {post.creator.username}</h3>
                                <p>Posted at {new Date(parseInt(post.createdAt)).toLocaleTimeString()} on {new Date(parseInt(post.createdAt)).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className={styles.post__engagement}>
                            <EditPostButton
                                route = "../"
                                postId={post.id}
                                creatorUsername={post.creator.username}
                                />
                            <DeletePost
                                postId={post.id}
                                creatorUsername={post.creator.username}
                                />
                            <Voting
                                postId={post.id} 
                                points={post.points} 
                                voteStatus={post.voteStatus as number | undefined}
                                />
                        </div>
                    </div>
                    <div className={styles.postpage__bottom}>
                        <p>{post.text}</p>
                        <br/>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(PostPage);