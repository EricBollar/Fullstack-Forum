import React from "react";
import styles from "../styles/about.module.css";
import Image from "next/image"

interface aboutProps {

}

const About: React.FC<aboutProps> = () => {
    return (
        <div className={styles.about}>
            <div className={styles.about__info}>
                <h2>About Fullstack-Forum</h2>
                <div className={styles.about__intro}>
                    <p><i>This forum uses the following elements</i> ↓</p>
                    <a className={styles.about__introbutton} href="https://github.com/EricBollar/Fullstack-Forum">View the Github!</a>
                </div>
                <div className={styles.about__feature}>
                    <img src="/typescript_logo.png" alt="typescript logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>Typescript</h3>
                        <p>Typescript is great! I&apos;m using a javascript framework, so typescript is the primary language used throughout the entire project.</p>
                    </div>               
                </div>
                <h3 className={styles.about__sectiontitle}><i>→ Client-Side...</i></h3>
                <div className={styles.about__feature}>
                    <img src="/htmlcss_logo.png" alt="html css logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>HTML/CSS</h3>
                        <p>HTML is an obvious must-have, and styling with plain css is robust and scalable if done properly.</p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img className={styles.about__circlify} src="/mui_logo.png" alt="mui logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>Material-UI</h3>
                        <p>Although not used extensively here, material-ui is a phenomenal library for professional icons.</p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img className={styles.about__circlify} src="/nextjs_logo.png" alt="nextjs logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>Next.js</h3>
                        <p>Next.js is built on top of React (Facebook&apos;s Javascript Framework) and enables both server-side rendering and static pages.
                            I&apos;m not sure if this is the best option at scale, but it certainly is a good one.
                        </p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img src="/graphql_logo.png" alt="graphql logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>GraphQL</h3>
                        <p>GraphQL is robust, scalable, and easy to use. It&apos;s very straight-forward.</p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img src="/urql_logo.png" alt="urql logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>URQL</h3>
                        <p>URQL is a solid client-side query framework, but not as popular as apollo-client. They are both very similar in functionality and syntax. I may switch this project to apollo-client in the future.</p>
                    </div>               
                </div>
                <h3 className={styles.about__sectiontitle}><i>→ Server-Side...</i></h3>
                <div className={styles.about__feature}>
                    <img src="/apollo_logo.png" alt="apollo logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>Apollo-Server</h3>
                        <p>Apollo-server is a scalable api language for GraphQL, so it fits perfectly in this stack.</p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img src="/express_logo.png" alt="express logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>Express.js</h3>
                        <p>With Express, there&apos;s minimal setup and hardly any maintenance once it&apos;s working. Unfortunately, it&apos;s not the best at scale.
                            I should probably use Node.js (backed by Google) for future projects if scalability is a concern.
                        </p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img src="/typeorm_logo.png" alt="typeorm logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>TypeORM</h3>
                        <p>TypeORM has clear syntax with the option for high-level abstraction of queries or direct SQL commands. 
                            It&apos;s very easy to both implement and understand what is going on.</p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img src="/postgresql_logo.png" alt="postgresql logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>PostgreSQL</h3>
                        <p>PostgreSQL is widely used and easy to vertically scale.</p>
                    </div>               
                </div>
                <h3 className={styles.about__sectiontitle}><i>→ Deployment...</i></h3>
                <div className={styles.about__feature}>
                    <img src="/digitalocean_logo.png" alt="digitalocean logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>DigitalOcean</h3>
                        <p>A user-friendly VPS that has a lot of documentation.
                        </p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img src="/dokku_logo.png" alt="dokku logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>Dokku</h3>
                        <p>Dokku is a self-hosted Platform as a Service (PaaS) that runs on top of Docker.
                            It&apos;s similar to Heroku in that it is very user friendly and easy to configure,
                            making application deployment much easier.
                        </p>
                    </div>               
                </div>
                <div className={styles.about__feature}>
                    <img src="/vercel_logo.png" alt="vercel logo"/>
                    <div className={styles.about__featurecontent}>
                        <h3>Vercel</h3>
                        <p>Vercel handles deployment of the frontend. After initial setup, it is surprisingly easy to use.
                        </p>
                    </div>               
                </div>
            </div>
		</div>
    );
}

export default About;