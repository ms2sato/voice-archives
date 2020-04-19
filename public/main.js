const pageLimit = 10;
document.addEventListener("DOMContentLoaded", async function () {
  const db = firebase.firestore();

  // @see https://firebase.google.com/docs/emulator-suite/connect_and_prototype
  if (location.hostname === "localhost") {
    db.settings({
      host: "localhost:8080",
      ssl: false,
    });
    //firebase.functions().useFunctionsEmulator("http://localhost:5001");
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function appendHtmlTo(parent, template) {
    parent.insertAdjacentHTML("beforeend", template.trim());
    return parent.lastChild;
  }

  function removeChildren(parent) {
    const children = parent.childNodes;
    if(children) {
      const length = children.length;
      for(let i = 0; i < length; i++) {
        parent.removeChild(parent.childNodes[0]);
      }
    }
  }

  function domnizeSnapshots(snapshots) {
    snapshots.forEach((doc) => {
      const data = doc.data();
      const $li = appendHtmlTo(js_statuses, youtubeTemplate);
      twttr.widgets.createTweet(
        data.id_str,
        $li.getElementsByClassName("tweet")[0],
        {
          conversation: "none",
        }
      );
      lastSnapshot = doc;
    });
  }

  async function progressingWithDomnize(process) {
    const clz = 'progressing';
    const actions = document.getElementsByClassName('js_actions')[0];

    actions.classList.add(clz);
    const snapshots = await process();
    domnizeSnapshots(snapshots);
    actions.classList.remove(clz);
  }

  async function readNext() {
    if (lastSnapshot) {
      progressingWithDomnize(()=>{
        return tweetsRef
          .startAfter(lastSnapshot)
          .limit(pageLimit)
          .get();
      })
    }
  }

  function getTweetsRef() {
    return db
      .collection("tweets")
      .orderBy("created_at", "desc")
      .limit(pageLimit);
  }

  function retrive() {
    lastSnapshot = null;
    progressingWithDomnize(()=>{
      return tweetsRef.get();
    });
  }

  function disposeStatuses() {
    removeChildren(js_statuses);
  }

  const youtubeTemplate = js_youtube_template.innerText;
  let tweetsRef = getTweetsRef();
  js_next.addEventListener("click", async function () {
    readNext();
  });
  let lastSnapshot = null;
  retrive();

  db.collection("hashtags").orderBy("count", "desc").limit(100).get().then(function(hashtagSnapshots){
    hashtagSnapshots.forEach((hashtagSnapshot)=>{
      const hashtag = hashtagSnapshot.data();
      const $li = appendHtmlTo(js_hashtags, '<li><a class="link" href="javascript:void(0)"></a></li>');
      const $link = $li.getElementsByClassName('link')[0];
      $link.innerText = `${hashtag.text}(${hashtag.count})`
      $link.addEventListener('click', async function(){
        disposeStatuses();
        tweetsRef = getTweetsRef().where('hashtags', 'array-contains', hashtag.text);
        retrive();
      });
    });
  });

  db.collection("twitterers").limit(100).get().then(function(snapshots){
    const docs = snapshots.docs;
    shuffle(docs).forEach((snapshot)=>{
      const data = snapshot.data();
      const $li = appendHtmlTo(js_twitterers, '<li><a class="link" href="javascript:void(0)"></a></li>');
      const $link = $li.getElementsByClassName('link')[0];
      $link.innerText = `${data.name}`
      $link.addEventListener('click', async function(){
        disposeStatuses();
        tweetsRef = getTweetsRef().where('twittererRef', '==', snapshot.ref);
        retrive();
      });
    });
  });
});