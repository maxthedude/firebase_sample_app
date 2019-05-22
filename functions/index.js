const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');
const app = express();
const http = require('http');

admin.initializeApp(functions.config().firebase);

/*admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
}); */

let db = admin.firestore();

app.get('/importData', (req, res) => {
	// read data from https://jsonplaceholder.typicode.com/users and add the users to the users collection
	let jsonValues = readData();
	if (jsonValues != null)
		res.status(200).send('Json Data read successfully');
	else {
		res.status(400).send('Something went wrong');
	}
});

function readData() {
		req = http.get("http://jsonplaceholder.typicode.com/users", function(res) {
		let data = '',
			json_data;
	
		res.on('data', function(stream) {
			data += stream;
		});
		res.on('end', function() {
		json_data = JSON.parse(data);
	
			// will output a Javascript object
			console.log(json_data);
			return json_data;
		});
	});
	
	req.on('error', function(e) {
			console.log(e.message);
	});
}


app.get('/timestamp', (req, res) => {
	res.send(`Today is ${new Date()}`);
});

app.get('/timestamp-cached', (req, res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	res.send(`Today is ${new Date()}`);
});

app.get('/dbaccess/writeStaticUser', (req, res) => {
	console.log('called dbaccess');
	let aTuringRef = db.collection('users').doc('aturing');

	let setAlan = aTuringRef.set({
		'first': 'Alan',
		'middle': 'Mathison',
		'last': 'Turing',
		'born': 1912
	}).then(() => {
		res.send('successfully written to db');
	}).catch(errors => console.error({ errors }));

});


app.get('/dbaccess/writeUser/:username/:email/:password', (req, res) => {
	console.log('called dbaccess');
	let userRef = db.collection('users').doc(req.params.username);
	console.log(req.params);
	let setAlan = userRef.set({
		'username': req.params.username,
		'email': req.params.email,
		'password': req.params.password
	}).then(() => {
		res.send('successfully written to db');
	}).catch(errors => console.error({ errors }));

});


/**
 * Simple request that extracts data from firebase firestore (database)
 */
app.get('/userProfile/:username', (req, res) => {
	//get the users collection
	let docRef = db.collection("users");
	let users = [];
	//.doc(req.params.username);
	var query = docRef.where('username', '==', req.params.username).get()
		.then(snapshot => {
			if (snapshot.empty) {
				users.push('Username not found');
			}

			snapshot.forEach(doc => {
				console.log(doc.id, ' =>', doc.data());
				users.push(doc.data());
			});
			res.send((JSON.stringify(users)));

		}).catch(err => {
			console.error({err});
		});
	});

	/**
	 * reads all users from the corresponding collection
	 */
	app.get('/getAllUsers', (req, res) => {
		//get the users collection
		var docRef = db.collection("users");
		var users = [];
		//.doc(req.params.username);
		var query = docRef.get()
			.then(snapshot => {
				if (snapshot.empty) {
					users.push('No Users in Database');
				}
	
				snapshot.forEach(doc => {
					console.log(doc.id, ' =>', doc.data());
					users.push(doc.data());
				});
				res.json(users);
	
			}).catch(err => {
				console.error({err});
			});
		});
	


	// Create and Deploy Your First Cloud Functions
	// https://firebase.google.com/docs/functions/write-firebase-functions

	exports.app = functions.https.onRequest(app);
