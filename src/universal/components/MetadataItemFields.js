// @flow

import * as React from 'react'
import {compose} from 'redux'
import {Field} from 'redux-form-normalize-on-blur'
import {required, format} from 'redux-form-validators'
import {formValues} from 'redux-form'
import {withStyles} from 'material-ui/styles'
import {MenuItem} from 'material-ui/Menu'
import map from 'lodash.map'
import type {Theme} from '../theme'
import TextField from './TextField'
import ControlWithInfo from './ControlWithInfo'
import Fader from './Fader'
import NumericMetadataItemFields from './NumericMetadataItemFields'
import {DataTypes} from '../types/MetadataItem'
import type {MetadataItem} from '../types/MetadataItem'

import {tagPattern} from '../types/Tag'

const trim = (value: ?string) => value && value.trim()

const styles = (theme: Theme) => ({
  firstFaderChild: {
    marginTop: 0,
  },
  lastFaderChild: {
    marginBottom: 0,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type Force = {
  dataType?: string,
  isDigital?: boolean,
}

export type Props = {
  classes: Classes,
  formControlClass?: string,
  dataType?: string,
  isDigital?: boolean,
  force?: Force,
  showDataTypeSelector?: boolean,
  showConfigFields?: boolean,
}

export function pickMetadataItemFields(metadataItem: MetadataItem): MetadataItem {
  const {tag, dataType, name, min, max, units, rounding, displayPrecision} = metadataItem
  return {tag, name, dataType, min, max, units, rounding, displayPrecision}
}

class MetadataItemFields extends React.Component<Props> {
  render(): React.Node {
    const {classes, formControlClass, force, showDataTypeSelector} = this.props
    let {dataType, isDigital} = this.props
    if (force) {
      if (force.dataType != null) dataType = force.dataType
      if (force.isDigital != null) isDigital = force.isDigital
    }
    const showConfigFields = this.props.showConfigFields !== false
    const showNumericFields = dataType === 'number' && !isDigital
    return (
      <React.Fragment>
        <ControlWithInfo info="Unique ID used to link this with other system functions">
          <Field
            name="tag"
            label="Tag"
            type="text"
            component={TextField}
            className={formControlClass}
            validate={[required(), format({with: tagPattern, message: 'invalid tag'})]}
            normalize={trim}
          />
        </ControlWithInfo>
        {showConfigFields && (
          <ControlWithInfo info="Display name for this tag">
            <Field
              name="name"
              label="Name"
              type="text"
              component={TextField}
              className={formControlClass}
              validate={required()}
              normalizeOnBlur={trim}
            />
          </ControlWithInfo>
        )}
        {showDataTypeSelector && (
          <ControlWithInfo info="The type of the value for this tag">
            <Field
              name="dataType"
              label="Data Type"
              type="text"
              component={TextField}
              className={formControlClass}
              validate={required()}
              select
              SelectProps={{displayEmpty: true}}
              props={{onBlur: null}}
            >
              {map(DataTypes, ({displayText}: {displayText: string}, dataType: string) => (
                <MenuItem key={dataType} value={dataType}>
                  {displayText}
                </MenuItem>
              ))}
            </Field>
          </ControlWithInfo>
        )}
        <Fader animateHeight>
          <div key={showNumericFields && showConfigFields ? "numeric" : "other"}>
            {showNumericFields && showConfigFields && (
              <NumericMetadataItemFields
                formControlClass={formControlClass}
                firstControlClass={classes.firstFaderChild}
                lastControlClass={classes.lastFaderChild}
              />
            )}
          </div>
        </Fader>
      </React.Fragment>
    )
  }
}

export default compose(
  withStyles(styles, {withTheme: true}),
  formValues('dataType', 'isDigital')
)(MetadataItemFields)

