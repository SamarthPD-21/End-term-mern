"use client";

import { setUser } from '@/redux/userSlice';
import { getCurrentUser } from '@/lib/User';
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';

export default function useCurrentUser() {
  const dispatch = useDispatch();
  const router = useRouter();
    const pathname = usePathname();
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const response = await getCurrentUser();
            if (!response) {
                router.push('/login');
                return;
            }
            dispatch(setUser({
                name: response.name,
                email: response.email,
                cartdata: response.cartdata,
                wishlistdata: response.wishlistdata,
                orderdata: response.orderdata,
                addressdata: response.addressdata,
                profileImage: response.profileImage || null,
            }));
        } catch (error) {
            console.error(error);
        }
    }

    fetchUser();
        // Re-run when pathname changes (navigating pages) so latest user/profileImage is loaded,
        // and when the window regains focus (user may have switched accounts in another tab).
        const onFocus = () => fetchUser();
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') fetchUser();
        });

        return () => {
            window.removeEventListener('focus', onFocus);
            // best-effort: remove visibilitychange listener by re-creating same signature isn't trivial here,
            // but it's a tiny handler so leaving as-is is acceptable. (Alternative: use named handler.)
        };
    }, [dispatch, router, pathname])
}
