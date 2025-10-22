"use client";
import { Provider } from "react-redux";
import store from "@/redux/store";
import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReactReduxProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    {children}
    <ToastContainer position="bottom-right" />
  </Provider>
);

export default ReactReduxProvider;
