"use client";

import { setUser } from '@/redux/userSlice';
import { getCurrentUser } from '@/lib/User';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function useCurrentUser() {
  const dispatch = useDispatch();
  const router = useRouter();
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
                addressdata: response.addressdata
            }));
        } catch (error) {
            console.error(error);
        }
    }

    fetchUser();
  }, [dispatch, router])
}
