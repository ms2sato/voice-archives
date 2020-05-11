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
import Twitterer from './Twitterer'
import Twitterers from './Twitterers'
import HashTag from './HashTag'
import HashTags from './HashTags'

import { MuiThemeProvider } from "@material-ui/core/styles";

import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import A from '@material-ui/core/Link';

import theme from '../ui/Theme'

import config from '../config/firebaseConfig'
import { LOCAL_HOST } from '../constants'

firebase.initializeApp(config);
const db = firebase.firestore();
let local = false;

console.log(LOCAL_HOST);

// @see https://firebase.google.com/docs/emulator-suite/connect_and_prototype
if (location.hostname === LOCAL_HOST) {
  local = true;
  db.settings({
    host: `${LOCAL_HOST}:8080`,
    ssl: false,
  });
  firebase.functions().useFunctionsEmulator(`http://${LOCAL_HOST}:5001`);
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <A color="inherit" href="https://voice-archives.web.app/">
        せいゆうろうどうくかいの書庫プロジェクト
      </A>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  navLink: {
    margin: theme.spacing(1, 1.5),
    verticalAlign: 'middle'
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
}));

function App() {
  const classes = useStyles();

  const params = { db, local };
  return (
    <Router>
      <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            <Link to="/" className={classes.navLink}>せいゆうろうどうくかいの書庫</Link>
          </Typography>
          <nav>
            <Link to="/about" className={classes.navLink}>
              これはなんですか？
            </Link>
            <Link to="/twitterers" className={classes.navLink}>
              投稿者一覧
            </Link>
            <Link to="/hashtags" className={classes.navLink}>
              ハッシュタグ一覧
            </Link>
            <A variant="button" target="_blank" color="textPrimary" href="https://github.com/ms2sato/voice-archives" className={classes.navLink}>
              <img src={githubLogo} style={{ 'verticalAlign': 'middle', width: '23px' }}></img>
            </A>
          </nav>
        </Toolbar>
      </AppBar>

      <Container>
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
          <Route path="/twitterers/:twittererId">
            <Twitterer {...params} />
          </Route>
          <Route path="/twitterers">
            <Twitterers {...params} />
          </Route>
          <Route path="/hashtags/:tagName">
            <HashTag {...params} />
          </Route>
          <Route path="/hashtags">
            <HashTags {...params} />
          </Route>
          <Route path="/">
            <Tweets pageLimit={local ? 3 : 10} {...params} />
          </Route>
        </Switch>
      </Container>

      <footer className={classes.footer}>
        <nav>
          <Typography variant="body2" color="textSecondary" align="center">
            <Link to="/privacy" className={classes.link}>
              プライバシーポリシー
            </Link>
            <Link to="/terms" className={classes.link}>
              利用規約
            </Link>
          </Typography>
        </nav>
        <Copyright />
      </footer>
      </MuiThemeProvider>
    </Router>
  );
}

export default App;