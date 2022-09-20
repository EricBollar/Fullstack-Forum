import Navbar from '../components/navbar'
import styles from '../styles/index.module.css'

export default function Index() {
  return (
    <>
    <Navbar />
    <div className={styles.title}>Hello World!</div>
    </>
  )
}
