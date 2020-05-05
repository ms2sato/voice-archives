import React from "react";
import TweetList from './common/TweetList'

function Tweets(props: any) {
  return (
    <TweetList {...props} ></TweetList>
  )
}

export default Tweets