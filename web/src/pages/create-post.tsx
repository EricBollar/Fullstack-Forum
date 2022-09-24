import { withUrqlClient } from "next-urql";
import Router from "next/router";
import React, { useEffect, useState } from "react"
import Navbar from "../components/navbar";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import styles from "../styles/create-post.module.css"
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

interface createPostProps {

}

const CreatePost: React.FC<{}> = () => {
    // check logged in
    useIsAuth();

    const [,createPost] = useCreatePostMutation();
    const [title, setTitle] = useState("");
	const [text, setText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // No Page Refresh

        const {error} = await createPost({options: {title: title, text: text}});

        if (!error) {
            Router.push("/");
        } else {
            // substring since all errors start with "[GraphQL] "
            setErrorMessage(error.message.substring(9));
        }
	}

    return (
        <>
        <Navbar />
        <div className={styles.createpost}>
            <form>
                {/* Title */}
                <h2 className={styles.createpost__title}>Create Post</h2>
    
                {/* Post Title Input */}
                <h3 className={styles.createpost__inputHeader}>Title</h3>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." type="text"/>
                {/* Text Input */}
                <h3 className={styles.createpost__inputHeader}>Text</h3>
                <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Text..."/>
                <br/>

                {/* Submit Button */}
                <button onClick={handleSubmit} type="submit">CreatePost</button>
                {/* Error Messages */}
                <h3 className={styles.createpost__error}>{errorMessage}</h3>
            </form>
        </div>
        </>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);