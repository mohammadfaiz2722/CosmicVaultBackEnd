const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const OTP_SECRET = "OTPSecret";

const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET="LetThatSinkIN"
const sendEmail=require('../emailService')
// const { is } = require('@react-three/fiber/dist/declarations/src/core/utils');
const router = express.Router();

// Route to create a new user
router.post('/createuser', async (req, res) => {
    try {
        // Check if a user with the given email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ message: "Sorry, a user already exists with this email" });
        }

        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        const data = {
            user: {
              id: user.id
            }
          };
          const authToken = jwt.sign(data, JWT_SECRET);
          res.json({ authToken, message: "Login Successfully",authToken,id:user.id});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});



router.post('/login', async (req, res) => {
    try {
        // Destructure email and password from req.body
        const { email, password, id } = req.body;

        // Find user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
       
        // Compare provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Try again using valid credentials" });
        }

        // If credentials are valid, return the user object
        const data = {
          user: {
            id: user.id
          }
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken, message: "Login Successfully",id:user.id });
    } catch (e) {
        console.error(e.message);
        res.status(500).send("Internal Server Error");
    }
});


router.post('/forgotpassword', async (req,res) => {
    try {

        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Try again using valid credentials" });

        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpToken = jwt.sign({ otp, email }, OTP_SECRET, { expiresIn: '10m' });


        // console.log(otpToken)

        sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is ${otp}`);
        res.json({ message: "Email sent successfully to your email" ,otpToken,email});

    }
    catch (error) {
        console.error(error.message)
        return res.send("Internal server occurred")
    }
})

router.post('/getuser', async (req, res) => {
  try {
   const {email}=req.body;
   const user=await User.findOne({email})
   res.json({user})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});
// router.post('/getuser', fetchuser, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select("-password");
//     res.json(user);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Internal server error");
//   }
// });

router.post('/verifyotp', async (req, res) => {
    const { otp, otpToken, email } = req.body;
  
    if (!otp || !otpToken || !email) {
      return res.status(400).json({ error: 'OTP, OTP token, and email are required' });
    }
  
    try {
      const decoded = jwt.verify(otpToken, OTP_SECRET);
  
      if (decoded.otp === otp && decoded.email === email) {
        return res.json({ message: 'OTP verified' });
      } else {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/resetpassword', async (req, res) => {
    const { email, newPassword } = req.body;
  
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
  
    try {
      let user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const saltRounds = 10; // Salt rounds for bcrypt
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
      console.error('Error resetting password:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.post('/sendemail', async(req,res)=>{
    try
    {

      const {name,email,description}=req.body;
      if (!email || !name || !description) {
        return res.status(400).json({ error: 'Email and new password are required' });
      }
      sendEmail("iamfaiz261@gmail.com", `Customer Email:${email} ,Name:${name}`, `${description}`);
     return res.status(200).json({Message:"Email Sent Successfully"}) 
    }
    catch(e){
      console.error(e.message);
      res.status(400).json({message:"Internal Server Error"})
    }

  })


  router.post('/updateuser', async (req, res) => {
    const { email, name } = req.body;
  
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.name = name;
      await user.save(); // Ensure to await the save operation
  
      return res.status(200).json({ message: 'User updated successfully' ,user });
    } catch (error) {
      console.error('Error updating user:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
module.exports = router;
// module.exports = router;
// 
