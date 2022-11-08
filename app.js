const express = require('express');
const Crypto = require('crypto');
const { required } = require('nodemon/lib/config');
import json from "./users.json";

let app = express();

console.log('Listening on 8888');
app.listen(8888);