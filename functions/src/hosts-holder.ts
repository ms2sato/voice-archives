import * as http from 'http';
import * as https from 'https';
import * as u from 'url';

interface TwittererRecord {
  id: Number,
  id_str: string,
  name: string,
  screen_name: string,
  location: string,
  profile_image_url: string,
  description: string,
  verified: boolean,
  created_at: Date,
  $createdAt: Date,
  $updatedAt: Date,
  $version: Number,
}

interface HashtagRecord {
  text: string,
  count: Number,
  $createdAt: Date,
  $updatedAt: Date,
  $version: Number,
}

interface UrlRecord {
  url: string,
  count: Number,
  $createdAt: Date,
  $updatedAt: Date,
  $version: Number,
}

interface TweetRecord {
  id: Number,
  id_str: string,
  twittererRef: FirebaseFirestore.DocumentReference,
  text: string,
  media_urls: string[],
  original_urls: string[],
  hashtags: string[],
  created_at: Date,
  $createdAt: Date,
  $updatedAt: Date,
  $version: Number,
}

function getHeaders(myURL:string):Promise<{}> {
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
  private static async defaultHostHandler(record:TweetRecord, url:string, arrangeUrl:Function = (rawUrl:string)=>{return rawUrl}) {
    const arrangedUrl = arrangeUrl(url);
    record.media_urls.push(arrangedUrl);
    return arrangedUrl;
  }

  private static async redirectHostHandler(record:TweetRecord, url:string, arrangeUrl:Function = (rawUrl:string)=>{return rawUrl}) {
    return await getHeaders(url).then((headers:any) => {
      const arrangedUrl = arrangeUrl(headers['location'])
      console.debug('addurl', arrangedUrl);
      record.media_urls.push(arrangedUrl);
      return arrangedUrl;
    });
  }

  private static normalizeYoutubeUrl(rawUrl:string){
    return rawUrl.replace(/&.*/, '');
  }

  private static cutParameters(rawUrl:string) {
    return rawUrl.replace(/\?.*/, '');
  }

  private static targetHosts:{ [key: string] : Function } = {
    "//youtu.be/": async (record:TweetRecord, url:string) => {
      return HostsHolder.redirectHostHandler(record, url, HostsHolder.normalizeYoutubeUrl)
    },
    "//youtube.com/": async (record:TweetRecord, url:string) => {
      return HostsHolder.redirectHostHandler(record, url, HostsHolder.normalizeYoutubeUrl)
    },
    "//www.youtube.com/": async (record:TweetRecord, url:string) => {
      return HostsHolder.defaultHostHandler(record, url, HostsHolder.normalizeYoutubeUrl)
    },
    "//m.youtube.com/": async (record:TweetRecord, url:string) => {
      const arrangedUrl = HostsHolder.normalizeYoutubeUrl(url.replace('//m.youtube.com/', '//www.youtube.com/'))
      record.media_urls.push(arrangedUrl);
      return arrangedUrl;
    },
    "//soundcloud.com/": async (record:TweetRecord, url:string) => {
      return HostsHolder.defaultHostHandler(record, url, HostsHolder.cutParameters)
    },
  }

  hosts() {
    return Object.keys(HostsHolder.targetHosts);
  }

  async pushUrl(record:TweetRecord, url:string):Promise<string|null> {
    for(const host of this.hosts()) {
      const regexStr = `^https?:${host}.+`;
      console.debug(regexStr, url);
      const regex = new RegExp(regexStr);
      if(!url.match(regex)) { continue }

      console.debug('match');
      return await HostsHolder.targetHosts[host](record, url);
    }
    return null;
  }
}

export {TwittererRecord, HostsHolder, TweetRecord, HashtagRecord, UrlRecord}