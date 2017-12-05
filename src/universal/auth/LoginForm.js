// @flow

import * as React from 'react'
import type {Map} from 'immutable'
import Spinner from '../components/Spinner'
// import {Link} from 'react-router'
import {
  PanelContainer, Panel, PanelBody, Form, FormGroup, InputGroup, Icon, Button,
  Grid, Row, Col, Alert,
} from '@jcoreio/rubix'
import {reduxForm} from 'redux-form/immutable'
import Field from '../components/Field'

export type Props = {
  handleSubmit: (handler: (values: Map<string, string>) => any) => void,
  onSubmit: (values: Map<string, string>) => void,
  loggingIn?: boolean,
  loginError?: Error,
}


/**
 * The raw login form.  LoginContainer wraps this to handle submission
 */
class LoginForm extends React.Component<Props, void> {
  render(): React.Node {
    const {handleSubmit, onSubmit, loggingIn, loginError} = this.props
    return (
      <PanelContainer>
        <Panel>
          <PanelBody style={{padding: 0}}>
            <div className="text-center bg-darkblue fg-white">
              <h3 style={{margin: 0, padding: 25}}>Sign in to Iron Pi</h3>
            </div>
            <div
              style={{margin: 'auto', marginTop: 25, marginBottom: 25, padding: 25, paddingTop: 0, paddingBottom: 0}}
            >
              <Form id="login-form" onSubmit={handleSubmit(onSubmit)}>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>
                      <Icon glyph="icon-fontello-user" className="rubix-icon" />
                    </InputGroup.Addon>
                    <Field required type="text" name="username" placeholder="username" />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>
                      <Icon glyph="icon-fontello-key" className="rubix-icon" />
                    </InputGroup.Addon>
                    <Field required type="password" name="password" placeholder="password" />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <Grid>
                    {loginError &&
                      <Row>
                        <Col xs={12} collapseLeft collapseRight>
                          <Alert danger>{loginError.message}</Alert>
                        </Col>
                      </Row>
                    }
                    <Row>
                      <Col xs={6} collapseLeft collapseRight>
                        {/*<Link to="/signup">Sign Up</Link>*/}
                      </Col>
                      <Col xs={6} collapseLeft collapseRight className="text-right">
                        <Button outlined lg type="submit" bsStyle="blue" disabled={loggingIn}>
                          {loggingIn ? <span><Spinner /> Logging in...</span> : 'Login'}
                        </Button>
                      </Col>
                    </Row>
                  </Grid>
                </FormGroup>
              </Form>
            </div>
          </PanelBody>
        </Panel>
      </PanelContainer>
    )
  }
}
export default reduxForm({
  form: 'Login'
})(LoginForm)
