import { usePostsQuery } from '../generated/graphql'
import styles from "../styles/posts.module.css"
import Post from '../components/post'
import { useState } from 'react'

const Posts = () => {
  const [variables, setVariables] = useState({limit: 10, cursor: undefined as string | undefined});
  const [{data, fetching}] = usePostsQuery({variables});

  // edge case
  if (!fetching && !data) {
    return <div>No Posts Found...</div>
  }

  const loadMore = async (event: React.MouseEvent<HTMLDivElement>) => {
    const posts = data!.posts.posts;
    setVariables({
      limit: variables.limit,
      cursor: posts[posts.length - 1].createdAt
    })
  }

  return (
    <>
    <div className={styles.posts}>
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
        ? <h4 className={styles.posts__button} onClick={loadMore}>Load More</h4>
        : null
      }
    </div>
    </>
  )
}

export default Posts;
