import * as admin from 'firebase-admin';
import * as Twitter from 'twitter';
import * as hh from './hosts-holder';


const hostsHolder = new hh.HostsHolder();

export async function tweetCollector(config: Twitter.AccessTokenOptions){

  const db = admin.firestore();
  const client = new Twitter(config);
  const tweetCollection = db.collection('tweets');

  return new Promise( (resolve, reject) => {
    const params = {
      q: `#せいゆうろうどくかい図書館 (${hostsHolder.hosts().join(' OR ')}) -filter:retweets filter:links`,
      result_type: 'recent',
      tweet_mode: 'extended',
      count: 15
    };

    console.debug('query', params);

    client.get('search/tweets', params, async function(error: any, tweets: any, response: any) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      const storePromises = tweets.statuses.map(async (status:any)=>{
        const user = status.user;

        const record:hh.TweetRecord = {
          id: status.id,
          id_str: status.id_str,
          text: status.full_text,
          media_urls: [],
          original_urls: [],
          created_at: new Date(status.created_at),
          screen_name: user.screen_name
        };

        const pushUrlPromises = status.entities.urls.map(async (url:any) => {
          record.original_urls.push(url.expanded_url);
          return await hostsHolder.pushUrl(record, url.expanded_url);
        });

        await Promise.all(pushUrlPromises);

        if(record.media_urls.length === 0) {
          console.error(record);
          reject(new Error(`URLが抽出できませんでした: ${JSON.stringify(record)}`));
          return;
        }

        console.debug('before store', record);
        await tweetCollection.doc(record.id_str).set(record);
        return record;
      });

      const storedRecords = await Promise.all(storePromises)
      resolve({data: storedRecords});
    });
  })
}