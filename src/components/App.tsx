import * as React from 'react';

// @see https://github.com/webpack-contrib/raw-loader/issues/56#issuecomment-423640398
import styles from './main.css'
import file from '../images/github.png'

const App = () => {
  console.log('App boot');
  return <div className={styles.container}>HelloWorld<img src={file}></img></div>
}

export default App;