const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');
const app = express();

admin.initializeApp(functions.config().firebase);

/*admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
}); */

let db = admin.firestore();



app.get('/timestamp', (req,res) => {
	res.send(`Today is ${new Date()}`);
});

app.get('/timestamp-cached', (req,res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	res.send(`Today is ${new Date()}`);
});

app.get('/dbaccess/writeStaticUser', (req,res) => {
	console.log('called dbaccess');
	var aTuringRef = db.collection('users').doc('aturing');

	var setAlan = aTuringRef.set({
	'first': 'Alan',
	'middle': 'Mathison',
	'last': 'Turing',
	'born': 1912
	}).then(() => {
    res.send('successfully written to db');
  }).catch(errors => console.error({errors}));
  
});


app.get('/dbaccess/writeUser/:username/:email/:password', (req,res) => {
	console.log('called dbaccess');
	var userRef = db.collection('users').doc(req.params.username);
	console.log(req.params);
	var setAlan = userRef.set({
	'username': req.params.username,
	'email': req.params.email,
	'password': req.params.password
	}).then(() => {
    res.send('successfully written to db');
  }).catch(errors => console.error({errors}));
  
});
const user = {
	firstname: 'test',
	lastname: 'test'
} // des wär a json object

//JSON.stringify(user) // würd aus dem des machen {firstname:"test",lastname:"test"} - also wirklich als string und ned mehr als json

/**
 * Simple request that extracts data from firebase firestore (database)
 */
app.get('/userProfile/:username', (req, res) => {
  //get the users collection
  var docRef = db.collection("users");
  //.doc(req.params.username);
  var query = docRef .where('username', '==', req.params.username).get()
  .then(snapshot => {
    if (snapshot.empty) {
      res.send('Username not found');
    }

    snapshot.forEach(doc => {
      console.log(doc.id, ' =>' , doc.data());
    });

  }).catch(err => {
    console.error({errors});
  });
  
	// See https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
	docRef.get().then((doc) => {
		if (doc.exists) {
			return res.status(200).json(doc.data());
		} else {
			return res.status(400).json({"message":"Username not found."});
		}
	}).catch((error) => {
		return res.status(400).json({"message":"Unable to connect to Firestore."});
	});
  });




// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.https.onRequest(app);
