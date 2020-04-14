import * as http from 'http';
import * as https from 'https';
import * as u from 'url';

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
    for(const host of this.hosts()) {
      const regexStr = `^https?:${host}.+`;
      console.debug(regexStr, url);
      const regex = new RegExp(regexStr);
      if(!url.match(regex)) { continue }

      console.debug('match');
      return HostsHolder.targetHosts[host](record, url);
    }
  }
}

export {HostsHolder, TweetRecord}