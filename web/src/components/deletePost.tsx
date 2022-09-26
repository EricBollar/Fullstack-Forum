import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';
import styles from "../styles/deletepostbutton.module.css";
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';

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
        if (!confirm("Are you sure you want to delete this post?")) {
            return;
        }
        await deletePost({id: postId});
    }

    let deleteButton = (
        <IconButton onClick={handleDelete}>
            <DeleteIcon className={styles.deletePost}/>
        </IconButton>
    );

    if (!data || data.me?.username !== creatorUsername) {
        deleteButton = <></>
    }

    return deleteButton;
}

export default DeletePost;