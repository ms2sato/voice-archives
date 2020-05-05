import React from "react";
import { Link } from "react-router-dom";
import TweetList from './TweetList'
import { Typography, Breadcrumbs } from "@material-ui/core";

interface TitledTweetsProps {
  title: string,
  category: string,
  categoryLink: string,
  criteria: Function
}

function TitledTweets({ title, category, categoryLink, criteria, ...props }: TitledTweetsProps) {
  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Link to="/">
          TOP
        </Link>
        <Link to={categoryLink}>{category}</Link>
        <Typography color="textPrimary">{title}</Typography>
      </Breadcrumbs>
      <Typography variant="h3" component="h2">{title}</Typography>
      {criteria ? <TweetList {...props} criteria={criteria} ></TweetList> : ''}
    </div>
  )
}

export default TitledTweets