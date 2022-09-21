import { withUrqlClient } from 'next-urql'
import Navbar from '../components/navbar'
import styles from "../styles/index.module.css"
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  return (
    <>
    <Navbar />
    <div className={styles.title}>Hello World!</div>
    </>
  )
}

export default withUrqlClient(createUrqlClient)(Index);
