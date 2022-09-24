import Router from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const [{data, fetching}] = useMeQuery();
    useEffect(() => {
        if (!fetching && !data?.me) {
            // reroutes to login page, but sends previous page to login
            Router.replace("/login?next=" + Router.pathname);
        }
    }, [fetching, data])
}