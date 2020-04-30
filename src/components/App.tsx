import * as React from 'react';

// @see https://github.com/webpack-contrib/raw-loader/issues/56#issuecomment-423640398
import githubLogo from '../images/github.png'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";

import About from './About'
import Terms from './Terms'
import Privacy from './Privacy'
import Tweets from './Tweets'

import config from '../config/firebaseConfig'

firebase.initializeApp(config);
const db = firebase.firestore();
let local = false;

// @see https://firebase.google.com/docs/emulator-suite/connect_and_prototype
if (location.hostname === "localhost") {
  local = true;
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
  firebase.functions().useFunctionsEmulator("http://localhost:5001");
}

function App() {

  const params = {db, local};
  return (
    <Router>
      <ul className="topnav _cream" id="myTopnav2">
        <li><Link className="brand" to="/">せいゆうろうどうくかいの書庫</Link></li>
        <li style={{ float: 'right' }}><a href="https://github.com/ms2sato/voice-archives" target="_blank"><img src={githubLogo} style={{ 'verticalAlign': 'middle', width: '23px' }}></img></a></li>
        <li style={{ float: 'right' }}><Link to="/privacy">プライバシーポリシー</Link></li>
        <li style={{ float: 'right' }}><Link to="/terms">利用規約</Link></li>
        <li style={{ float: 'right' }}><Link to="/about">これはなんですか？</Link></li>
        {/* <li className="-icon">
        <a href="javascript:void(0);" onClick={()=> topnav('myTopnav2')}>&equiv;</a>
      </li> */}
      </ul>

      <div>
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/terms">
            <Terms />
          </Route>
          <Route path="/privacy">
            <Privacy />
          </Route>
          <Route path="/">
            <Tweets pageLimit={local ? 3 : 10} {...params}/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;