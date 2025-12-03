import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currentSymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);

  // Fetch doctors from backend ONLY
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);   // ONLY real doctors
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Fetch user profile
  const loadUserProfileData = async () => {
    if (!token) return setUserData(null);

    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/get-profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) setUserData(data.userData);
      else toast.error(data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  

  // Load doctors on page load
  useEffect(() => {
    getDoctorsData();
  }, []);

  // Load profile when token changes
  useEffect(() => {
    if (token) loadUserProfileData();
    else setUserData(null);
  }, [token]);

  const value = {
    doctors,getDoctorsData,
    currentSymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,

  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;