/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'react-toastify' {
  import * as React from 'react';

  export const toast: {
    success: (msg: string, opts?: any) => void;
    error: (msg: string, opts?: any) => void;
    info: (msg: string, opts?: any) => void;
    warn: (msg: string, opts?: any) => void;
    dismiss: (id?: any) => void;
  };

  export const ToastContainer: React.FC<any>;

  export default ToastContainer;
}
