const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const User = require("../../models/User");

router.post("/register", (req, res) =>{
    const {errors, isValid} = validateRegisterInput(req.body);
    if (!isValid){
        return res.status(400).json(errors);
    }
//find alredy in use users
    User.findOne({email: req.body.email}).then(user =>{
        if (user) {
            return res.status(400).json({ email: "User already exists"
        });
        } 
        else{
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });
         bcrypt.genSalt(10, (err, salt) =>{
             bcrypt.hash(newUser.password, salt, (err, hash) =>{
                 if (err) throw err;
                 newUser.password = hash;
                 newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
             });
         });
       }
    });
});

router.post("/login", (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);
    
    if (!isValid){
        return res.status(400).json(errors);
    }

    const email = req.body.email;
        const password = req.body.password;

        User.findOne({email}).then(user => {
            if (!user){
                return res.status(404).json({emailnotfound: "Email does not match our records"
             });
                 }
        bcrypt.compare(password, user.password).then(isMatch => {
          if (isMatch){
            const payload ={
                id: user.id,
                name: user.name
            };

            jwt.sign(
                payload,
                keys.secretOrKey,
                {
                    expiresIn: 15778463 // 6 months in seconds
                },
                (err, token) => {
                    res.json({
                        succcess: true,
                        token: "Bearer" + token
                    });
                }
             );
            } else {
              return res 
                .status(400)
                .json({passwordincorrect: "Password does not match our records"});
          }
        });
     });
});

module.exports = router;