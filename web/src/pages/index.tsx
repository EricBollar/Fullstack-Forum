import { withUrqlClient } from 'next-urql'
import { usePostsQuery } from '../generated/graphql'
import styles from "../styles/index.module.css"
import { createUrqlClient } from '../utils/createUrqlClient'

// because we only want to run mequery on client in navbar
// this means rendering on server is different from rendering on client
// next.js is fucking annoying and throws massive, illegible "hydration"
// warnings that give useless errors trying to say this.
// this is mainly so people don't try to create variables without hooks
// and baby beginner dumbasses don't break shit,
// but it gets in the way when trying to do things with ssr
// so we need to use client side of next/dynamic
import dynamic from 'next/dynamic'
import Post from '../components/post'
import { useState } from 'react'
const Navbar = dynamic(() => import("../components/navbar"), { ssr: false })

const Index = () => {
  const [variables, setVariables] = useState({limit: 10, cursor: undefined as string | undefined});
  const [{data, fetching}] = usePostsQuery({variables});

  // edge case
  if (!fetching && !data) {
    return <div>No Posts Found...</div>
  }

  const loadMore = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const posts = data!.posts.posts;
    setVariables({
      limit: variables.limit,
      cursor: posts[posts.length - 1].createdAt
    })
  }

  return (
    <>
    <Navbar />
    <div className={styles.index}>
      <br/>
      <h2 className={styles.index__title}>Posts</h2>
      {!data || data.posts?.posts === undefined
        ? <div>Loading posts...</div> 
        : data.posts.posts.map((p) => 
          !p
          ? null // when deleting post, cache invalidation makes post = null
          : <Post 
              post = {p}
              creatorUsername = {p.creator.username}
              />
      )}
      {data && data.posts.hasMore
        ? <button className={styles.index__button} onClick={loadMore}>Load More</button>
        : null
      }
      <br/>
    </div>
    </>
  )
}

// using urql provider in this way allows us to toggle server-side rendering
// ssr-rendering is best for seo but slower load time and no loading indicators
// ssr is really only for dynamic rendering (eg loading posts)
// client side is faster and allows for loading screens but bad for seo
// client side is often used for static rendering (eg login page)
export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
