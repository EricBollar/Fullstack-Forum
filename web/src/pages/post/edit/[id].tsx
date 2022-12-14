import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react"
import Navbar from "../../../components/navbar";
import styles from "../../../styles/editpost.module.css"
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useIsAuth } from "../../../utils/useIsAuth";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";

interface editPostProps {
    
}

const EditPost: React.FC<{}> = () => {
    // check logged in
    useIsAuth();
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState("");
    const [,update] = useUpdatePostMutation();

    const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    const [{data, error, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    const post = data?.post;

    const [title, setTitle] = useState(post?.title);
	const [text, setText] = useState(post?.text);
    
    if (!fetching && !post) {
        return (
            <>
            <Navbar />
            <div>No Post Found.</div>
            </>
        );
    }

    const handleSubmit = async (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault(); // No Page Refresh

        const {error} = await update({id: post!.id, title: title as string, text: text as string});

        if (!error) {
            router.back();
            //router.push(`/post/${post.id}`);
        } else {
            // substring since all errors start with "[GraphQL] "
            setErrorMessage(error.message.substring(9));
        }
	}

    return (
        <>
        <Navbar />
        <div className={styles.editpost}>
            <div className={styles.editpost__form}>
                {/* Title */}
                <h2 className={styles.editpost__title}>Edit Post #{post?.id}</h2>
    
                {/* Post Title Input */}
                <textarea className={styles.editpost__titleField} rows={1} value={title} defaultValue={post?.title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..."/>
                {/* Text Input */}
                <textarea className={styles.editpost__textField} rows={10} value={text} defaultValue={post?.text} onChange={(e) => setText(e.target.value)} placeholder="Text..."/>
                <br/>

                {/* Submit Button */}
                <div className={styles.editpost__button} onClick={handleSubmit}>Update Post</div>
                {/* Error Messages */}
                <h3 className={styles.editpost__error}>{errorMessage}</h3>
            </div>
        </div>
        </>
    );
}

// must be server side to get default title/text to equal post title/text
// react hooks are annoying as shit
export default withUrqlClient(createUrqlClient, {ssr: true})(EditPost);