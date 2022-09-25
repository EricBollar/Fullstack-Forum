import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react"
import Navbar from "../../../components/navbar";
import styles from "../../../styles/editpost.module.css"
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useIsAuth } from "../../../utils/useIsAuth";
import { getPostFromUrl } from "../../../utils/getPostFromUrl"
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";

interface editPostProps {
    
}

const EditPost: React.FC<{}> = () => {
    // check logged in
    useIsAuth();
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState("");
    const [,update] = useUpdatePostMutation();

    const [{data, error, fetching}] = getPostFromUrl();
    const post = data?.post;

    const [title, setTitle] = useState(post?.title);
	const [text, setText] = useState(post?.text);
    
    if (!post) {
        return (
            <>
            <Navbar />
            <div>No Post Found.</div>
            </>
        );
    }

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // No Page Refresh

        const {error} = await update({id: post.id, title: title as string, text: text as string});

        if (!error) {
            router.push(`/post/${post.id}`);
        } else {
            // substring since all errors start with "[GraphQL] "
            setErrorMessage(error.message.substring(9));
        }
	}

    return (
        <>
        <Navbar />
        <div className={styles.editpost}>
            <form>
                {/* Title */}
                <h2 className={styles.editpost__title}>Create Post</h2>
    
                {/* Post Title Input */}
                <h3 className={styles.editpost__inputeHeader}>Title</h3>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." type="text"/>
                {/* Text Input */}
                <h3 className={styles.editpost__inputeHeader}>Text</h3>
                <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Text..."/>
                <br/>

                {/* Submit Button */}
                <button onClick={handleSubmit} type="submit">Update Post</button>
                {/* Error Messages */}
                <h3 className={styles.editpost__error}>{errorMessage}</h3>
            </form>
        </div>
        </>
    );
}

// must be server side to get default title/text to equal post title/text
// react hooks are annoying as shit
export default withUrqlClient(createUrqlClient, {ssr: true})(EditPost);