// @flow

import * as React from 'react'
import classNames from 'classnames'
import {dirname} from 'path'
import type {Match, Location, RouterHistory} from 'react-router-dom'
import {Link} from 'react-router-dom'
import {withStyles} from '@material-ui/core/styles'
import {compose} from 'redux'
import {formValues, FieldArray} from 'redux-form'
import Button from '@material-ui/core/Button'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Typography from '@material-ui/core/Typography'
import ViewSlider from 'react-view-slider/lib/simpleWithTransitionContext'
import {createSelector} from 'reselect'

import ViewPanel, {ViewPanelBody, ViewPanelTitle} from '../ViewPanel'
import NumPointsStep from './NumPointsStep'
import PointStep from './PointStep'
import CalibrationTable from './CalibrationTable'
import Spinner from '../Spinner'

import Fader from '../Fader'
import ErrorAlert from '../ErrorAlert'
import Autocollapse from '../Autocollapse'
import type {Theme} from '../../theme/index'
import type {Calibration} from '../../localio/LocalIOChannel'
import {CALIBRATION_TABLE} from '../../features/localio/routePaths'

const styles = ({spacing, calibration}: Theme) => ({
  form: {
    margin: '0 auto',
    maxWidth: 570,
  },
  body: {
    padding: `0 ${spacing.unit * 4}px`,
  },
  bodyStep: {
    paddingTop: spacing.unit * 3,
  },
  bodySlider: {
    margin: `0 -${spacing.unit * 4}px`,
  },
  title: {
    ...calibration.title,
    margin: 0,
    borderBottom: {
      style: 'solid',
      width: 2,
      color: calibration.title.color,
    },
  },
  buttons: {
    marginTop: spacing.unit * 2,
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
  numPoints: ?(string | number),
  saveCalibration: (calibration: Calibration) => Promise<any>,
  handleSubmit: Function,
  pristine?: boolean,
  submitting?: boolean,
  initialized?: boolean,
  initialize: (values: Calibration) => any,
  change: (field: string, newValue: any) => void,
  id: number,
  error?: string,
  name: string,
  units: string,
  rawInput?: ?number,
  rawInputUnits: string,
  rawInputPrecision?: ?number,
  loading?: boolean,
  calibration?: Calibration,
}

export type State = {
  step: number,
}

class CalibrationForm extends React.Component<Props, State> {
  state: State = {step: 0}
  initializeTimeout: ?TimeoutID

  pickFormFields = (calibration?: Object): Calibration => ({
    points: [],
    ...calibration || {},
    numPoints: calibration ? calibration.points.length : 2,
  })

  componentDidMount() {
    const {calibration, loading, initialize} = this.props
    if (!loading) {
      this.initializeTimeout = setTimeout(() => initialize(this.pickFormFields(calibration)), 0)
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevLoading = this.props.loading
    const nextLoading = nextProps.loading
    const prevCalibration = this.props.calibration
    const nextCalibration = nextProps.calibration

    if (((!nextLoading && prevLoading) || nextCalibration !== prevCalibration) && nextProps.pristine) {
      this.initializeTimeout = setTimeout(() => nextProps.initialize(this.pickFormFields(nextCalibration)), 0)
    }
  }

  componentWillUnmount() {
    if (this.initializeTimeout != null) clearTimeout(this.initializeTimeout)
  }

  isInCalibration: (props: Props) => boolean = createSelector(
    ({location}) => location.pathname,
    ({match}) => match.url,
    (pathname: string, url: string) => pathname === `${url}/${CALIBRATION_TABLE}`
  )

  validatePoints = (points: ?Array<any>): ?string => {
    if (!points || points.length < 2) return 'You must define at least two points'
  }

  renderBody = () => {
    const {classes, change, units, rawInput, rawInputUnits, rawInputPrecision} = this.props
    const numPoints = parseInt(this.props.numPoints) || 0

    if (this.isInCalibration(this.props)) {
      return (
        <FieldArray
          name="points"
          component={CalibrationTable}
          key={numPoints + 1}
          units={units}
          rawInputUnits={rawInputUnits}
          bodyClass={classes.body}
          validate={this.validatePoints}
        />
      )
    }

    const {step} = this.state

    if (step === 0) return <NumPointsStep key={0} bodyClass={classNames(classes.body, classes.bodyStep)} />
    return (
      <PointStep
        key={step}
        pointIndex={step - 1}
        bodyClass={classNames(classes.body, classes.bodyStep)}
        change={change}
        units={units}
        rawInput={rawInput}
        rawInputUnits={rawInputUnits}
        rawInputPrecision={rawInputPrecision}
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
    const numPoints = parseInt(this.props.numPoints) || 0
    if (step >= numPoints) history.push(`${match.url}/${CALIBRATION_TABLE}`)
    else this.setState({step: step + 1})
  }

  render(): ?React.Node {
    const {match, classes, handleSubmit, saveCalibration, submitting, name, loading, initialized, error} = this.props
    const isInCalibration = this.isInCalibration(this.props)

    if (loading || !initialized) {
      return (
        <div className={classes.form}>
          <ViewPanel>
            <ViewPanelBody>
              <Typography variant="subheading">
                <Spinner /> Loading channel calibration...
              </Typography>
            </ViewPanelBody>
          </ViewPanel>
        </div>
      )
    }

    const {step} = this.state
    const numPoints = parseInt(this.props.numPoints) || 0

    let title
    if (isInCalibration) title = `${name} Calibration`
    else if (step === 0) title = 'Begin Calibration'
    else title = `Step ${step} of ${numPoints}`

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
      <form
        id="calibrationForm"
        className={classes.form}
        onSubmit={handleSubmit(isInCalibration ? saveCalibration : this.handleNext)}
      >
        <ViewPanel>
          <ViewPanelTitle data-test-name="calibrationFormTitle">
            <Fader>
              {title}
            </Fader>
          </ViewPanelTitle>
          <ViewPanelBody>
            <ViewSlider className={classes.bodySlider}>
              {this.renderBody()}
            </ViewSlider>
            <Autocollapse className={classes.errorCollapse}>
              {error && <ErrorAlert>Failed to save changes: {error}</ErrorAlert>}
            </Autocollapse>
            <div className={classes.buttons}>
              <Button
                variant="raised"
                component={Link}
                to={`${match.url}/${CALIBRATION_TABLE}`}
                className={step === 0 && !isInCalibration ? undefined : classes.hidden}
                data-test-name="calibrationTableButton"
              >
                Calibration Table
              </Button>
              <div className={classes.flexSpacer} />
              <Spinner in={Boolean(submitting)} />
              <Button
                component={Link}
                variant="raised"
                to={dirname(match.url)}
                data-test-name="cancelButton"
              >
                Cancel
              </Button>
              <Button
                variant="raised"
                color="primary"
                data-test-name="backButton"
                {...backButtonProps}
              >
                <ChevronLeft />
                Back
              </Button>
              <Button
                variant="raised"
                color="primary"
                type="submit"
                disabled={submitting}
                data-test-name={isInCalibration ? 'okButton' : 'nextButton'}
              >
                {isInCalibration ? 'OK' : 'Next'}
                {!isInCalibration && <ChevronRight />}
              </Button>
            </div>
          </ViewPanelBody>
        </ViewPanel>
      </form>
    )
  }
}

export default compose(
  formValues('numPoints'),
  withStyles(styles, {withTheme: true})
)(CalibrationForm)
