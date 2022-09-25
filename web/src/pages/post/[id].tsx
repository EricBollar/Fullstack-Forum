import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import Navbar from "../../components/navbar";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import styles from "../../styles/postpage.module.css";
import Voting from "../../components/voting";
import DeletePost from "../../components/deletePost";
import { getPostFromUrl } from "../../utils/getPostFromUrl";
import EditPostButton from "../../components/editPostButton";

interface postPageProps {
    
}

const PostPage: React.FC<postPageProps> = ({}) => {
    const [{data, error, fetching}] = getPostFromUrl();
    const post = data?.post

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
                <EditPostButton
                    route="../"
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
            <br/>
		</div>
        </>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(PostPage);