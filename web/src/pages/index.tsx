import { withUrqlClient, WithUrqlProps } from 'next-urql'
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
import Sidebar from '../components/sidebar'
import Posts from '../components/posts'
import About from '../components/about'
const Navbar = dynamic(() => import("../components/navbar"), { ssr: false })

const Index = () => {
  return (
    <>
    <Navbar />
    <div className={styles.index}>
      <Sidebar />
      <div className={styles.index__posts}>
        <h1 className={styles.index__title}>Posts</h1>
        <Posts />
      </div>
      <About />
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
