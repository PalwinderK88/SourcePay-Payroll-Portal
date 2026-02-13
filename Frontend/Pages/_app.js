import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import socketClient from '../utils/socket';
import Chatbot from '../Components/Chatbot';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Socket.IO connection if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          socketClient.connect(user.id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      socketClient.disconnect();
    };
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Chatbot />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default MyApp;
