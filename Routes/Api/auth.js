const express = require('express');
const Router = express.Router();
const auth = require('../../middelware/auth');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');


//Login User
Router.post('/',[
    check('email', 'Enter Valid Email').isEmail(),
    check('password', 'password Required').exists(),
],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(500).json({error: [{msg: "Invalid Credential"}]});
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(500).json({error: [{msg: "Invalid Credential"}]});
        }
        
        const payload = {
            user: {
                id: user.id
            }
        }; 
        jwt.sign(payload, config.get('jwtToken'), (err, token) => {
            if(err) throw err;
            res.json({token});
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('server error');
    }
});


//get user by id
Router.get('/',auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = Router;