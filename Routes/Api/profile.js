const express = require('express');
const Router = express.Router();
const auth = require('../../middelware/auth');
const Profile = require('../../models/Profile');
const request = require('request');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../../models/user');
const Posts = require('../../models/Posts');

// api/profile/me
Router.get('/me',auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).json({msg: 'there is no profile!'});
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//api/profile
Router.post('/',[auth,[
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty(),
]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }

    const {company,website,location,bio,status,githubusername,skills,facebook,twitter,instagram,linkedin} = req.body;

    const profileFields = {}
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {}
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;
    
    try {
        let profile = await Profile.findOne({user:req.user.id});
        if(profile){
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new:true});
            return res.json(profile);
        }

        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }

});

//api/profile

Router.get('/', async (req,res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.send(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//api/profile/user/:user_id

Router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg: 'profile not found'});
        }
        res.send(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId'){
            return res.status(400).json({msg: 'profile not found'});
        }
        res.status(500).send('Server Error');
    }
});

//api/profile

Router.delete('/',auth, async (req,res) => {
    try {
        //Remove Posts
        await Posts.deleteMany({ user : req.user.id});
        //Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        //Remove user
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'Profile and user removed'});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//api/profile/experience

Router.put('/experience',[auth, [
    check('title','Title is Required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('fromDate', 'From Date is required').not().isEmpty()
]], async (req,res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({msg:error.array()});
    }

    const {title,company,location,from,to,current,description} = req.body;

    const newExp = {title,company,location,from,to,current,description};
    try {
        //Remove profile
        const profile= await Profile.findOne({user: req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//Delete Experience
Router.delete('/experience/:exp_id',auth,async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//api/profile/education

Router.put('/education',[auth, [
    check('school','school is Required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'field of study is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({msg:errors.array()});
    }

    const {school,degree,fieldofstudy,from,to,current,description} = req.body;

    const newEdu = {school,degree,fieldofstudy,from,to,current,description};
    try {
        //Remove profile
        const profile= await Profile.findOne({user: req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//Delete education
Router.delete('/education/:edu_id',auth,async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//api/profile/github/:username

Router.get('/github/:username',(req,res)=>{
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubclientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };

        request(options, (error,response,body) => {
            if(error) console.error(error);

            if(response.statusCode!==200){
                return res.status(404).json({msg: 'no Github profile found'});
            }

            res.json(JSON.parse(body));
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

module.exports = Router;