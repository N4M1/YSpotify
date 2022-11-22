const express = require('express');
const Crypto = require('crypto');
const { required } = require('nodemon/lib/config');
const fs = require('fs');
let querystring = require('querystring');
const jwt = require('jsonwebtoken');
const users = require('./users.json');
const {stringify} = require("nodemon/lib/utils");

const app = express();

app.get('/login', (req, res) => {
    const auth = req.header('Authorization');

    const isBasicAuth = auth && auth.startsWith('Basic ');
    if (!isBasicAuth) {
        res.status(401).send('Unauthorized Authorization header is missing');
        return;
    }

    const credentials = auth.split(' ')[1];
    const raw = Buffer.from(credentials, 'base64').toString('utf8');
    const [local_username, local_password] = raw.split(':');

    for (const user of users) {
        let temp_local_password = Crypto.createHash('SHA256').update(local_password).digest('hex');
        if (user.local_user === local_username && user.local_password === temp_local_password) {

            const token = jwt.sign(
                {
                    sub: user.id,
                    local_user: user.local_user,
                    local_password: user.local_password
                },
                'secret',
                {expiresIn: '1 hour'}
            );
            res.json({token});
            return;
        }
    }

    res.status(401).send('Unauthorized Invalid username or password');
});

app.get('/sign', (req, res) => {
    const auth = req.header('Authorization');
    let Exit = false;

    const isBasicAuth = auth && auth.startsWith('Basic ');
    if (!isBasicAuth) {
        res.status(401).send('Unauthorized');
        return;
    }

    const credentials = auth.split(' ')[1];
    const raw = Buffer.from(credentials, 'base64').toString('utf8');
    let [local_username, local_password] = raw.split(':');

    local_username.toLowerCase();

    for (const user of users) {

        if (local_username === user.local_user.toLowerCase()) {
            res.status(200).send('User Already Exists');
            Exit = true;
            return;
        }
    }
    if (Exit == true) {
        return;
    }
    else {
        local_password = Crypto.createHash('SHA256').update(local_password).digest('hex');
        let ID = 0;
        for (const user of users) {
            ID = user.id;
        }
        ID++;
        let data = {
            "id": ID,
            "local_user": local_username,
            "local_password": local_password,
            "spotify_user": "",
            "spotify_password": "",
            "group": ""
        }

        users.push(data);

        users.forEach(function (item, index) {
            fs.writeFile('users.json', JSON.stringify(users), function (err) {
                if (err) return console.log(err);
            });
        });

        res.status(401).send('Nice');
    }
});

app.listen(8888);
console.log('Listening on 8888');
