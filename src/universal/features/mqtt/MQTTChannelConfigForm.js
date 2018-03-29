// @flow

import * as React from 'react'
import type {RouterHistory, Match} from 'react-router-dom'
import Paper from 'material-ui/Paper'
import {FormSection, formValues} from 'redux-form'
import {compose} from 'redux'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles, withTheme} from 'material-ui/styles'
import Collapse from 'material-ui/transitions/Collapse'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {FormLabel} from 'material-ui/Form'
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
import {pickMetadataItemFields} from '../../components/MetadataItemFields'

import handleError from '../../redux-form/createSubmissionError'
import SubmitStatus from '../../components/SubmitStatus'
import ConfirmDeletePopover from '../../components/ConfirmDeletePopover'

const FlowArrow = withTheme()(({theme: {channelState: {arrow}}, ...props}: Object) => (
  <Arrow
    direction="down"
    shaftWidth={30}
    shaftLength={10}
    headWidth={50}
    headLength={10}
    fill={arrow.fill}
    {...props}
  />
))

const styles = ({spacing, palette, typography}: Theme) => ({
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
  paperCollapse: {
    padding: `0 ${spacing.unit * 4}px`,
    margin: `0 -${spacing.unit * 4}px`,
  },
  parentPaper: {
    extend: 'paper',
    padding: spacing.unit * 2,
    backgroundColor: palette.background.parentPaper,
    '& > :first-child': {
      marginTop: 0,
    },
  },
  arrowHolder: {
    textAlign: 'center',
    marginBottom: -spacing.unit * 1.5,
  },
  title: {
    fontSize: typography.pxToRem(20),
    color: palette.text.primary,
    paddingBottom: spacing.unit / 2,
    borderBottom: {
      width: 2,
      style: 'solid',
      color: palette.text.primary,
    },
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
  internalTag?: string,
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
  direction?: Direction,
  dataType?: string,
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

function getDirection({direction, data}: Props): ?Direction {
  return direction || (data && data.Config ? data.Config.direction : null)
}

const pickFormFields = (
  {id, metadataItem, internalTag, mqttTag, enabled, name, multiplier, offset}: MQTTChannelConfig
) => {
  if (!Number.isFinite(multiplier)) multiplier = 1
  if (!Number.isFinite(offset)) offset = 0
  if (enabled == null) enabled = true
  else enabled = Boolean(enabled)
  return {
    id, mqttTag, enabled, name, multiplier, offset,
    metadataItem: metadataItem
      ? pickMetadataItemFields(metadataItem)
      : ({tag: internalTag}: any),
  }
}

class MQTTChannelConfigForm extends React.Component<Props> {
  initializeTimeout: ?number

  componentDidMount() {
    const {data, initialize} = this.props
    if (!data) {
      this.initializeTimeout = setTimeout(() => initialize(pickFormFields(({}: any))), 0)
      return
    }
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
    const {history, configId} = this.props
    values = pickFormFields(values)
    const direction = getDirection(this.props)
    if (!direction) throw new Error('direction must be determined')
    if (direction === 'TO_MQTT') {
      (values: any).internalTag = values.metadataItem.tag
      delete values.metadataItem
    }
    const mutate = values.id != null ? this.props.updateMQTTChannelConfig : this.props.createMQTTChannelConfig
    if (values.id == null) {
      values.direction = direction
      values.configId = configId
    }
    return mutate({variables: {values}}).then(({data: {Config}}: {data: {Config: MQTTChannelConfig}}) => {
      history.replace(mqttConfigForm(configId))
    }).catch(err => handleError(err, {
      mapPath: ([first, ...rest]) => [first === 'item' ? 'metadataItem' : first, ...rest],
    }))
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
      handleSubmit, loadedId, id, dataType,
    } = this.props
    if (data != null && (data.loading || !initialized || loadedId !== id)) {
      return (
        <div className={classes.form}>
          <Paper className={classes.paper}>
            <Typography variant="subheading">
              <Spinner /> Loading MQTT Channel configuration...
            </Typography>
          </Paper>
        </div>
      )
    }
    const direction: ?Direction = getDirection(this.props)
    const systemSection = (
      <Paper className={classes.paper}>
        <h1 className={classes.title}>
          System
        </h1>
        <FormSection name="metadataItem">
          <MetadataItemFieldsContainer
            formControlClass={classes.formControl}
            showConfigFields={direction === 'FROM_MQTT'}
            showDataTypeSelector={direction === 'FROM_MQTT'}
            force={{isDigital: false}}
          />
        </FormSection>
      </Paper>
    )
    const mqttSection = (
      <Paper className={classes.paper}>
        <h1 className={classes.title}>
          MQTT
        </h1>
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
    )
    return (
      <form id="MQTTChannelConfigForm" className={classes.form} onSubmit={handleSubmit(this.handleSubmit)}>
        <Paper className={classes.parentPaper}>
          {direction === 'TO_MQTT'
            ? systemSection
            : mqttSection
          }
          <div className={classes.arrowHolder}>
            <FlowArrow />
          </div>
          <Paper className={classes.paper}>
            <h1 className={classes.title}>
              Slope / Offset
            </h1>
            <Collapse in={dataType !== 'number'}>
              <div>
                <FormLabel>
                  Slope and Offset are disabled for non-numeric tags.
                </FormLabel>
              </div>
            </Collapse>
            <ControlWithInfo info="TODO">
              <NumericField
                name="multiplier"
                label="Slope"
                type="text"
                component={TextField}
                className={classes.formControl}
                placeholder="1.0"
                disabled={dataType !== 'number'}
              />
              <NumericField
                name="offset"
                label="Offset"
                type="text"
                component={TextField}
                className={classes.formControl}
                placeholder="0.0"
                disabled={dataType !== 'number'}
              />
            </ControlWithInfo>
          </Paper>
          <div className={classes.arrowHolder}>
            <FlowArrow />
          </div>
          {direction === 'TO_MQTT'
            ? mqttSection
            : systemSection
          }
          <SubmitStatus
            submitting={submitting}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            error={error}
          />
          <div className={classes.buttons}>
            <Button
              variant="raised"
              className={classes.tallButton}
              onClick={this.handleCancel}
            >
              Cancel
            </Button>
            <ConfirmDeletePopover
              onConfirmDelete={this.handleDelete}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              {({bind}) => (
                <Button variant="raised" className={classes.tallButton} {...bind}>
                  Delete
                </Button>
              )}
            </ConfirmDeletePopover>
            <Button
              type="submit"
              variant="raised"
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

export default compose(
  withStyles(styles, {withTheme: true}),
  formValues({dataType: 'metadataItem.dataType'})
)(MQTTChannelConfigForm)

