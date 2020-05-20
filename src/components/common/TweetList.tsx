import React, { useState, useEffect, useRef } from "react";

import { Button, Grid } from '@material-ui/core';
import styles from './../main.css'
import Status from './Status';

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