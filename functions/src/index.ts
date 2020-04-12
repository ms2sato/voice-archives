import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as tc from './tweet-collector';

const entry = functions.region('asia-northeast1');
const config = functions.config();

admin.initializeApp(functions.config().firebase);

export const schedule = entry.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  console.log('This will be run every 60 minutes!');
  await tc.tweetCollector(config.twitter);
  return null;
});

export const retriveTweets = entry.https.onRequest(async (request, response) => {
  // if(!config.app.debug) {
  //   throw new Error('Cannot access');
  // }
  response.json(await tc.tweetCollector(config.twitter));
});
