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

  function appendHtmlTo(parent, template) {
    parent.insertAdjacentHTML("beforeend", template.trim());
    return parent.lastChild;
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
        return tweetsCollection
          .startAfter(lastSnapshot)
          .limit(pageLimit)
          .get();
      })
    }
  }

  const youtubeTemplate = js_youtube_template.innerText;

  const tweetsCollection = db
    .collection("tweets")
    .orderBy("created_at", "desc")
    .limit(pageLimit);

  js_next.addEventListener("click", async function () {
    readNext();
  });

  let lastSnapshot = null;
  progressingWithDomnize(()=>{
    return tweetsCollection.get();
  });
});