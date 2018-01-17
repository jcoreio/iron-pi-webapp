// @flow

import * as React from 'react'
import {dirname} from 'path'
import type {Match, Location, RouterHistory} from 'react-router-dom'
import {Link} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import {compose} from 'redux'
import Paper from 'material-ui/Paper'
import {formValues, FieldArray} from 'redux-form'
import Button from 'material-ui/Button'
import ChevronLeft from 'material-ui-icons/ChevronLeft'
import ChevronRight from 'material-ui-icons/ChevronRight'
import Typography from 'material-ui/Typography'
import ViewSlider from 'react-view-slider/lib/simpleWithTransitionContext'
import {createSelector} from 'reselect'

import NumPointsStep from './NumPointsStep'
import PointStep from './PointStep'
import CalibrationTable from './CalibrationTable'
import Spinner from '../../components/Spinner'

import Fader from '../../components/Fader'
import ErrorAlert from '../../components/ErrorAlert'
import Autocollapse from '../../components/Autocollapse'
import type {Theme} from '../../theme/index'
import type {Calibration, Channel as FullChannel} from '../../types/Channel'
import {CALIBRATION_TABLE} from '../../react-router/routePaths'
import handleError from '../../redux-form/createSubmissionError'

const styles = ({spacing, calibration}: Theme) => ({
  form: {
    margin: '0 auto',
    maxWidth: 570,
  },
  paper: {
    padding: `${spacing.unit * 3}px ${spacing.unit * 4}px`,
    margin: spacing.unit * 2,
  },
  body: {
    padding: `0 ${spacing.unit * 4}px`,
  },
  bodySlider: {
    margin: `0 -${spacing.unit * 4}px`,
  },
  title: {
    ...calibration.title,
    marginTop: 0,
    borderBottom: {
      style: 'solid',
      width: 2,
      color: calibration.title.color,
    },
  },
  buttons: {
    marginTop: spacing.unit * 3,
    display: 'flex',
    '& > :not(:first-child)': {
      marginLeft: spacing.unit,
    },
  },
  errorCollapse: {
    marginTop: spacing.unit,
  },
  flexSpacer: {
    flexGrow: 1,
  },
  numPointsField: {
    width: '100%',
  },
  hidden: {
    visibility: 'hidden',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  match: Match,
  location: Location,
  history: RouterHistory,
  classes: Classes,
  numSteps: ?(string | number),
  handleSubmit: Function,
  pristine?: boolean,
  submitting?: boolean,
  initialized?: boolean,
  initialize: (values: Calibration) => any,
  change: (field: string, newValue: any) => void,
  subscribeToChannelState?: (id: number) => Function,
  channelId: number,
  error?: string,
  mutate: (options: {variables: {id: number, calibration: Calibration}}) => Promise<void>,
  data: {
    Channel?: FullChannel,
    loading?: boolean,
  },
}

export type State = {
  step: number,
}

class CalibrationForm extends React.Component<Props, State> {
  state: State = {step: 0}
  unsubscribeFromChannelState: ?Function
  initializeTimeout: ?number

  pickFormFields = ({config: {calibration}}: FullChannel): Calibration => ({
    points: [],
    ...calibration || {},
    numSteps: calibration ? calibration.points.length : 2,
  })

  componentDidMount() {
    const {data: {Channel}, initialize, subscribeToChannelState} = this.props
    if (Channel) {
      this.initializeTimeout = setTimeout(() => initialize(this.pickFormFields(Channel)), 0)
      if (subscribeToChannelState) {
        this.unsubscribeFromChannelState = subscribeToChannelState(Channel.id)
      }
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevChannel = this.props.data.Channel
    const nextChannel = nextProps.data.Channel

    if (nextChannel !== prevChannel) {
      if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
      if (nextChannel) {
        this.initializeTimeout = setTimeout(() => nextProps.initialize(this.pickFormFields(nextChannel)), 0)
        const {subscribeToChannelState} = nextProps
        if (subscribeToChannelState) {
          this.unsubscribeFromChannelState = subscribeToChannelState(nextChannel.id)
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.initializeTimeout != null) clearTimeout(this.initializeTimeout)
    if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
  }

  isInCalibration: (props: Props) => boolean = createSelector(
    ({location}) => location.pathname,
    ({match}) => match.url,
    (pathname: string, url: string) => pathname === `${url}/${CALIBRATION_TABLE}`
  )

  renderBody = () => {
    const {classes, data: {Channel}, change} = this.props
    const numSteps = parseInt(this.props.numSteps) || 0

    if (this.isInCalibration(this.props)) {
      return (
        <FieldArray
          name="points"
          component={CalibrationTable}
          key={numSteps + 1}
          channel={Channel}
          bodyClass={classes.body}
        />
      )
    }

    const {step} = this.state

    if (step === 0) return <NumPointsStep key={0} bodyClass={classes.body} />
    return (
      <PointStep
        key={step}
        pointIndex={step - 1}
        bodyClass={classes.body}
        channel={Channel}
        change={change}
      />
    )
  }

  handleBack = () => {
    const {step} = this.state
    this.setState({step: step - 1})
  }

  handleNext = () => {
    const {history, match} = this.props
    const {step} = this.state
    const numSteps = parseInt(this.props.numSteps) || 0
    if (step >= numSteps) history.push(`${match.url}/${CALIBRATION_TABLE}`)
    else this.setState({step: step + 1})
  }

  handleSubmit = ({points}: Calibration): Promise<any> => {
    const {mutate, channelId, history, match} = this.props
    return mutate({variables: {id: channelId, calibration: {points}}}).then(
      () => {
        history.push(dirname(match.url))
      },
      handleError
    )
  }

  render(): ?React.Node {
    const {match, classes, handleSubmit, submitting, data: {Channel, loading}, initialized, error} = this.props
    const isInCalibration = this.isInCalibration(this.props)

    if (loading || !initialized) {
      return (
        <div className={classes.form}>
          <Paper className={classes.paper}>
            <Typography type="subheading">
              <Spinner /> Loading channel calibration...
            </Typography>
          </Paper>
        </div>
      )
    }

    const {step} = this.state
    const numSteps = parseInt(this.props.numSteps) || 0

    const {name} = Channel || {name: `Channel ${match.params.id || '?'}`}

    let title
    if (isInCalibration) title = `${name} Calibration`
    else if (step === 0) title = 'Begin Calibration'
    else title = `Step ${step} of ${numSteps}`

    const backButtonProps = isInCalibration
      ? {
        component: Link,
        to: match.url,
        disabled: false,
      }
      : {
        onClick: this.handleBack,
        disabled: step === 0,
      }

    return (
      <form className={classes.form} onSubmit={handleSubmit(isInCalibration ? this.handleSubmit : this.handleNext)}>
        <Paper className={classes.paper}>
          <h3 className={classes.title}>
            <Fader>
              {title}
            </Fader>
          </h3>
          {/*
            Animating to/from the calibration table triggers a bug in redux-form
            (https://github.com/erikras/redux-form/issues/3688).
            Once that's fixed, we can restore animation to/from the calibration table.
          */}
          {isInCalibration
            ? (
              <FieldArray
                name="points"
                component={CalibrationTable}
                channel={Channel}
              />
            )
            : (
              <ViewSlider className={classes.bodySlider}>
                {this.renderBody()}
              </ViewSlider>
            )
          }
          <Autocollapse className={classes.errorCollapse}>
            {error && <ErrorAlert>Failed to save changes: {error}</ErrorAlert>}
          </Autocollapse>
          <div className={classes.buttons}>
            <Button
              raised
              component={Link}
              to={`${match.url}/${CALIBRATION_TABLE}`}
              className={step === 0 && !isInCalibration ? undefined : classes.hidden}
            >
              Calibration Table
            </Button>
            <div className={classes.flexSpacer} />
            <Spinner in={Boolean(submitting)} />
            <Button component={Link} raised to={dirname(match.url)}>
              Cancel
            </Button>
            <Button
              raised
              color="primary"
              {...backButtonProps}
            >
              <ChevronLeft />
              Back
            </Button>
            <Button
              raised
              color="primary"
              type="submit"
              disabled={submitting}
            >
              {isInCalibration ? 'OK' : 'Next'}
              {!isInCalibration && <ChevronRight />}
            </Button>
          </div>
        </Paper>
      </form>
    )
  }
}

export default compose(
  withStyles(styles, {withTheme: true}),
  formValues('numSteps')
)(CalibrationForm)
