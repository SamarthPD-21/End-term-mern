"use client";

import { setUser } from '@/redux/userSlice';
import { getCurrentUser } from '@/lib/User';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function useCurrentUser() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getCurrentUser();
                // If response is falsy (not authenticated), do nothing. We don't want
                // to force a redirect from a globally-run loader — letting pages decide
                // when to require auth.
                if (response) {
                    dispatch(
                        setUser({
                            name: response.name,
                            email: response.email,
                            // keep isAdmin explicit from server (default false)
                            isAdmin: response.isAdmin ?? false,
                            cartdata: response.cartdata,
                            wishlistdata: response.wishlistdata,
                            orderdata: response.orderdata,
                            addressdata: response.addressdata,
                            profileImage: response.profileImage || null,
                        })
                    );
                }
            } catch (error) {
                // don't redirect on errors; log for debugging
                // keep silent in production
                // eslint-disable-next-line no-console
                console.debug("useCurrentUser: could not fetch user", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Re-run when window regains focus so profile image updates if user changed
        const onFocus = () => fetchUser();
        const onVisibility = () => {
            if (document.visibilityState === 'visible') fetchUser();
        };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [dispatch]);

    return loading;
}
