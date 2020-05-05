import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TitledTweets from './common/TitledTweets'

function HashTag(props: any) {
  const { tagName } = useParams();
  const [loading, setLoading] = useState(true)
  const [tag, setHashTag] = useState(null)
  const [criteria, setCriteria] = useState(null)

  useEffect(() => {
    if (loading && !tag) { retrive() }
  })

  async function retrive() {
    const snapshot = props.db.collection("hashtags").doc(tagName);
    const doc = await snapshot.get();
    setLoading(false);

    if(!doc.exists) {
      alert('tag not found');
      return;
    }

    setHashTag(doc.data());
    setCriteria(() => {
      // @see https://stackoverflow.com/questions/55621212/is-it-possible-to-react-usestate-in-react
      return (collection) => { return collection.where('hashtags', 'array-contains', tagName) }
    });
  }

  if(loading) {
    return (
      <div>loading...</div>
    )
  }

  return (
    <TitledTweets title={`#${tagName}`} category="ハッシュタグ" criteria={criteria} {...props}></TitledTweets>
  )
}

export default HashTag