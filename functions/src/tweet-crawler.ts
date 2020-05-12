import * as admin from 'firebase-admin';
import * as Twitter from 'twitter';
import * as hh from './hosts-holder';

const hostsHolder = new hh.HostsHolder();

export async function tweetCollector(config: Twitter.AccessTokenOptions, query:string, collection:string, toLatest:boolean = true){

  const db = admin.firestore();
  const client = new Twitter(config);
  const rawTweetsCollection = db.collection(collection);

  return new Promise( async (resolve, reject) => {
    const params:any = {
      q: `(${query}) (${hostsHolder.hosts().join(' OR ')}) -filter:retweets filter:links`,
      result_type: 'recent',
      tweet_mode: 'extended',
      count: 50
    };

    if(toLatest) {
      const lastSnapshots = await rawTweetsCollection.orderBy('id_str', 'desc').limit(1).get();
      const since_id = lastSnapshots.empty ? -1 : lastSnapshots.docs[0].data().id_str;
      params.since_id = since_id;
    } else {
      const lastSnapshots = await rawTweetsCollection.orderBy('id_str').limit(1).get();
      const max_id = lastSnapshots.empty ? -1 : lastSnapshots.docs[0].data().id_str;
      params.max_id = max_id;
    }

    console.debug('query', params);

    client.get('search/tweets', params, async function(error: any, tweets: any, response: any) {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      if(tweets.statuses.length === 0) {
        console.log('取りきりました', params);
        resolve({status: 'finished'});
        return;
      }

      const storePromises = tweets.statuses.map(async (status:any)=>{
        console.debug('before store', status);
        await rawTweetsCollection.doc(status.id_str).set(status);
        return status;
      });

      const storedRecords = await Promise.all(storePromises)
      resolve({data: storedRecords});
    });
  })
}