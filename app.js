const express = require('express');
const Crypto = require('crypto');
const { required } = require('nodemon/lib/config');
const fs = require('fs');


const app = express();

//--------------------Function-------------------------

let User =
    {
        "id": String,
        "local-user": String,
        "local-password": String,
        "spotify-user": String,
        "spotify-password": String
    };

//--------------------Interaction-------------------------

app.get('/login', function(req, res) {

    let local_user = req.query.username || null;
    let local_password = req.query.password || null;

    let code = req.query.code || null;
    let state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        let authOptions = {
            url: 'https://localhost:8888/login',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + Buffer.from((client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };
    }

});

console.log('Listening on 8888');
fs.readFile('./users.json', 'utf8', (err, data) => {
    if (err) {
        console.log(`Error reading file from disk: ${err}`)
    } else {
        // parse JSON string to JSON object
        let users = [];

        users= new Array(JSON.parse(data));

        // print all databases
        if(Array.isArray(users)) {
            console.log("Let's go");
            users.forEach(user => {
                console.log(user.id);
            })
        }
    }
});
app.listen(8888);