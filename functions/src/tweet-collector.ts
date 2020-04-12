import * as admin from 'firebase-admin';

const Twitter = require('twitter');

interface TwitterConfig {
  consumer_key: string,
  consumer_secret: string,
  access_token_key: string,
  access_token_secret: string
}

const targetHosts:string[] = [
  "//youtu.be/",
  "//www.youtube.com/",
  "//m.youtube.com/",
  "//soundcloud.com/"
]

export async function tweetCollector(config: TwitterConfig){

  const db = admin.firestore();
  const client = new Twitter(config);
  const tweetCollection = db.collection('tweets');

  return new Promise( (resolve, reject) => {
    const params = {
      q: `#せいゆうろうどくかい図書館 (${targetHosts.join(' OR ')}) -filter:retweets filter:links`,
      result_type: 'recent',
      tweet_mode: 'extended',
      count: 15
    };
    client.get('search/tweets', params, function(error: any, tweets: any, response: any) {
      if (error) {
        console.error(error);
        return reject(error);
      }

      const ret:any = {data: []};
      tweets.statuses.forEach((status:any)=>{
        const user = status.user;

        const urls:string[] = [];
        status.entities.urls.forEach((url:any) => urls.push(url.expanded_url));

        const record = {
          id: status.id,
          id_str: status.id_str,
          text: status.full_text,
          urls: urls,
          created_at: status.created_at,
          screen_name: user.screen_name
        }

        tweetCollection.doc(record.id_str).set(record);
        ret.data.push(record);
      })

      resolve(ret);
    });
  })
}