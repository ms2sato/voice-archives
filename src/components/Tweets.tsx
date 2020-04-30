import React, { useState, useEffect, useRef } from "react";
import { Tweet } from 'react-twitter-widgets'
import styles from './main.css'

function Status(data: any) {
  return (
    <li>
      <Tweet tweetId={data.id_str} options={{ conversation: 'none' }}></Tweet>
    </li>
  )
}

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
    return props.db
      .collection("tweets")
      .orderBy("created_at", "desc")
      .limit(props.pageLimit || 10);
  }

  const next = () => {
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
    <div className={loading ? styles.loading : ''}>
      <ul className="statuses">
        {statuses.map((status) => { return <Status key={status.id_str} {...status}></Status> })}
      </ul>
      <div className="actions _cream">
        <a className="next" onClick={next}>次を読み込む</a>
        <div className="progressbar">
          <div className="-bar _primary"></div>
        </div>
      </div>
    </div>
  )
}

function Tweets(props: any) {
  return (
    <div className="container">
      <div className="row">
        <div className="col m6">
          <TweetList {...props} ></TweetList>
        </div>
      </div>
    </div>
  )
}

export default Tweets