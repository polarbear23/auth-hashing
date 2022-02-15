const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

const jwtSecret = 'mysecretkey';

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10).then(async (hash) => {
        // Store hash in your password DB.
        const createdUser = await prisma.user.create({
            data: {
                username,
                password: hash
            }
        });
        res.json({ data: createdUser });
    });

});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const foundUser = await prisma.user.findFirst({
        where: {
            username
        }
    });
    if (!foundUser) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    bcrypt.compare(password, foundUser.password, function (err, result) {
        // result == true
        const passwordsMatch = result;

        if (!passwordsMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        const token = jwt.sign({ username }, jwtSecret);
        res.json({ data: token });
    });





});

module.exports = router;
