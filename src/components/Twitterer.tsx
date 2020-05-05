import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TitledTweets from './common/TitledTweets'

function Twitterer(props: any) {
  const { twittererId } = useParams();
  const [loading, setLoading] = useState(true)
  const [twitterer, setTwitterer] = useState(null)
  const [criteria, setCriteria] = useState(null)

  useEffect(() => {
    if (loading && !twitterer) { retrive() }
  })

  async function retrive() {
    const snapshot = props.db.collection("twitterers").doc(twittererId);
    const doc = await snapshot.get();
    setLoading(false);

    if(!doc.exists) {
      alert('twitterer not found');
      return;
    }

    setTwitterer(doc.data());
    setCriteria(() => {
      // @see https://stackoverflow.com/questions/55621212/is-it-possible-to-react-usestate-in-react
      return (collection) => { return collection.where('twittererRef', '==', snapshot) }
    });
  }

  if(loading || !twitterer) {
    return (
      <div>loading...</div>
    )
  }

  return (
    <TitledTweets title={twitterer.name} category="投稿者" criteria={criteria} {...props}></TitledTweets>
  )
}

export default Twitterer