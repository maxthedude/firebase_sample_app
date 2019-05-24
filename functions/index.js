const express = require('express');
const functions = require('firebase-functions');

const app = express();
const routes = require('./routes');

app.use('/', routes); // use express routes as middleware

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.https.onRequest(app);
