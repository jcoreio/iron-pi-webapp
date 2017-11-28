// @flow

import * as React from 'react';
import {connect} from 'react-redux'
import {Grid, Row, Col, Panel, PanelHeader, PanelContainer, PanelBody} from '@jcoreio/rubix'
import injectSheet from 'react-jss'
import type {State} from '../redux/types'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    padding: 25,
    backgroundColor: '#eee',
    boxShadow: '0 0 200px 50px #ccc inset',
  },
  header: {
    margin: 0,
    padding: 25
  },
  message: {
    padding: 25
  }
}

type SelectProps = {
  header: string,
  message: string
}

type Props = SelectProps & {
  classes: {
    root: string,
    header: string,
    message: string
  }
}


const ErrorView = ({classes, header, message}: Props): React.Element<any> => (
  <Grid className={classes.root}>
    <Row>
      <Col sm={6} smOffset={3} xs={10} xsOffset={1}>
        <PanelContainer>
            <Panel className="text-center">
                <PanelHeader className="bg-red fg-white">
                  <h2 className={classes.header}>{header}</h2>
                </PanelHeader>
                <PanelBody>
                    <h4 className={classes.message}>{message}</h4>
                </PanelBody>
            </Panel>
        </PanelContainer>
      </Col>
    </Row>
  </Grid>
)

const mapStateToProps = ({error: {header, message}}: State): SelectProps => ({header, message})

export default injectSheet(styles)(connect(mapStateToProps)(ErrorView))

