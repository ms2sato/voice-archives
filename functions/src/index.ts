import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as tc from './tweet-collector';

const entry = functions.region('asia-northeast1');
const config = functions.config();

admin.initializeApp(functions.config().firebase);

export const tweets = entry.https.onRequest((request, response) => {
  const db = admin.firestore();
  db.collection('tweets').get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });

 response.json({test: 'this is test!!!'});
});

export const schedule = entry.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  console.log('This will be run every 5 minutes!');
  await tc.tweetCollector(config.twitter);
  return null;
});

export const retriveTweets = entry.https.onRequest(async (request, response) => {
  // if(!config.app.debug) {
  //   throw new Error('Cannot access');
  // }

  response.json(await tc.tweetCollector(config.twitter));
});
