// @flow

import * as React from 'react'
import {compose} from 'redux'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {required} from 'redux-form-validators'
import isIp from 'is-ip'

import type {Theme} from '../../theme'
import ViewPanel from '../../components/ViewPanel'
import TextField from '../../components/TextField'
import Spinner from '../../components/Spinner'
import Fader from '../../components/Fader'

import SubmitStatus from '../../components/SubmitStatus'

import ButtonGroupField from '../../components/ButtonGroupField'
import {formValues} from 'redux-form'

import {IPAddressModesArray, getIPAddressModeDisplayText, splitDNSAddresses} from '../../types/IPAddressConfig'
import type {IPAddressMode} from '../../types/IPAddressConfig'

const styles = ({spacing}: Theme) => ({
  form: {
    margin: '0 auto',
    minWidth: 570 + spacing.unit * 4,
    maxWidth: 570 + spacing.unit * 4,
  },
  formControl: {
    marginTop: spacing.unit,
    marginBottom: spacing.unit,
    width: '100%',
  },
  modeField: {
    marginBottom: spacing.unit * 2,
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
  serverURLControl: {
    flexDirection: 'column',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

const trim = (value: ?string): ?string => typeof value === 'string' ? value.trim() : value
const validateIPAddress = [
  required(),
  (address: ?string): ?string => {
    if (!address) return
    address = address.trim()
    if (address && !isIp.v4(address)) return 'Must be a valid IPv4 address'
  }
]
const validateDNSServers = [
  required(),
  (addresses: ?string): ?string => {
    if (!addresses) return
    const split = splitDNSAddresses(addresses)
    for (let address of split) {
      if (address && !isIp.v4(address)) return 'Must be a list of valid IPv4 address separated by commas'
    }
  }
]
const normalizeDNSServers = text => typeof text === 'string' ? text.replace(/\s+/g, '') : text

type IPAddressConfig = {
  ipAddress: string,
  subnetMask: string,
  router: string,
  dnsServers: string,
}

export type Props = {
  classes: Classes,
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  change?: (field: string, newValue: any) => any,
  onSubmit?: (e: Event) => any,
  onCancel?: (e: MouseEvent) => any,
  mode?: IPAddressMode,
  data?: {
    config?: IPAddressConfig,
    loading?: boolean,
  },
}

class IPAddressForm extends React.Component<Props> {
  render(): React.Node {
    const {
      classes, data, initialized, pristine,
      submitting, submitSucceeded, submitFailed, error,
      mode, onSubmit, onCancel,
    } = this.props
    const loading = data ? data.loading : false
    if (data != null && (loading || !initialized)) {
      return (
        <div className={classes.form}>
          <ViewPanel>
            <Typography variant="subheading">
              <Spinner /> Loading IP Address configuration...
            </Typography>
          </ViewPanel>
        </div>
      )
    }
    const ModeFields = mode ? fieldsForMode[mode] : null
    return (
      <form id="IPAddressForm" className={classes.form} onSubmit={onSubmit}>
        <ViewPanel>
          <Field
            name="mode"
            label="Mode"
            component={ButtonGroupField}
            classes={{button: classes.tallButton}}
            availableValues={IPAddressModesArray}
            activeButtonProps={{secondary: true}}
            getDisplayText={getIPAddressModeDisplayText}
            className={classes.modeField}
            validate={required()}
          />
          <Fader>
            {ModeFields && (
              <ModeFields
                key={mode}
                formControlClass={classes.formControl}
                config={data ? data.config : null}
              />
            )}
          </Fader>
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
              onClick={onCancel}
            >
              Cancel
            </Button>
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
        </ViewPanel>
      </form>
    )
  }
}

type ModeFieldsProps = {
  config: ?IPAddressConfig,
  formControlClass: string,
}

const DHCPFields = ({formControlClass, config}: ModeFieldsProps): React.Node => {
  return (
    <div>
      <Typography variant="subheading">
        Settings received from DHCP server:
      </Typography>
      <TextField
        name="ipAddress"
        label="IP Address"
        type="text"
        inputProps={{readOnly: true}}
        value={config ? config.ipAddress : null}
        className={formControlClass}
      />
      <TextField
        name="subnetMask"
        label="Subnet Mask"
        type="text"
        inputProps={{readOnly: true}}
        value={config ? config.subnetMask : null}
        className={formControlClass}
      />
      <TextField
        name="router"
        label="Router"
        type="text"
        inputProps={{readOnly: true}}
        value={config ? config.router : null}
        className={formControlClass}
      />
      <TextField
        name="dnsServers"
        label="DNS Servers"
        type="text"
        inputProps={{readOnly: true}}
        value={config ? config.dnsServers : null}
        className={formControlClass}
      />
    </div>
  )
}

const ManualFields = ({formControlClass}: ModeFieldsProps): React.Node => (
  <div>
    <Field
      name="ipAddress"
      label="IP Address"
      type="text"
      component={TextField}
      className={formControlClass}
      normalizeOnBlur={trim}
      validate={validateIPAddress}
    />
    <Field
      name="subnetMask"
      label="Subnet Mask"
      type="text"
      component={TextField}
      className={formControlClass}
      normalizeOnBlur={trim}
      validate={validateIPAddress}
    />
    <Field
      name="router"
      label="Router"
      type="text"
      component={TextField}
      className={formControlClass}
      normalizeOnBlur={trim}
      validate={validateIPAddress}
    />
    <Field
      name="dnsServers"
      label="DNS Servers"
      type="text"
      component={TextField}
      className={formControlClass}
      normalizeOnBlur={normalizeDNSServers}
      validate={validateDNSServers}
    />
  </div>
)

const fieldsForMode: {[mode: IPAddressMode]: React.ComponentType<ModeFieldsProps>} = {
  DHCP: DHCPFields,
  MANUAL: ManualFields,
}

export default compose(
  withStyles(styles, {withTheme: true}),
  formValues('mode')
)(IPAddressForm)

