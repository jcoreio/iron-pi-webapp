// @flow

import * as React from 'react'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'
import {compose} from 'redux'
import {formValues} from 'redux-form'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import type {MetadataItem, DataType} from '../types/MetadataItem'
import MetadataItemFields from './MetadataItemFields'

type Force = {
  dataType?: DataType,
  isDigital?: boolean,
}

type Data = {
  metadataItem?: ?MetadataItem,
  loading: boolean,
}

export type Props = {
  tag: ?string,
  dataType: ?DataType,
  isDigital: ?boolean,
  units: ?string,
  rounding: ?number,
  displayPrecision: ?number,
  min: ?number,
  max: ?number,
  force?: Force,
  data: Data,
}

const metadataItemQuery = gql(`query MetadataItem($tag: String!) {
  metadataItem: MetadataItem(tag: $tag) {
    tag
    name
    dataType
    min
    max
    units
    rounding
    displayPrecision
    isDigital
  }
}`)

type Context = {
  _reduxForm: {
    sectionPrefix?: ?string,
    change: (field: string, newValue: any) => any,
    dispatch: (action: any) => any,
  },
}

function createField(sectionPrefix: ?string, field: string): string {
  return sectionPrefix ? `${sectionPrefix}.${field}` : field
}

const excludedKeys: Set<string> = new Set(['_id', '__typename'])

class MetadataItemFieldsContainer extends React.Component<Props> {
  static defaultProps: {data: Data} = {
    data: {
      loading: true,
      metadataItem: null,
    }
  }

  static contextTypes = {
    _reduxForm: PropTypes.shape({
      sectionPrefix: PropTypes.string,
      change: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
    }),
  }

  _initialized: boolean = false
  _needsReload: boolean = true

  _updateFields = (loadedMetadataItem: ?MetadataItem, props: Props = this.props, context: Context = this.context) => {
    const {_reduxForm: {sectionPrefix, change, dispatch}} = context
    const {tag, dataType, isDigital, units, rounding, displayPrecision, min, max, force} = props
    const fields = loadedMetadataItem
      ? {...loadedMetadataItem}
      : {tag, dataType, isDigital, units, rounding, displayPrecision, min, max}

    if (force) Object.assign(fields, force)
    if (!fields.dataType) fields.dataType = 'number'
    if (!Number.isFinite(fields.min)) fields.min = 0
    if (!Number.isFinite(fields.max)) fields.max = 100
    if (!Number.isFinite(fields.displayPrecision)) fields.displayPrecision = 1
    if (!loadedMetadataItem && !this._initialized && !Number.isFinite(fields.rounding)) fields.rounding = 0.01

    for (let key in fields) {
      if (excludedKeys.has(key)) continue
      const field = createField(sectionPrefix, key)
      dispatch(change(field, fields[key]))
    }

    this._initialized = true
    this._needsReload = false
  }

  componentDidMount() {
    const {tag, data: {loading, metadataItem}} = this.props
    if (loading || !tag) return
    if (metadataItem && metadataItem.tag !== tag) return
    this._updateFields(metadataItem, this.props, this.context)
  }

  componentWillReceiveProps(nextProps: Props, nextContext: Context) {
    const {tag, force, data: {loading, metadataItem}} = nextProps
    if (tag !== this.props.tag || !isEqual(force, this.props.force)) this._needsReload = true
    if (!this._needsReload) return
    if (loading || !tag) return
    if (metadataItem && metadataItem.tag !== tag) return
    this._updateFields(metadataItem, nextProps, nextContext)
  }

  render(): ?React.Node {
    const {
      tag, data, // eslint-disable-line no-unused-vars
      ...props
    } = this.props
    return <MetadataItemFields {...props} />
  }
}

export default compose(
  formValues('tag', 'dataType', 'isDigital', 'min', 'max', 'units', 'rounding', 'displayPrecision'),
  graphql(metadataItemQuery, {
    options: ({tag}: Props) => ({
      variables: {tag},
      errorPolicy: 'all',
    }),
    skip: ({tag}: Props) => !tag,
  })
)(MetadataItemFieldsContainer)

