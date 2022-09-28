import React, { useEffect, useState } from "react"
import styles from "../styles/navbar.module.css"
import NextLink from "next/link"
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import Image from "next/image";
import { IconButton } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import path from "path";
import { useRouter } from "next/router";

interface NavbarProps {

}

const Navbar: React.FC<NavbarProps> = ({}) => {
    const router = useRouter();
    const [,logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery();

    const handleLogout = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (!confirm("Are you sure you want to logout?")) {
            return;
        }
        await logout({});
        // currently have issue with loading more posts while logged in
        // then logging out -> this solves but is not a perfect solution
        router.reload();
    }

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
                <div className={styles.navbar__options}>
                    <NextLink href="/login">
                        <h4 className={styles.navbar__option}>Login</h4>
                    </NextLink>
                    <NextLink href="/register">
                        <h4 className={styles.navbar__option}>Register</h4>
                    </NextLink>
                </div>
            )

        // logged in
        } else {
            navbar__right = (
                <div className={styles.navbar__options}>
                    <h2 className={styles.navbar__username}>{data!.me!.username}</h2>
                    <NextLink href="/create-post">
                        <h4 className={styles.navbar__option}>Create</h4>
                    </NextLink>
                    <NextLink href="#">
                        <h4 onClick={handleLogout} className={styles.navbar__option}>Logout</h4>
                    </NextLink>
                </div>
            );
        }
    }

    return (
        <div className={styles.navbar}>
            <NextLink href="/">
                <div className={styles.navbar__left}>
                    <img src="/icon.png" alt="logo"/>
                    <div className={styles.navbar__leftTitle}>
                        <h2>Fullstack-Forum</h2>
                        <h4>by Eric Bollar</h4>
                    </div>
                </div>
            </NextLink>
			<div className={styles.navbar__right}>
                { navbar__right }
			</div>
		</div>
    );
}

export default Navbar;