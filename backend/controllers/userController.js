import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/docrotModel.js'
import appointmentModel from '../models/appointmentModel.js'



// API TO REGISTER USER
const registerUser = async (req, res) => {

    try {
        const { docId, slotDate, slotTime } = req.body;
        

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing details" })
        }
        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a Valid Email" })
        }
        // validating astrong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter strong password" })
        }
        // hashing user password 
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(password, salt)
        const userData = {
            name,
            email,
            password: hashedpassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API  for user login
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User dose not exist" })


        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// api get user profile data

const getProfile = async (req, res) => {
    try {
        // Option A: From middleware (recommended)
        const userId = req.userId

        // Option B: From query (alternative)
        // const { userId } = req.query

        if (!userId) {
            return res.json({ success: false, message: "User ID required" })
        }

        const userData = await userModel.findById(userId).select('-password')

        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to update user profile
const updateProfile = async (req, res) => {
    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })
        if (imageFile) {

            // upload image 
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })

            const imageUrl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageUrl })
        }

        res.json({ success: true, message: "profile updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to book appointment - FIXED VERSION
const bookAppointment = async (req, res) => {
    try {
        console.log("=== BOOK APPOINTMENT ===");
        console.log("User ID from token:", req.userId); // From middleware
        console.log("Request Body:", req.body);

        // Get userId from middleware (NOT from request body)
        const userId = req.userId; // ⬅️ This comes from authUser middleware
        
        const { docId, slotDate, slotTime, slotId } = req.body;

        // Validate required fields
        if (!userId) {
            return res.json({ success: false, message: 'User ID not found. Please login again.' });
        }
        
        if (!docId || !slotDate || !slotTime || !slotId) {
            return res.json({ 
                success: false, 
                message: 'Missing required fields. Need: docId, slotDate, slotTime, slotId' 
            });
        }

        console.log("✅ All fields present:", { userId, docId, slotDate, slotTime, slotId });

        // Find doctor
        const docData = await doctorModel.findById(docId).select('-password');
        
        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' });
        }

        // Check slot availability
        let slots_booked = docData.slots_booked || {};
        
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot already booked' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        // Get user data from database (REQUIRED by your model)
        const userData = await userModel.findById(userId).select('-password');
        
        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Prepare doctor data
        const docDataForAppointment = {
            name: docData.name,
            degree: docData.degree,
            speciality: docData.speciality,
            image: docData.image,
            experience: docData.experience,
            fees: docData.fees,
            about: docData.about,
            available: docData.available
        };

        // Create appointment data
        const appointmentData = {
            userId: userId, // String type as per your model
            docId: docId,
            docData: docDataForAppointment,
            amount: docData.fees,
            userData: userData.toObject(), // Convert to plain object
            slotTime: slotTime,
            slotDate: slotDate,
            slotId: slotId,
            date: Date.now(),
            cancelled: false,
            payment: false,
            isCompleted: false
        };

        console.log("Appointment Data to save:", appointmentData);

        // Save appointment
        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // Update doctor's booked slots
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ 
            success: true, 
            message: 'Appointment booked successfully',
            appointmentId: newAppointment._id 
        });

    } catch (error) {
        console.log("Error in bookAppointment:", error);
        res.json({ success: false, message: error.message });
    }
}

// Add this function
const getUserAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId })
            .sort({ date: -1 });
        
        res.json({ 
            success: true, 
            appointments 
        });
    } catch (error) {
        console.log(error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
}





export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, getUserAppointments}