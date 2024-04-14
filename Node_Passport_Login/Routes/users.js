
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport'); 
// User model

const User = require('../models/User');


// Login Page
router.get('/login', (req, res) => {
    console.log('Login page accessed');
    res.render('login');
});

// Register Page
router.get('/register', (req, res) => {
    console.log("Register page accessed");
    res.render('register');
});

// Register Handle
router.post('/register',(req,res)=>{
   const {name, email,password, password2} = req.body;
   let errors = [];

   //Check required fields
   if(!name || !email || !password || !password2){
    errors.push({msg:'Please fill in all fields'});
   }
   //Check passwords match
   if(password !== password2){
    errors.push({msg:'Passwords do not match'})
   }

   //Check password's length
   if(password.length < 5 ){
    errors.push({msg:'Your password should contain atleast 5 characters'})
   }

   const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{5,}$/;
if (!passwordRegex.test(password)) {
   errors.push({ msg: 'Your password should contain numbers, special characters, and alphabets' });
}

   if(errors.length > 0){
    res.render('register',{
        errors,
        name,
        email,
        password,
        password2
    })
   } else {
    // Validation passed
    User.findOne({email: email}).then(user => {
        if(user){
            // User exists
            errors.push({msg: 'Eamil is already registered'});
            res.render('register',{
                errors,
                name,
                email,
                password,
                password2
            });
        } else {
            const newUser = new User({
                name,
                email,
                password
            });
            // Hash Password
           bcrypt.genSalt(10,(err, salt) => bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err) throw err;
            // Set password to hashed
            newUser.password = hash
            // Save user
            newUser.save().then(user =>{
                req.flash('success_msg','You are now registered successfully')
                res.redirect('/login')
            }).catch(err => console.log(err));
           }))
        }
    })
   }
})

// Login Handle
router.post('/login',(req,res,next) => {
    const {name,email,password,password2} = req.body;
    let errors = [];
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next);
})

// Logout

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
  


module.exports = router;
