import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';
import styles from "../styles/deletePost.module.css";

interface deletePostProps {
    postId: number,
    creatorUsername: string
}

const DeletePost: React.FC<deletePostProps> = ({postId, creatorUsername}) => {
    const [{data, fetching}] = useMeQuery();
    const [,deletePost] = useDeletePostMutation();

    if (fetching) {
        return <div>Loading...</div>
    }

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        deletePost({id: postId});
    }

    let deleteButton = (
        <button onClick={handleDelete} className={styles.deletePost}>Delete</button>
    );

    if (!data || data.me?.username !== creatorUsername) {
        deleteButton = <></>
    }

    return deleteButton;
}

export default DeletePost;