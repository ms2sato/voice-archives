import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  twitterers: {
    textAlign: 'center'
  },
  twitterer: {
    display: 'inline-block',
    textAlign: 'left',
    marginRight: theme.spacing(1),
  },
  card: {
    width: 320
  }
}));

function Twitterer(twitterer) {
  const classes = useStyles();

  return (
    <li className={classes.twitterer}>
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <img src={twitterer.profile_image_url}></img>
          }
          title={
            <Link to={`/twitterers/${twitterer.id_str}`}>
              {twitterer.name}
            </Link>
          }
          subheader={
            <Link to={`/twitterers/${twitterer.id_str}`}>
              {twitterer.screen_name}
            </Link>
          }
        >
        </CardHeader>
      </Card>
    </li>
  )
}

function Twitterers(props: any) {
  const classes = useStyles();
  const [twitterers, setTwitterers] = useState([])

  useEffect(() => {
    if (twitterers.length === 0) {
      props.db.collection("twitterers").get().then(function (snapshots) {
        setTwitterers(snapshots.docs.map((doc) => { return doc.data() }))
      });
    }
  })

  return (
    <div>
      <ul className={classes.twitterers}>
        {twitterers.map((twitterer) => { return <Twitterer key={twitterer.id_str} {...twitterer}></Twitterer> })}
      </ul>
    </div>
  )
}

export default Twitterers