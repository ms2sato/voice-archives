import * as admin from 'firebase-admin';
import * as Twitter from 'twitter';
import * as hh from './hosts-holder';

const hostsHolder = new hh.HostsHolder();

class TweetIdExchanger {
  rawIdToTweetId(rawId:string) {
    return `tweet:${rawId}`;
  }

  tweetIdToRawId(tweetId:string) {
    return tweetId.replace(/^tweet:/, '');
  }
}

const idExchanger = new TweetIdExchanger();

export async function tweetCollector(config: Twitter.AccessTokenOptions) {

  const db = admin.firestore();
  const tweetRef = db.collection('tweets');
  const rawTweetRef = db.collection('raw_tweets');
  const twittererRef = db.collection('twitterers');
  const mediaUrlRef = db.collection('media_urls');
  let result = null;
  const version = 1;
  const limit = 3;

  db.runTransaction(async (t) => {
    let rawTweetQuery = rawTweetRef.orderBy('id_str')

    const latestTweetSnapshot = await t.get(tweetRef.where('$version', '==', version).orderBy('id', 'desc').limit(1));
    if(!latestTweetSnapshot.empty) {
      const latestRawId =  latestTweetSnapshot.docs[0].data().id_str;
      console.debug(`latestRawId: ${latestRawId}`);
      rawTweetQuery = rawTweetQuery.startAfter(latestRawId);
    }

    const snapshot = await t.get(rawTweetQuery.limit(limit));

    if (snapshot.empty) {
      console.log('対象raw_tweetがありませんでした');
      return;
    }

    const storePromises = snapshot.docs.map(async (dsnapshot: any) => {
      const status = dsnapshot.data();
      console.debug(status);

      const user = status.user;
      const twittererDoc = twittererRef.doc(user.id_str);
      const twittererRecord:hh.TwittererRecord = {
        id: user.id,
        id_str: user.id_str,
        name: user.name,
        screen_name: user.screen_name,
        location: user.location,
        profile_image_url: user.profile_image_url_https,
        description: user.description,
        verified: user.verified,
        created_at: new Date(user.created_at),
        $createdAt: new Date(),
        $updatedAt: new Date(),
        $version: version,
      }
      await t.set(twittererDoc, twittererRecord);

      const record: hh.TweetRecord = {
        id: status.id,
        id_str: status.id_str,
        twittererRef: twittererDoc,
        text: status.full_text,
        media_urls: [],
        original_urls: [],
        created_at: new Date(status.created_at),
        $createdAt: new Date(),
        $updatedAt: new Date(),
        $version: version
      };

      const pushUrlPromises = status.entities.urls.map(async (url: any) => {
        record.original_urls.push(url.expanded_url);

        const insertedUrl = await hostsHolder.pushUrl(record, url.expanded_url);
        if(!insertedUrl) {
          return;
        }

        const id = encodeURIComponent(insertedUrl);
        const mediaUrlDocRef = mediaUrlRef.doc(id)
        const mediaUrlDocSnapshot = await mediaUrlDocRef.get();

        if(mediaUrlDocSnapshot.exists) {
          const data = mediaUrlDocSnapshot.data();
          if(data != null) {
            await t.set(mediaUrlDocRef, {
              count: data.count + 1,
              $updatedAt: new Date(),
              $version: version
            }, {merge: true})
          } else {
            throw new Error(`data not found: media_urls/${id}`);
          }
        } else {
          const mediaUrlRecord:hh.UrlRecord = {
            url: insertedUrl,
            count: 1,
            $createdAt: new Date(),
            $updatedAt: new Date(),
            $version: version
          }
          await t.set(mediaUrlDocRef, mediaUrlRecord);
        }
      });

      await Promise.all(pushUrlPromises);

      if (record.media_urls.length === 0) {
        console.error('URLが抽出できませんでした', record);
        return;
      }

      console.debug('before store', record);
      const docId = idExchanger.rawIdToTweetId(record.id_str);
      return await t.set(tweetRef.doc(docId), record);
    });

    const storedRecords = await Promise.all(storePromises);
    result = { data: storedRecords };
  });

  return result;
}