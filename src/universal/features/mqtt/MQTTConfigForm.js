// @flow

import * as React from 'react'
import type {RouterHistory} from 'react-router-dom'
import Paper from 'material-ui/Paper'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {required} from '@jcoreio/redux-form-validators'
import {mqttConfigForm} from './routePaths'

import type {Theme} from '../../theme'
import ControlWithInfo from '../../components/ControlWithInfo'
import TextField from '../../components/TextField'
import Spinner from '../../components/Spinner'

import handleError from '../../redux-form/createSubmissionError'
import SubmitStatus from '../../components/SubmitStatus'

const styles = ({spacing}: Theme) => ({
  form: {
    margin: '0 auto',
    minWidth: 570 + spacing.unit * 4,
    maxWidth: 570 + spacing.unit * 4,
  },
  formControl: {
    width: '100%',
  },
  firstFaderChild: {
    marginTop: 0,
  },
  lastFaderChild: {
    marginBottom: 0,
  },
  errorCollapse: {
    marginTop: spacing.unit * 2,
  },
  buttons: {
    textAlign: 'right',
    marginTop: spacing.unit * 2,
    '& > button': {
      minWidth: 120,
    },
    '& > :not(:last-child)': {
      marginRight: spacing.unit * 3,
    }
  },
  tallButton: {
    height: spacing.unit * 7,
  },
  paper: {
    padding: `${spacing.unit * 2}px ${spacing.unit * 4}px`,
    margin: spacing.unit * 2,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

const trim = (value: ?string): ?string => typeof value === 'string' ? value.trim() : value

type MQTTConfig = {
  id: number,
  name?: ?string,

  serverURL: string, // e.g. tcp://myhost.mydomain.com:1883
  username: string,
  password: string,
  groupId: string,
  nodeId: string,

  minPublishInterval?: ?number, // minimum interval, in milliseconds, for publishing data

  /**
   * If true, plugin will automatically publish all public tags and metadata in addition
   * to any channels defined in channelsToMQTT.
   */
  publishAllPublicTags?: ?boolean,
}

export type Props = {
  id: number,
  loadedId: number,
  classes: Classes,
  initialize: (values: $Shape<MQTTConfig>, keepDirty?: boolean, otherMeta?: {keepSubmitSucceeded?: boolean}) => any,
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  change?: (field: string, newValue: any) => any,
  history: RouterHistory,
  data?: {
    Config?: MQTTConfig,
    loading?: boolean,
  },
  handleSubmit: (onSubmit: (values: MQTTConfig) => any) => (event: Event) => any,
  createMQTTConfig: (options: {variables: {values: MQTTConfig}}) => Promise<{
    data: {Config: MQTTConfig},
  }>,
  updateMQTTConfig: (options: {variables: {values: MQTTConfig}}) => Promise<{
    data: {Config: MQTTConfig},
  }>,
}

function _shouldInitialize({data, id, loadedId, pristine}: Props): boolean {
  if (!data) return false
  const {Config} = data
  return Config != null && Config.id === id && (pristine || loadedId !== Config.id)
}

const pickFormFields = ({
  id, name, serverURL, username, password, groupId, nodeId,
  minPublishInterval, publishAllPublicTags,
}: MQTTConfig) => {
  return {
    id, name, serverURL, username, password, groupId, nodeId,
    minPublishInterval, publishAllPublicTags,
  }
}

// url() doesn't currently accept IP addresses or localhost.
// const validateServerURL = [required(), url()]
const validateServerURL = [required()]

class MQTTConfigForm extends React.Component<Props> {
  initializeTimeout: ?number

  componentDidMount() {
    const {id, data, initialize} = this.props
    if (!id) initialize({})
    if (!data) return
    const {Config} = data
    if (Config) {
      if (_shouldInitialize(this.props)) {
        this.initializeTimeout = setTimeout(() => initialize(pickFormFields(Config)), 0)
      }
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevConfig = (this.props.data || {}).Config
    const nextConfig = (nextProps.data || {}).Config

    if (nextConfig !== prevConfig) {
      if (nextConfig && _shouldInitialize(nextProps)) {
        this.initializeTimeout = setTimeout(() => nextProps.initialize(pickFormFields(nextConfig)), 0)
      }
    }
  }

  componentWillUnmount() {
    if (this.initializeTimeout != null) clearTimeout(this.initializeTimeout)
  }

  handleCancel = () => {
    const {data, initialize} = this.props
    if (!data) return
    const {Config} = data
    if (Config) initialize(pickFormFields(Config))
  }

  handleSubmit = (values: MQTTConfig): Promise<void> => {
    const {initialize, history} = this.props
    values = pickFormFields(values)
    const mutate = values.id != null ? this.props.updateMQTTConfig : this.props.createMQTTConfig
    return mutate({variables: {values}}).then(({data: {Config}}: {data: {Config: MQTTConfig}}) => {
      if (values.id == null) {
        history.replace(mqttConfigForm(Config.id))
      } else {
        initialize(pickFormFields(Config), false, {keepSubmitSucceeded: true})
      }
    }).catch(handleError)
  }

  render(): React.Node {
    const {
      classes, data, initialized, pristine,
      submitting, submitSucceeded, submitFailed, error,
      handleSubmit, loadedId, id,
    } = this.props
    const loading = data ? data.loading : false
    if (data != null && (loading || !initialized || loadedId !== id)) {
      return (
        <div className={classes.form}>
          <Paper className={classes.paper}>
            <Typography type="subheading">
              <Spinner /> Loading MQTT configuration...
            </Typography>
          </Paper>
        </div>
      )
    }
    return (
      <form id="MQTTConfigForm" className={classes.form} onSubmit={handleSubmit(this.handleSubmit)}>
        <Paper className={classes.paper}>
          <ControlWithInfo info="The name of the MQTT connection">
            <Field
              name="name"
              label="Name"
              type="text"
              component={TextField}
              className={classes.formControl}
              normalizeOnBlur={trim}
              validate={required()}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The URL of the MQTT server">
            <Field
              name="serverURL"
              label="Server URL"
              type="text"
              component={TextField}
              className={classes.formControl}
              normalizeOnBlur={trim}
              validate={validateServerURL}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The username to connect with">
            <Field
              name="username"
              label="Username"
              type="text"
              component={TextField}
              className={classes.formControl}
              validate={required()}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The password to connect with">
            <Field
              name="password"
              label="Password"
              type="password"
              component={TextField}
              className={classes.formControl}
              validate={required()}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The ID of the MQTT group">
            <Field
              name="groupId"
              label="Group ID"
              type="text"
              component={TextField}
              className={classes.formControl}
              normalizeOnBlur={trim}
              validate={required()}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The ID of the MQTT node">
            <Field
              name="nodeId"
              label="Node ID"
              type="text"
              component={TextField}
              className={classes.formControl}
              normalizeOnBlur={trim}
              validate={required()}
            />
          </ControlWithInfo>
          <SubmitStatus
            submitting={submitting}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            error={error}
          />
          <div className={classes.buttons}>
            <Button
              raised
              className={classes.tallButton}
              onClick={this.handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              raised
              color="primary"
              className={classes.tallButton}
              disabled={pristine || submitting}
            >
              Save
            </Button>
          </div>
        </Paper>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(MQTTConfigForm)

