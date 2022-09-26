import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react"
import Navbar from "../components/navbar";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import styles from "../styles/createpost.module.css"
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

interface createPostProps {

}

const CreatePost: React.FC<{}> = () => {
    // check logged in
    useIsAuth();

    const router = useRouter();
    const [,createPost] = useCreatePostMutation();
    const [title, setTitle] = useState("");
	const [text, setText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault(); // No Page Refresh

        const {error} = await createPost({options: {title: title, text: text}});

        if (!error) {
            router.push("/");
        } else {
            // substring since all errors start with "[GraphQL] "
            setErrorMessage(error.message.substring(9));
        }
	}

    return (
        <>
        <Navbar />
        <div className={styles.createpost}>
            <div className={styles.createpost__form}>
                {/* Title */}
                <h2 className={styles.createpost__title}>Create Post</h2>
    
                {/* Post Title Input */}
                <input className={styles.createpost__titlefield} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." type="text"/>
                {/* Text Input */}
                <textarea className={styles.createpost__textfield} rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Text..."/>

                {/* Submit Button */}
                <div className={styles.createpost__button} onClick={handleSubmit}>Create Post</div>
                {/* Error Messages */}
                <h3 className={styles.createpost__error}>{errorMessage}</h3>
            </div>
        </div>
        </>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);