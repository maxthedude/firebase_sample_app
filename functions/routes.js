const express = require('express');
const router = express.Router();
const routeFunctions = require('./routeFunctions');

router.get('/', (req,res)=> {
	res.send('hi there');
})

router.get('/importData', routeFunctions.importDataAsyncAwait);
router.get('/timestamp', routeFunctions.timestamp);
router.get('/timestamp-cached', routeFunctions.timestampCached);
router.get('/dbaccess/writeStaticUser',routeFunctions.writeStaticUser);
router.get('/dbaccess/writeUser/:username/:email/:password', routeFunctions.writeUser);
 // Simple request that extracts data from firebase firestore (database)
router.get('/userProfile/:username', routeFunctions.getUser);

 // reads all users from the corresponding collection
router.get('/getAllUsers', routeFunctions.getAllUsers);

module.exports = router;