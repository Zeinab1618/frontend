import React, { useContext, useState } from 'react'
import profilePic from '../assets/profile_pic.png'  // adjust path if needed
import { AppContext } from '../context/AppContext.jsx'
import { assets } from '../assets/assets.js'
import axios from 'axios'
import { toast } from 'react-toastify'

function MyProfile() {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(null)

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      formData.append('userId', userData._id) // backend needs userId

      if (image) formData.append('image', image)

      const { data } = await axios.post(
        backendUrl + '/api/user/update-profile',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(null)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  if (!userData) {
    return <div className="text-center mt-10">Loading profile...</div>
  }

  return (
    <div className='max-w-lg flex flex-col gap-2 text-sm mx-auto mt-10'>
      {/* PROFILE IMAGE */}
      {isEdit ? (
        <label htmlFor="image">
          <div className='inline-block relative cursor-pointer'>
            <img
              className='w-36 rounded opacity-75'
              src={image ? URL.createObjectURL(image) : userData.image || profilePic}
              alt='profile'
            />
            <img className='w-10 absolute bottom-12 right-12' src={assets.upload_icon} alt='upload' />
          </div>
          <input
            type="file"
            id="image"
            hidden
            onChange={e => setImage(e.target.files[0])}
          />
        </label>
      ) : (
        <img className='w-36 rounded' src={userData.image || profilePic} alt='profile' />
      )}

      {/* NAME */}
      {isEdit ? (
        <input
          className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
          value={userData.name}
          onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
        />
      ) : (
        <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      )}

      <hr className='bg-zinc-400 h-[1px] border-none' />

      {/* CONTACT INFORMATION */}
      <div>
        <p className='text-neutral-500 underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Email:</p>
          <p className='text-blue-500'>{userData.email}</p>

          <p className='font-medium'>Phone:</p>
          {isEdit ? (
            <input
              className='bg-gray-100 max-w-52'
              value={userData.phone}
              onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
            />
          ) : (
            <p className='text-blue-500'>{userData.phone}</p>
          )}

          <p className='font-medium'>Address:</p>
          {isEdit ? (
            <div className="flex flex-col gap-1">
              <input
                className='bg-gray-50'
                value={userData.address.line1}
                onChange={e =>
                  setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))
                }
                placeholder="Address line 1"
              />
              <input
                className='bg-gray-50'
                value={userData.address.line2}
                onChange={e =>
                  setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))
                }
                placeholder="Address line 2"
              />
            </div>
          ) : (
            <p className='text-gray-500'>
              {userData.address.line1} <br />
              {userData.address.line2}
            </p>
          )}
        </div>
      </div>

      {/* BASIC INFO */}
      <div>
        <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender:</p>
          {isEdit ? (
            <select
              className='max-w-20 bg-gray-100'
              value={userData.gender}
              onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Not Selected</option>
            </select>
          ) : (
            <p className='text-gray-500'>{userData.gender}</p>
          )}

          <p className='font-medium'>Birthday:</p>
          {isEdit ? (
            <input
              type="date"
              className="max-w-28 bg-gray-100"
              value={userData.dob !== "Not Selected" ? userData.dob : ""}
              onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
            />
          ) : (
            <p className='text-gray-400'>{userData.dob}</p>
          )}
        </div>
      </div>

      {/* BUTTONS */}
      <div className='mt-10'>
        {isEdit ? (
          <button
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
            onClick={updateUserProfileData}
          >
            Save information
          </button>
        ) : (
          <button
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
            onClick={() => setIsEdit(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

export default MyProfile
