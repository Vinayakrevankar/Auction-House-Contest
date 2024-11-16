// Notification.tsx
import React from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define options for notifications
const toastOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Generic Notification component that includes the ToastContainer
const Notification: React.FC = () => {
  return <ToastContainer {...toastOptions} />;
};

// Helper functions for different notification types
export const notifySuccess = (message: string) => {
  toast.success(message, toastOptions);
};

export const notifyError = (message: string) => {
  toast.error(message, toastOptions);
};

export const notifyInfo = (message: string) => {
  toast.info(message, toastOptions);
};

export const notifyWarning = (message: string) => {
  toast.warning(message, toastOptions);
};

export default Notification;