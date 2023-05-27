const express = require('express')
const router = express.Router();
const { isAuth, validateSignupData, validateData } = require('../middlewares/authMiddleware');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and generates a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: string
 */
router.post('/login', validateData, async (req, res, next) => {
    // get the informations from body 
    const {username, password} = req.body;

    try {
        
        // get user with username
        const user = await User.findOne({ username: username })
    
        // if doesn't exist 400 not found
        if(!user) {
            // add the list of the errors
            return res.status(400).json({ err: 'user not found'});
        } 
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ err: 'invalid password' });
        }
        
        // if correct create token and redirect to dashboard
        const userForToken = {
            id: user._id,
            username,
            role: user.role
        };
    
        const token = jwt.sign(userForToken, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ token });

    } catch (error) {
        // else put error message to session and redirect to login
        res.status(400).json({ err: '400 Not Found'});
        
    }
    
})

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: User signup
 *     description: Creates a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists or invalid data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: string
 */
router.post('/signup', validateSignupData, async (req, res, next) => {
    // get the informations from body 
    const {username, fullname, email, password, role, isActive } = req.body;

    try {
        
        // get user with username
        let user = await User.findOne({ username: username })
    
        // if doesn't exist 404 not found
        if(user) {
            // add the list of the errors
            return res.status(400).json({ err: 'User with this username exists!!'});
        } 

        user = await User.create({username, fullname, email, password, role, isActive });
        
       
        res.status(201).json({ user });

    } catch (error) {
        // else put error message to session and redirect to login
        res.status(404).json({ err: error.message});
        
    }
    
})

module.exports = router;


