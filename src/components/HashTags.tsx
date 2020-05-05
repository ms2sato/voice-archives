import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  hashtags: {
    textAlign: 'center'
  },
  hashtag: {
    display: 'inline-block',
    textAlign: 'left',
    marginRight: theme.spacing(1),
  },
  card: {
    width: 320
  }
}));

function Hashtag(hashtag) {
  const classes = useStyles();

  return (
    <li className={classes.hashtag}>
      <Card className={classes.card}>
        <CardHeader
          title={
            <Link to={`/hashtags/${hashtag.text}`}>
              #{hashtag.text}
            </Link>
          }
        >
        </CardHeader>
      </Card>
    </li>
  )
}

function Hashtags(props: any) {
  const classes = useStyles();
  const [hashtags, setHashtags] = useState([])

  useEffect(() => {
    if (hashtags.length === 0) {
      props.db.collection("hashtags").get().then(function (snapshots) {
        setHashtags(snapshots.docs.map((doc) => { return doc.data() }))
      });
    }
  })

  return (
    <div>
      <ul className={classes.hashtags}>
        {hashtags.map((hashtag) => { return <Hashtag key={hashtag.text} {...hashtag}></Hashtag> })}
      </ul>
    </div>
  )
}

export default Hashtags