// @flow

import * as React from 'react'
import {compose} from 'redux'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'
import {required} from 'redux-form-validators'
import isIp from 'is-ip'

import type {Theme} from '../../theme/index'
import ViewPanel from '../../components/ViewPanel'
import FormTextField from '../../components/TextField'
import Spinner from '../../components/Spinner'
import Fader from '../../components/Fader'

import SubmitStatus from '../../components/SubmitStatus'

import ButtonGroupField from '../../components/ButtonGroupField'
import {formValues} from 'redux-form'

import type {NetworkSettings} from '../../network-settings/NetworkSettingsCommon'
import {splitDNSAddresses} from '../../types/DNSServers'

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
const validateIPAddress = (address: ?string): ?string => {
  if (!address) return
  address = address.trim()
  if (address && !isIp.v4(address)) return 'Must be a valid IPv4 address'
}
const validateRequiredIPAddress = [
  required(),
  validateIPAddress,
]
const validateDNSServers = (addresses: ?string): ?string => {
  if (!addresses) return
  const split = splitDNSAddresses(addresses)
  for (let address of split) {
    if (address && !isIp.v4(address)) return 'Must be a list of valid IPv4 address separated by commas'
  }
}
const normalizeDNSServers = text => typeof text === 'string' ? text.replace(/\s+/g, '') : text

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
  dhcpEnabled?: boolean,
  data?: {
    state?: NetworkSettings,
    loading?: boolean,
  },
}

class NetworkSettingsForm extends React.Component<Props> {
  render(): React.Node {
    const {
      classes, data, initialized, pristine,
      submitting, submitSucceeded, submitFailed, error,
      dhcpEnabled, onSubmit, onCancel,
    } = this.props
    const loading = data ? data.loading : false
    if (data != null && (loading || !initialized)) {
      return (
        <div className={classes.form}>
          <ViewPanel>
            <Typography variant="subheading">
              <Spinner /> Loading network settings...
            </Typography>
          </ViewPanel>
        </div>
      )
    }
    return (
      <form id="IPAddressForm" className={classes.form} onSubmit={onSubmit}>
        <ViewPanel>
          <Field
            name="dhcpEnabled"
            label="Mode"
            component={ButtonGroupField}
            classes={{button: classes.tallButton}}
            availableValues={[true, false]}
            activeButtonProps={{secondary: true}}
            getDisplayText={dhcpEnabled => dhcpEnabled ? 'DHCP' : 'Manual'}
            className={classes.modeField}
            validate={required()}
          />
          <Fader>
            {dhcpEnabled ? (
              <DHCPFields
                key="dhcp"
                formControlClass={classes.formControl}
                config={data && data.state && data.state.dhcpEnabled ? data.state : null}
              />
            ) : (
              <StaticFields
                key="static"
                formControlClass={classes.formControl}
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
  formControlClass: string,
}

const DHCPFields = ({formControlClass, config}: ModeFieldsProps & {config: ?NetworkSettings}): React.Node => {
  return (
    <div>
      <Typography variant="subheading">
        Settings received from DHCP server:
      </Typography>
      <TextField
        readOnly
        name="ipAddress"
        value={config ? config.ipAddress : null}
        label="IP Address"
        type="text"
        className={formControlClass}
        InputLabelProps={{shrink: true}}
      />
      <TextField
        readOnly
        name="netmask"
        value={config ? config.netmask : null}
        label="Subnet Mask"
        type="text"
        className={formControlClass}
        InputLabelProps={{shrink: true}}
      />
      <TextField
        readOnly
        name="gateway"
        value={config ? config.gateway : null}
        label="Router"
        type="text"
        className={formControlClass}
        InputLabelProps={{shrink: true}}
      />
      <TextField
        readOnly
        name="dnsServers"
        value={config ? config.dnsServers : null}
        label="DNS Servers"
        type="text"
        className={formControlClass}
        InputLabelProps={{shrink: true}}
      />
    </div>
  )
}

const StaticFields = ({formControlClass}: ModeFieldsProps): React.Node => (
  <div>
    <Field
      name="ipAddress"
      label="IP Address"
      type="text"
      component={FormTextField}
      className={formControlClass}
      normalizeOnBlur={trim}
      validate={validateRequiredIPAddress}
    />
    <Field
      name="netmask"
      label="Subnet Mask"
      type="text"
      component={FormTextField}
      className={formControlClass}
      normalizeOnBlur={trim}
      validate={validateRequiredIPAddress}
    />
    <Field
      name="gateway"
      label="Router"
      type="text"
      component={FormTextField}
      className={formControlClass}
      normalizeOnBlur={trim}
      validate={validateIPAddress}
    />
    <Field
      name="dnsServers"
      label="DNS Servers"
      type="text"
      component={FormTextField}
      className={formControlClass}
      normalizeOnBlur={normalizeDNSServers}
      validate={validateDNSServers}
    />
  </div>
)

export default compose(
  withStyles(styles, {withTheme: true}),
  formValues('dhcpEnabled')
)(NetworkSettingsForm)

