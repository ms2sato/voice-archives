import * as React from 'react';

// @see https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
const styles = require('./main.css');

const App = () => {
  console.log('App boot');
  return <div className={styles.container}>HelloWorld</div>
}

export default App;