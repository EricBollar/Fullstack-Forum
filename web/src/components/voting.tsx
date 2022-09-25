import { withUrqlClient } from "next-urql";
import React from "react";
import { useVoteMutation } from "../generated/graphql";
import styles from "../styles/voting.module.css";
import { createUrqlClient } from "../utils/createUrqlClient";

interface votingProps {
    voteStatus?: number,
    postId: number,
    points: number
}

const Voting: React.FC<votingProps> = ({voteStatus, postId, points}) => {
    const [,vote] = useVoteMutation();

    const upVote = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (voteStatus !== 1) {
            vote({postId: postId, value: 1});
        } else {
            vote({postId: postId, value: 0});
        }
    }

    const downVote = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (voteStatus !== -1) {
            vote({postId: postId, value: -1});
        } else {
            vote({postId: postId, value: 0});
        }
    }

    return (
        <div className={styles.voting}>
            {/* Not sure how to use "post__upvote--active" here... using upvote_active as temporary substitute */}
            <button className={voteStatus === 1 ? styles.voting__upvote_active : styles.voting__upvote} onClick={upVote}>⬆</button>
            <p>{points}</p>
            <button className={voteStatus === -1 ? styles.voting__downvote_active : styles.voting__downvote} onClick={downVote}>⬇</button>
        </div>
    );
}

export default Voting;