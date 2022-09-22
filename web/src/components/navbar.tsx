import React, { useEffect, useState } from "react"
import styles from "../styles/navbar.module.css"
import NextLink from "next/link"
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavbarProps {

}

const Navbar: React.FC<NavbarProps> = ({}) => {
    const [,logout] = useLogoutMutation();
    
    // pause prevents running on server (no cookie on server).
    const [{data, fetching}] = useMeQuery({pause: isServer()});

    let navbar__right;

    // This is not cleanest code, but shows thought process
    // Probably a way to do this cleaner
    // Should destructure navbar into multiple components in future
    // wait for load
    if (!fetching) {
        navbar__right = (
            <>
            <h3 className={styles.navbar__username}>Loading...</h3>
            </>
        );

        // not logged in
        if (!data?.me) {
            navbar__right = (
                <>
                <NextLink href="/login" suppressHydrationWarning={true}>
                    <button suppressHydrationWarning={true} className={styles.navbar__option}>Login</button>
                </NextLink>
                <NextLink href="/register" suppressHydrationWarning={true}>
                    <button suppressHydrationWarning={true} className={styles.navbar__option}>Register</button>
                </NextLink>
                </>
            )

        // logged in
        } else {
            navbar__right = (
                <>
                <h3 suppressHydrationWarning={true} className={styles.navbar__username}>{data!.me!.username}</h3>
                <button suppressHydrationWarning={true} onClick={() => logout({})} className={styles.navbar__option}>Logout</button>
                </>
            );
        }
    }

    return (
        <div className={styles.navbar}>
			<div className={styles.navbar__left}>
				<h2 className={styles.navbar__title}>Fullstack-Forum</h2>
				<h4 className={styles.navbar__author}>by Eric Bollar</h4>
			</div>
			<div className={styles.navbar__right}>
                { navbar__right }
			</div>
		</div>
    );
}

export default Navbar;