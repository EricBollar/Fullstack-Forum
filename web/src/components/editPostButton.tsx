import React from 'react';
import { useMeQuery } from '../generated/graphql';
import styles from "../styles/editpostbutton.module.css";
import NextLink from "next/link";
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import { useRouter } from 'next/router';

interface editPostButtonProps {
    postId: number,
    creatorUsername: string,
    route: string
}

const EditPostButton: React.FC<editPostButtonProps> = ({postId, creatorUsername, route}) => {
    const [{data, fetching}] = useMeQuery();
    const router = useRouter();

    if (fetching) {
        return <div>Loading...</div>
    }

    const handleEdit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        router.push(route + `post/edit/${postId}`);
    }

    let editButton = (
        <IconButton onClick={handleEdit}>
            <EditIcon className={styles.editpost} />
        </IconButton>
    );

    if (!data || data.me?.username !== creatorUsername) {
        editButton = <></>
    }

    return editButton;
}

export default EditPostButton;