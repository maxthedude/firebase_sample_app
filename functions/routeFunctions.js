const axios = require('axios'); // promise based ajax library used in nearly every modern setup
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});
// admin.initializeApp(functions.config().firebase);

const db = admin.firestore(); // init firedb

// clean way using async/await
exports.importDataAsyncAwait = async (req, res) => {
	try {
		// read data from https://jsonplaceholder.typicode.com/users and add the users to the users collection
		const {data:users} = await axios.get("http://jsonplaceholder.typicode.com/users")

		//create firebase batch
		const batch = db.batch();

		// loop over users and add each one to the batch
		users.forEach(user => {
			batch.set(db.collection('users').doc(user.username), user);
		})
		// commit the batch
		const batchResponse = await batch.commit();

		// send response + success message
		res.send({batchResponse,msg:'successfully imported users'});

	} catch (errors) {
		// show what went wrong
		res.status(400).send({msg:'something went wrong',errors});
	}
}

// more confusing way using regular promises
exports.importDataPromise = (req, res) => {
	// read data from https://jsonplaceholder.typicode.com/users and add the users to the users collection

	axios.get("http://jsonplaceholder.typicode.com/users")
	.then(response => response.data) // return the data object from the response
	.then(users => { // users = response.data - but we can name this parameter as we like

		//create firebase batch
		const batch = db.batch();

		// loop over users and add each one to the batch
		users.forEach(user => {
			batch.set(db.collection('users').doc(user.username), user);
		})

		batch.commit().then(batchResponse => {
			res.send({batchResponse,msg:'successfully imported users'});
		}).catch(errors => {
			res.status(400).send({errors,msg:'error while commmiting batch'});
		});
	})
	.catch(errors => {
		console.log({errors})
		res.status(400).send('Something went wrong');
	});
}

exports.timestamp = (req, res) => {
	res.send(`Today is ${new Date()}`);
}
exports.timestampCached = (req, res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	res.send(`Today is ${new Date()}`);
};

exports.writeStaticUser = (req, res) => {
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
};

exports.writeUser = (req, res) => {
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

};

exports.getUser = (req, res) => {
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
	};

exports.getAllUsers = (req, res) => {
		//get the users collection
		var docRef = db.collection("users");
		console.log(docRef);
		res.send('test');
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
		};
