import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'



// API TO REGISTER USER
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body
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
export { registerUser, loginUser, getProfile, updateProfile }