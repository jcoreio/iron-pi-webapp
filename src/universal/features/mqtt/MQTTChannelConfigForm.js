// @flow

import * as React from 'react'
import type {RouterHistory, Match} from 'react-router-dom'
import omit from 'lodash.omit'
import Paper from 'material-ui/Paper'
import {FormSection} from 'redux-form'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles, withTheme} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {required} from 'redux-form-validators'
import {NumericField} from 'redux-form-numeric-field'
import {mqttConfigForm} from './routePaths'
import type {MetadataItem} from '../../types/MetadataItem'
import Arrow from 'react-arrow'

import type {Theme} from '../../theme'
import ControlWithInfo from '../../components/ControlWithInfo'
import TextField from '../../components/TextField'
import Spinner from '../../components/Spinner'
import MetadataItemFieldsContainer from '../../components/MetadataItemFieldsContainer'

import handleError from '../../redux-form/createSubmissionError'
import SubmitStatus from '../../components/SubmitStatus'
import DeleteButton from '../../components/DeleteButton'

const FlowArrow = withTheme()(({theme: {channelState: {arrow}}, direction, ...props}: Object) => (
  <Arrow
    direction={direction}
    shaftWidth={arrow.shaftWidth}
    shaftLength={arrow.shaftLength}
    headWidth={arrow.headWidth}
    headLength={arrow.headLength}
    fill={arrow.fill}
    {...props}
  />
))

const styles = ({spacing, palette}: Theme) => ({
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
    margin: `${spacing.unit * 2}px auto`,
  },
  parentPaper: {
    extend: 'paper',
    backgroundColor: palette.background.parentPaper,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

const trim = (value: ?string): ?string => typeof value === 'string' ? value.trim() : value

type MQTTChannelConfig = {
  id: number,
  configId?: number,
  direction?: Direction,
  metadataItem: MetadataItem,
  mqttTag: string,
  enabled?: boolean,
  name?: ?string,
  multiplier?: ?number,
  offset?: ?number,
}

export type Direction = 'TO_MQTT' | 'FROM_MQTT'

export type Props = {
  id?: number,
  configId: number,
  direction: Direction,
  loadedId: number,
  classes: Classes,
  initialize: (values: $Shape<MQTTChannelConfig>, keepDirty?: boolean, otherMeta?: {keepSubmitSucceeded?: boolean}) => any,
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  change?: (field: string, newValue: any) => any,
  match: Match,
  history: RouterHistory,
  data?: {
    Config?: MQTTChannelConfig,
    loading?: boolean,
  },
  handleSubmit: (onSubmit: (values: MQTTChannelConfig) => any) => (event: Event) => any,
  createMQTTChannelConfig: (options: {variables: {values: MQTTChannelConfig}}) => Promise<{
    data: {Config: MQTTChannelConfig},
  }>,
  updateMQTTChannelConfig: (options: {variables: {values: MQTTChannelConfig}}) => Promise<{
    data: {Config: MQTTChannelConfig},
  }>,
  destroyMQTTChannelConfig: (options: {variables: {id: number}}) => Promise<any>,
}

function _shouldInitialize({data, id, loadedId, pristine}: Props): boolean {
  if (!data) return false
  const {Config} = data
  return Config != null && Config.id === id && (pristine || loadedId !== Config.id)
}

const pickFormFields = ({
  id, metadataItem, mqttTag, enabled, name, multiplier, offset,
}: MQTTChannelConfig) => {
  if (enabled == null) enabled = true
  else enabled = Boolean(enabled)
  metadataItem = omit(metadataItem, '_id', '__typename')
  metadataItem.dataType = 'number'
  return {
    id, metadataItem, mqttTag, enabled, name, multiplier, offset,
  }
}

class MQTTChannelConfigForm extends React.Component<Props> {
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
    const {history} = this.props
    history.goBack()
  }

  handleSubmit = (values: MQTTChannelConfig): Promise<void> => {
    const {history, configId, direction} = this.props
    values = pickFormFields(values)
    const mutate = values.id != null ? this.props.updateMQTTChannelConfig : this.props.createMQTTChannelConfig
    if (values.id == null) {
      values.direction = direction
      values.configId = configId
    }
    return mutate({variables: {values}}).then(({data: {Config}}: {data: {Config: MQTTChannelConfig}}) => {
      history.replace(mqttConfigForm(configId))
    }).catch(handleError)
  }

  handleDelete = () => {
    const {loadedId, history, destroyMQTTChannelConfig} = this.props
    if (loadedId == null) return
    destroyMQTTChannelConfig({variables: {id: loadedId}})
      .then(() => history.goBack())
      .catch(handleError)
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
              <Spinner /> Loading MQTT Channel configuration...
            </Typography>
          </Paper>
        </div>
      )
    }
    return (
      <form id="MQTTChannelConfigForm" className={classes.form} onSubmit={handleSubmit(this.handleSubmit)}>
        <Paper className={classes.parentPaper}>
          <Paper className={classes.paper}>
            <FormSection name="metadataItem">
              <MetadataItemFieldsContainer
                formControlClass={classes.formControl}
                mode={{
                  dataType: 'number',
                }}
              />
            </FormSection>
          </Paper>
          <Paper className={classes.paper}>
            <ControlWithInfo info="TODO">
              <NumericField
                name="multiplier"
                label="Slope"
                type="text"
                component={TextField}
                className={classes.formControl}
              />
              <NumericField
                name="offset"
                label="Offset"
                type="text"
                component={TextField}
                className={classes.formControl}
              />
            </ControlWithInfo>
          </Paper>
          <Paper className={classes.paper}>
            <ControlWithInfo info="The tag for data in MQTT">
              <Field
                name="mqttTag"
                label="MQTT Tag"
                type="text"
                component={TextField}
                className={classes.formControl}
                normalizeOnBlur={trim}
                validate={required()}
              />
            </ControlWithInfo>
          </Paper>
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
            <DeleteButton
              raised
              onArmedClick={this.handleDelete}
              className={classes.tallButton}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            />
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

export default withStyles(styles, {withTheme: true})(MQTTChannelConfigForm)

