"use client";
import { Provider } from "react-redux";
import store from "@/redux/store";
import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setUser } from '@/redux/userSlice';

function UserLoader() {
  // This hook will fetch the current user and populate redux when available.
  useCurrentUser();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  // On mount, try to hydrate user from localStorage so UI (like Navbar) shows
  // the profile image immediately while the network fetch completes.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          dispatch(setUser(parsed));
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [dispatch]);

  // Persist user state to localStorage whenever it changes (small object)
  useEffect(() => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
  }, [user]);

  return null;
}

const ReactReduxProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <UserLoader />
    {children}
    <ToastContainer position="bottom-right" />
  </Provider>
);

export default ReactReduxProvider;
