import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  console.log('=== DEBUG: MyAppointments component rendered ===');
  console.log('Context values - backendUrl:', backendUrl);
  console.log('Context values - token exists:', !!token);

  // Fetch user's appointments
  const fetchAppointments = async () => {
    if (!token) {
      console.log('❌ No token, cannot fetch appointments');
      return;
    }
    
    try {
      setLoading(true);
      
      // 🔍 DEBUG: Log what we're doing
      console.log('=== DEBUG: FETCHING APPOINTMENTS ===');
      console.log('1. Backend URL:', backendUrl);
      console.log('2. Full API URL:', backendUrl + '/api/user/appointments');
      console.log('3. Token exists:', !!token);
      console.log('4. Token first 20 chars:', token.substring(0, 20) + '...');
      
      const response = await axios.get(backendUrl + '/api/user/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 🔍 DEBUG: Log the response
      console.log('=== DEBUG: RESPONSE RECEIVED ===');
      console.log('5. Response status:', response.status);
      console.log('6. Response data:', response.data);
      console.log('7. Success property:', response.data.success);
      console.log('8. Appointments array:', response.data.appointments);
      console.log('9. Number of appointments:', response.data.appointments?.length || 0);
      
      if (response.data.success) {
        setAppointments(response.data.appointments || []);
        console.log('✅ Appointments set to state:', response.data.appointments?.length || 0);
        
        // 🔍 ADDED DEBUGGING: Check first appointment details
        if (response.data.appointments && response.data.appointments.length > 0) {
          console.log('🔍 FIRST APPOINTMENT DETAILS:');
          console.log('1. slotDate:', response.data.appointments[0].slotDate);
          console.log('2. slotTime:', response.data.appointments[0].slotTime);
          console.log('3. slotId:', response.data.appointments[0].slotId);
          console.log('4. docData:', response.data.appointments[0].docData);
          console.log('5. amount:', response.data.appointments[0].amount);
        }
      } else {
        console.log('❌ Backend returned success: false');
        console.log('❌ Error message:', response.data.message);
      }
      
    } catch (error) {
      console.error('=== DEBUG: ERROR CAUGHT ===');
      console.error('Error message:', error.message);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    } finally {
      setLoading(false);
      console.log('=== DEBUG: LOADING COMPLETE ===');
    }
  };

  useEffect(() => {
    console.log('=== DEBUG: useEffect triggered ===');
    console.log('Token changed:', !!token);
    console.log('Backend URL:', backendUrl);
    
    fetchAppointments();
  }, [token, backendUrl]);

  // Function to extract date from slotId
  const getDateFromSlotId = (slotId) => {
    if (!slotId) return 'Date not set';
    
    // slotId format: "slot_docId_day_month_year_time"
    // Example: "slot_692e2941c29b8978c7e4a729_5_12_2025_1030 AM"
    
    const parts = slotId.split('_');
    if (parts.length >= 5) {
      // parts[2] = day, parts[3] = month, parts[4] = year
      const day = parts[2];
      const month = parts[3];
      const year = parts[4];
      return `${day}/${month}/${year}`;
    }
    
    return 'Invalid date format';
  };

  // Format date for booking date
  const formatBookingDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      
      
      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No appointments booked yet.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Book an Appointment
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appointment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Dr. {appointment.docData?.name || 'Doctor'}
                  </h2>
                  <p className="text-gray-600">{appointment.docData?.speciality || 'Specialist'}</p>
                </div>
                <div className={`px-4 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 ${
                  appointment.cancelled ? 'bg-red-100 text-red-800' : 
                  appointment.isCompleted ? 'bg-green-100 text-green-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {appointment.cancelled ? 'Cancelled' : 
                   appointment.isCompleted ? 'Completed' : 
                   appointment.payment ? 'Confirmed' : 'Pending Payment'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Appointment Date & Time</p>
                  <p className="font-medium">
                    {getDateFromSlotId(appointment.slotId)} at {appointment.slotTime || 'Time not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booked On</p>
                  <p className="font-medium">
                    {formatBookingDate(appointment.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fees</p>
                  <p className="font-medium">${appointment.amount || '0'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {!appointment.cancelled && !appointment.isCompleted && !appointment.payment && (
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
                    Pay Now
                  </button>
                )}
                
                {!appointment.cancelled && !appointment.isCompleted && (
                  <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                    Cancel Appointment
                  </button>
                )}
                
                {/* "View Details" button has been removed */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyAppointments