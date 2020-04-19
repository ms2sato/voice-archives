import * as hh from './hosts-holder';
import * as storage from './lib/storage';

const hostsHolder = new hh.HostsHolder();

class TweetUpserter {
  public static readonly version = 3;
  private t: FirebaseFirestore.Transaction
  private tweetRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
  private twittererRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
  private hashtagRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
  private mediaUrlRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>

  constructor(
    db: FirebaseFirestore.Firestore,
    t: FirebaseFirestore.Transaction,
    tweetRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
  ) {
    this.t = t;
    this.tweetRef = tweetRef;
    this.twittererRef = db.collection('twitterers');
    this.hashtagRef = db.collection('hashtags');
    this.mediaUrlRef = db.collection('media_urls');
  }

  async upsert(status: any) {
    const twittererDocRef = await this.upsertTwitterer(status);
    const hashtags = await this.upsertHashtags(status);

    const record: hh.TweetRecord = {
      id: status.id,
      id_str: status.id_str,
      twittererRef: twittererDocRef,
      text: status.full_text,
      media_urls: [],
      original_urls: [],
      hashtags: hashtags,
      created_at: new Date(status.created_at),
      $createdAt: new Date(),
      $updatedAt: new Date(),
      $version: TweetUpserter.version
    };

    await this.pushUrl(record, status);

    if (record.media_urls.length === 0) {
      console.error('URLが抽出できませんでした', record);
      return;
    }

    console.debug('before store', record);
    const docId = record.id_str;
    await this.t.set(this.tweetRef.doc(docId), record);
    return record;
  }

  private async upsertHashtags(status:any):Promise<string[]> {
    const promises = status.entities.hashtags.map(async (hashtag:any)=>{
      const text = hashtag.text;
      const hastagDocRef = this.hashtagRef.doc(text);
      const upserter = new storage.Upserter<hh.HashtagRecord>(hastagDocRef, this.t);
      await upserter.upsert(
        () => {
          const record: hh.HashtagRecord = {
            text: text,
            count: 1,
            $createdAt: new Date(),
            $updatedAt: new Date(),
            $version: TweetUpserter.version
          };
          return record;
        },
        (data: any) => {
          return {
            count: data.count + 1,
            $updatedAt: new Date(),
            $version: TweetUpserter.version
          };
        }
      )
      return text
    });

    return await Promise.all(promises)
  }

  private async upsertTwitterer(
    status: any
  ): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>> {
    const user = status.user;
    const twittererDocRef = this.twittererRef.doc(user.id_str);

    const upserter = new storage.Upserter<hh.TwittererRecord>(twittererDocRef, this.t);
    upserter.upsert(
      () => {
        const twittererRecord: hh.TwittererRecord = {
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
          $version: TweetUpserter.version,
        }
        return twittererRecord;
      },
      (_data:any) => {
        return {
          name: user.name,
          screen_name: user.screen_name,
          location: user.location,
          profile_image_url: user.profile_image_url_https,
          description: user.description,
          verified: user.verified,
          $updatedAt: new Date(),
          $version: TweetUpserter.version
        }
      }
    );

    return twittererDocRef;
  }

  private async pushUrl(
    record: hh.TweetRecord,
    status: any
  ) {
    const pushUrlPromises = status.entities.urls.map(async (url: any) => {
      record.original_urls.push(url.expanded_url);

      const insertedUrl = await hostsHolder.pushUrl(record, url.expanded_url);
      if (!insertedUrl) {
        return;
      }

      const id = encodeURIComponent(insertedUrl);
      const mediaUrlDocRef = this.mediaUrlRef.doc(id)
      await this.incrementCounterRecord(mediaUrlDocRef, insertedUrl);
    });

    await Promise.all(pushUrlPromises);
  }

  private async incrementCounterRecord(docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, url: string) {
    const upserter = new storage.Upserter<hh.UrlRecord>(docRef, this.t);
    return upserter.upsert(
      () => {
        const mediaUrlRecord: hh.UrlRecord = {
          url: url,
          count: 1,
          $createdAt: new Date(),
          $updatedAt: new Date(),
          $version: TweetUpserter.version
        };
        return mediaUrlRecord;
      },
      (data: any) => {
        return {
          count: data.count + 1,
          $updatedAt: new Date(),
          $version: TweetUpserter.version
        };
      }
    )
  }
}

export { TweetUpserter }
