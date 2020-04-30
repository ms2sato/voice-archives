// @see https://github.com/webpack-contrib/raw-loader/issues/56#issuecomment-423640398
declare module '*.txt'
declare module '*.html'
declare module '*.png'
declare module '*.jpeg'
declare module '*.jpg'
declare module '*.gif'
declare module '*.svg'
declare module '*.css' {
  const content: any;
  export default content;
}
