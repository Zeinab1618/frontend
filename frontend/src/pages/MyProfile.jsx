import React, { useState } from 'react'
import profilePic from '../assets/profile_pic.png'  // عدّلي المسار لو مختلف

function MyProfile() {

  const [userData, setUserData] = useState({
    name: "Edward Vincent",
    image: profilePic,
    email: 'richardjameswap@gmail.com',
    phone: '+1 123 456 7890',
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Church Road, London"
    },
    gender: "Male",
    dob: "2000-01-20"
  })

  const [isEdit, setIsEdit] = useState(false)

  return (
    <div className='max-w-lg flex flex-col gap-2 text-sm mx-auto mt-10'>
      
      <img className='w-36 rounded' src={userData.image} alt='profile' />

      {isEdit ? (
        <input
          className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
          value={userData.name}
          onChange={e =>
            setUserData(prev => ({ ...prev, name: e.target.value }))
          }
        />
      ) : (
        <p className='font-medium text-3xl text-neutral-800 mt-4'>
          {userData.name}
        </p>
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
              onChange={e =>
                setUserData(prev => ({ ...prev, phone: e.target.value }))
              }
            />
          ) : (
            <p className='text-blue-500'>{userData.phone}</p>
          )}

          <p className='font-medium'>Address:</p>
          {isEdit ? (
            <div>
              <input
                className='bg-gray-50 mb-1'
                value={userData.address.line1}
                onChange={e =>
                  setUserData(prev => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value }
                  }))
                }
              />
              <br />
              <input
                className='bg-gray-50'
                value={userData.address.line2}
                onChange={e =>
                  setUserData(prev => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value }
                  }))
                }
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
              onChange={e =>
                setUserData(prev => ({ ...prev, gender: e.target.value }))
              }
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          ) : (
            <p className='text-gray-500'>{userData.gender}</p>
          )}

          <p className='font-medium'>Birthday:</p>
          {isEdit ? (
            <input
              type='date'
              className='max-w-28 bg-gray-100'
              value={userData.dob}
              onChange={e =>
                setUserData(prev => ({ ...prev, dob: e.target.value }))
              }
            />
          ) : (
            <p className='text-gray-400'>{userData.dob}</p>
          )}
        </div>
      </div>

      <div className='mt-10'>
        {isEdit ? (
          <button
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
            onClick={() => setIsEdit(false)}
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
