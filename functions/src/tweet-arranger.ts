import * as admin from 'firebase-admin';
import * as Twitter from 'twitter';
import * as tu from './tweet-upserter';
import * as functions from 'firebase-functions';

function getLimit() {
  const config = functions.config();
  if (config.app.debug) {
    return 3;
  } else {
    return 20;
  }
}

export async function arrangeTweets(config: Twitter.AccessTokenOptions) {

  const db = admin.firestore();
  const tweetRef = db.collection('tweets');
  const rawTweetRef = db.collection('raw_tweets');

  let result = null;
  const limit = getLimit();

  let rawTweetQuery = rawTweetRef.orderBy('id_str')

  const latestTweetSnapshot = await tweetRef.where('va_version', '==', tu.TweetUpserter.version).orderBy('id', 'desc').limit(1).get();
  if (!latestTweetSnapshot.empty) {
    const latestRawId = latestTweetSnapshot.docs[0].data().id_str;
    console.debug(`latestRawId: ${latestRawId}`);
    rawTweetQuery = rawTweetQuery.startAfter(latestRawId);
  }

  const snapshot = await rawTweetQuery.limit(limit).get();

  if (snapshot.empty) {
    console.log('対象raw_tweetがありませんでした');
    return;
  }

  const storedRecords = [];
  for (const dsnapshot of snapshot.docs) {
    const status = dsnapshot.data();
    const storedRecord = await db.runTransaction(async (t) => {
      console.debug(status);
      const tweetUpserter = new tu.TweetUpserter(db, t, tweetRef)
      return await tweetUpserter.upsert(status);
    });
    storedRecords.push(storedRecord);
  }

  result = { data: storedRecords };
  return result;
}