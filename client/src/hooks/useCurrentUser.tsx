"use client";

import { setUser } from '@/redux/userSlice';
import { getCurrentUser } from '@/lib/User';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function useCurrentUser() {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getCurrentUser();
                // If response is falsy (not authenticated), do nothing. We don't want
                // to force a redirect from a globally-run loader — letting pages decide
                // when to require auth.
                if (!response) return;

                dispatch(
                    setUser({
                        name: response.name,
                        email: response.email,
                        isAdmin: response.isAdmin ?? false,
                        cartdata: response.cartdata,
                        wishlistdata: response.wishlistdata,
                        orderdata: response.orderdata,
                        addressdata: response.addressdata,
                        profileImage: response.profileImage || null,
                    })
                );
            } catch (error) {
                // don't redirect on errors; log for debugging
            console.debug("useCurrentUser: could not fetch user", error);
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
}
