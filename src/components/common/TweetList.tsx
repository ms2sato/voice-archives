import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { Tweet } from 'react-twitter-widgets'
import { Card, CardContent, CardHeader, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import styles from './../main.css'

const Status = (() => {
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

    return (
      <li>
        <Card className={classes.custom}>
          <CardHeader
            title={
              <Link to={`/twitterers/${twitterer.id_str}`}>
                <span>{twitterer.name}</span><span className={classes.screenName}>{twitterer.screen_name}</span>
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
            <Tweet tweetId={tweet.id_str} options={{ conversation: 'none' }}></Tweet>
          </CardContent>
        </Card>
      </li>
    )
  }

  return Status;
})();

function TweetList(props: any) {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastSnapshot, setLastSnapshot] = useState(null)
  const tweetsRef = useRef(getTweetsRef())

  useEffect(() => {
    if (loading && statuses.length === 0) {
      tweetsRef.current.get().then((snapshots) => {
        receiveSnapshots(snapshots)
      });
    }
  });

  function getTweetsRef() {
    let criteria = props.criteria;
    if (!criteria) {
      criteria = (collection) => { return collection; }
    }

    return criteria(props.db
      .collection("tweets")
      .orderBy("created_at", "desc")
      .limit(props.pageLimit || 10));
  }

  const next = (e) => {
    e.preventDefault();

    console.log('next')
    setLoading(true)
    tweetsRef.current.startAfter(lastSnapshot).get().then((snapshots) => {
      receiveSnapshots(snapshots)
    });
  }

  const receiveSnapshots = (snapshots) => {
    setLoading(false);
    setStatuses([...statuses, ...snapshots.docs.map((snapshot) => snapshot.data())])
    setLastSnapshot(snapshots.docs[snapshots.docs.length - 1])
  }

  return (
    <Grid container spacing={6} className={loading ? styles.loading : ''}>
      <Grid item md={3}></Grid>
      <Grid item md={6}>
        <ul className="statuses">
          {statuses.map((status) => { return <Status key={status.id_str} {...status}></Status> })}
        </ul>
        {lastSnapshot ? (
          <Button variant="contained" color="primary" fullWidth={true} onClick={next}>
            次を読み込む
          </Button>
        ) : ''}
      </Grid>
      <Grid item md={3}></Grid>
    </Grid>
  )
}

export default TweetList