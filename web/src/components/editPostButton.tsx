import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';
import styles from "../styles/deletePost.module.css";
import NextLink from "next/link";

interface editPostButtonProps {
    postId: number,
    creatorUsername: string,
    route: string
}

const EditPostButton: React.FC<editPostButtonProps> = ({postId, creatorUsername, route}) => {
    const [{data, fetching}] = useMeQuery();

    if (fetching) {
        return <div>Loading...</div>
    }

    const handleEdit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        
    }

    let editButton = (
        <NextLink href={route + "post/edit/[id]"} as={route + `post/edit/${postId}`}>
            <button onClick={handleEdit} className={styles.deletePost}>Edit</button>
        </NextLink>
    );

    if (!data || data.me?.username !== creatorUsername) {
        editButton = <></>
    }

    return editButton;
}

export default EditPostButton;