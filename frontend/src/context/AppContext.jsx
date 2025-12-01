import { createContext, useEffect, useState } from "react";

import axios from 'axios'
export const AppContext = createContext();
import { toast } from 'react-toastify'

const AppContextProvider = (props) => {

    const currentSymbol = '$'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(null)
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const loadUserProfileData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', {
                headers: {
                    Authorization: `Bearer ${token}`  // ✅ Fixed header
                }
            })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    const value = {
        doctors,
        currentSymbol,
        token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData,
        getDoctorsData
    }
    useEffect(() => {
        getDoctorsData()
    }, [])


    useEffect(() => {
        if (token) {
            loadUserProfileData()
        } else {
            setUserData(null)
        }
    }, [token])
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider