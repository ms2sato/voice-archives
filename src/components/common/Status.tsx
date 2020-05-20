import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { Tweet, Share } from 'react-twitter-widgets'
import { Card, CardContent, CardHeader, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  custom: {
    marginTop: theme.spacing(3),
  },
  hashtag: {
    marginRight: theme.spacing(1)
  },
  screenName: {
    marginRight: theme.spacing(1)
  },
  tweet: {
    margin: "0 auto"
  }
}));

function Status(tweet: any) {
  const classes = useStyles()
  const [twitterer, setTwitterer] = useState(null)

  useEffect(() => {
    if (!twitterer) {
      tweet.twittererRef.get().then((snapshot) => setTwitterer(snapshot.data()))
    }
  })

  if (!twitterer) {
    return (<div>loading...</div>);
  }

  // TODO: あとでリファクタ
  let cards = 'visible';
  const soundcloudOrigin = 'https://soundcloud.com';
  const soundcloudUrl = tweet.media_urls.find(url =>{ return url.startsWith(soundcloudOrigin) })
  let SoundcloudComponent = <></>;
  if (soundcloudUrl) {
    const key = soundcloudUrl.replace(soundcloudOrigin, '');
    //https://w.soundcloud.com/player/?url=/user-683254243/le-petit-prince-4&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=false&show_comments=false&show_playcount=false&show_user=true&hide_related=false&visual=false&start_track=0&callback=true
    const url = `https://w.soundcloud.com/player/?url=${key}&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=false&show_comments=false&show_playcount=false&show_user=true&hide_related=false&visual=false&start_track=0&callback=true`
    SoundcloudComponent = (<iframe width="100%" height="166" scrolling="no" allow="autoplay" frameBorder="0" src={url}></iframe>);
    cards = 'hidden';
  }

  return (
    <li>
      <Card className={classes.custom}>
        <CardHeader
          title={
            <Link to={`/twitterers/${twitterer.id_str}`}>
              <span>{twitterer.name}</span>&nbsp;<span className={classes.screenName}>{twitterer.screen_name}</span>
            </Link>
          }
          subheader={
            tweet.hashtags.map((hashtag) => {
              return (<Link to={`/hashtags/${hashtag}`} key={hashtag} className={classes.hashtag}>#{hashtag}</Link>)
            })
          }
          avatar={<img src={twitterer.profile_image_url}></img>}
        ></CardHeader>
        <CardContent>
          {SoundcloudComponent}
          <Tweet tweetId={tweet.id_str} options={{ conversation: 'none', width: '100%', cards: cards }}></Tweet>
          <Share url={`https://twitter.com/user/status/${tweet.id_str}`} options={{ text: '#せいゆうろうどくかい友の会 https://voice-archives.web.app' }}></Share>
        </CardContent>
      </Card>
    </li>
  )
}

export default Status