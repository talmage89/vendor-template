import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const useToast = () => {
  const success = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
    });
  };

  const info = (message: string) => {
    toast.info(message, {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
    });
  };

  return { success, info, error };
};
