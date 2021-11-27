const express = require('express');
const Router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');

//Register User
Router.post('/',[
    check('name', 'Enter Valid name').not().isEmpty(),
    check('email', 'Enter Valid Email').isEmail(),
    check('password', 'password should contain min of 6 charactar').isLength({min:6}),
],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {name,email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if(user){
            return res.status(500).json({error: [{msg: "User Already Exists"}]});
        }
        const avatar = gravatar.url(email,{
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        users = new User({
            name,
            email,
            password,
            avatar
        });

        const salt = await bcrypt.genSalt(10);

        users.password = await bcrypt.hash(password, salt);
        await users.save();

        const payload = {
            users: {
                id: users.id
            }
        }

        jwt.sign(payload, config.get('jwtToken'), (err, token) => {
            if(err) throw err;
            res.json({token});
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('server error');
    }
});

module.exports = Router;