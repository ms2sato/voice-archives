import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  custom: {
    marginTop: theme.spacing(4),
  }
}));

function Roll(props) {
  const classes = useStyles();

  return (
    <Card className={classes.custom}>
      <CardContent>
        {props.children}
      </CardContent>
    </Card>
  )
}

export default Roll