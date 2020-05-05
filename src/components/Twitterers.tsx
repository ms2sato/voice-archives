import React, { useState, useEffect } from "react";
import styles from './main.css'

function Twitterer(twitterer) {
  return (
    <li>
      <div><img src={twitterer.profile_image_url}></img><a>{twitterer.name}</a></div>
    </li>
  )
}

function Twitterers(props:any) {
  const [twitterers, setTwitterers] = useState([])

  useEffect(()=>{
    if (twitterers.length === 0) {
      props.db.collection("twitterers").get().then(function(snapshots){
        setTwitterers(snapshots.docs.map((doc)=>{return doc.data()}))
        // $link.addEventListener('click', async function(){
        //   disposeStatuses();
        //   tweetsRef = getTweetsRef().where('twittererRef', '==', snapshot.ref);
        //   retrive();
        // });
      });
    }
  })

  return (
    <div>
      <ul>
        {twitterers.map((twitterer) => { return <Twitterer key={twitterer.id_str} {...twitterer}></Twitterer> })}
      </ul>
    </div>
  )
}

export default Twitterers