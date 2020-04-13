import * as admin from 'firebase-admin';
import * as http from 'http';
import * as https from 'https';
import * as u from 'url';
import * as Twitter from 'twitter';

interface TweetRecord {
  id: Number,
  id_str: string,
  text: string,
  media_urls: string[],
  original_urls: string[],
  created_at: Date,
  screen_name: string
}

function getHeaders(myURL:string) {
  const parsedURL = u.parse(myURL)
  const options = {
    protocol: parsedURL.protocol,
    hostname: parsedURL.hostname,
    method: 'HEAD',
    path: parsedURL.path
  }
  const protocolHandler = (parsedURL.protocol === 'https:' ? https : http)

  return new Promise((resolve, reject) => {
    const req = protocolHandler.request(options, (res:any) => {
      resolve(res.headers)
    })
    req.on('error', (e:Error) => {
      reject(e)
    })
    req.end()
  })
}

class HostsHolder {
  private static async defaultHostHandler(record:TweetRecord, url:string) {
    record.media_urls.push(url);
    return url;
  }

  private static async redirectHostHandler(record:TweetRecord, url:string) {
    return getHeaders(url).then((headers:any) => {
      const rawUrl = headers['location'];
      record.media_urls.push(rawUrl);
      return rawUrl
    });
  }

  private static targetHosts:{ [key: string] : Function } = {
    "//youtu.be/": HostsHolder.redirectHostHandler,
    "//youtube.com/": HostsHolder.redirectHostHandler,
    "//www.youtube.com/": HostsHolder.defaultHostHandler,
    "//m.youtube.com/": async (record:TweetRecord, url:string) => {
      record.media_urls.push(url.replace('//m.youtube.com/', '//www.youtube.com/'));
      return url;
    },
    "//soundcloud.com/": HostsHolder.defaultHostHandler
  }

  hosts() {
    return Object.keys(HostsHolder.targetHosts);
  }

  async pushUrl(record:TweetRecord, url:string) {
    for(let host of this.hosts()) {
      const regexStr = `^https?:${host}.+`;
      console.debug(regexStr, url);
      const regex = new RegExp(regexStr);
      if(!url.match(regex)) { continue }

      console.debug('match');
      return HostsHolder.targetHosts[host](record, url);
    }
  }
}

const hostsHolder = new HostsHolder();

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

        const record:TweetRecord = {
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

        if(record.media_urls.length == 0) {
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