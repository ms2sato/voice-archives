import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as ta from './tweet-arranger';
import * as crawler from './tweet-crawler';

const entry = functions.region('asia-northeast1');
const config = functions.config();

admin.initializeApp(functions.config().firebase);

export const schedule = entry.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  console.log('This will be run every 60 minutes!');
  await ta.arrangeTweets(config.twitter);
  return null;
});

export const scheduleCrawle = entry.pubsub.schedule('every 10 minutes').onRun(async (context) => {
  await crawler.tweetCollector(config.twitter, '#せいゆうろうどくかい図書館', 'raw_tweets')
  return null;
});

export const scheduleOriginalCrawle = entry.pubsub.schedule('every 10 minutes').onRun(async (context) => {
  await crawler.tweetCollector(config.twitter, '#せいゆうろうどくかい', 'raw_original_tweets')
  return null;
});

// export const scheduleOldCrawle = entry.pubsub.schedule('every 3 hours').onRun(async (context) => {
//   await crawler.tweetCollector(config.twitter, '#せいゆうろうどくかい図書館', 'raw_tweets', false)
//   return null;
// });

// export const scheduleOldOriginalCrawle = entry.pubsub.schedule('every 3 hours').onRun(async (context) => {
//   await crawler.tweetCollector(config.twitter, '#せいゆうろうどくかい', 'raw_original_tweets', false)
//   return null;
// });

export const arrangeTweets = entry.https.onRequest(async (request, response) => {
  // if(!config.app.debug) {
  //   throw new Error('Cannot access');
  // }
  response.json(await ta.arrangeTweets(config.twitter));
});

export const crawleTweets = entry.https.onRequest(async (request, response) => {
  response.json(await crawler.tweetCollector(config.twitter, '#せいゆうろうどくかい図書館', 'raw_tweets', false));
});

export const originalCrawleTweets = entry.https.onRequest(async (request, response) => {
  response.json(await crawler.tweetCollector(config.twitter, '#せいゆうろうどくかい', 'raw_original_tweets', false));
});
