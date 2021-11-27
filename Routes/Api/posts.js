const express = require('express');
const Router = express.Router();
const {check,validationResult} = require('express-validator');
const auth = require('../../middelware/auth');
const Post = require('../../models/Posts');
const User = require('../../models/user');
const Profile = require('../../models/Profile');

//api/posts
Router.post('/',[auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text : req.body.text,
            name : user.name,
            avatar : user.avatar,
            user : req.user.id
        });

        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

// api/posts
//get all posts
Router.get('/',auth, async (req,res) => {
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

// api/posts/:id
//get posts by id
Router.get('/:id',auth, async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg: 'Post not Found'})
        }
        res.json(post);
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not Found'})
        }
        res.status(500).send('server error');
    }
});

// api/posts/:id
//Delete posts by id
Router.delete('/:id',auth, async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg: 'Post not Found'})
        }

        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User Not Authorize'})
        }

        await post.remove();

        res.json({msg: 'Post removed'});

    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({msg: 'Post not Found'})
        }
        res.status(500).send('server error');
    }
});

// api/posts/like/:id
// like a post

Router.put('/like/:id', auth, async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if user has already liked this post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'Post already liked'});
        }

        post.likes.unshift({user : req.user.id});

        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// api/posts/unlike/:id
// like a post

Router.put('/unlike/:id', auth, async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if user has already liked this post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg: 'Post has not been liked'});
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex,1);

        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//api/posts/comment/:id
//comment on post
Router.post('/comment/:id',[auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post  = await Post.findById(req.params.id);


        const newComment = {
            text : req.body.text,
            name : user.name,
            avatar : user.avatar,
            user : req.user.id
        };

        post.comments.unshift(newComment)
        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

// api/posts/comment/:id/:com_id
// delete comment

Router.delete('/comment/:id/:com_id',auth, async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        const comment = post.comments.find(comment => comment.id === req.params.com_id);

        if(!comment){
            return res.status(404).json({msg: 'Comment Does not exists'});
        }

        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'user not authorize'});
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex,1);

        await post.save();

        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

module.exports = Router;