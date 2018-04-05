// @flow

import * as React from 'react'
import PropTypes from 'prop-types'
import {compose} from 'redux'
import {formValues} from 'redux-form'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import type {MetadataItem} from '../types/MetadataItem'
import MetadataItemFields from './MetadataItemFields'

type Force = {
  dataType?: string,
  isDigital?: boolean,
}

export type Props = {
  tag: ?string,
  force?: Force,
  data?: {
    metadataItem?: MetadataItem,
    loading: boolean,
  },
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

function getMetadataItem(props: Props): ?MetadataItem {
  return props.data && props.data.metadataItem
}

const excludedKeys: Set<string> = new Set(['_id', '__typename'])

class MetadataItemFieldsContainer extends React.Component<Props> {
  static contextTypes = {
    _reduxForm: PropTypes.shape({
      sectionPrefix: PropTypes.string,
      change: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
    }),
  }

  _updateForce = (force: Force, context: Context = this.context) => {
    const {_reduxForm: {sectionPrefix, change, dispatch}} = context
    for (let key in force) {
      const field = sectionPrefix ? `${sectionPrefix}.${key}` : key
      dispatch(change(field, force[key]))
    }
  }

  _updateFields = (metadataItem: MetadataItem, context: Context = this.context) => {
    const {_reduxForm: {sectionPrefix, change, dispatch}} = context
    for (let key in metadataItem) {
      if (excludedKeys.has(key)) continue
      const field = sectionPrefix ? `${sectionPrefix}.${key}` : key
      dispatch(change(field, metadataItem[key]))
    }
  }

  componentDidMount() {
    const metadataItem = getMetadataItem(this.props)
    if (metadataItem) this._updateFields(metadataItem)
    const {force} = this.props
    if (force) this._updateForce(force)
  }

  componentWillReceiveProps(nextProps: Props, nextContext: Context) {
    const prevMetadataItem = getMetadataItem(this.props)
    const nextMetadataItem = getMetadataItem(nextProps)
    if (nextMetadataItem && nextMetadataItem !== prevMetadataItem) {
      this._updateFields(nextMetadataItem, nextContext)
    }
    const prevForce = this.props.force
    const nextForce = nextProps.force
    if (nextForce && nextForce !== prevForce) {
      this._updateForce(nextForce, nextContext)
    }
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
  formValues('tag'),
  graphql(metadataItemQuery, {
    options: ({tag}: Props) => ({
      variables: {tag},
      errorPolicy: 'all',
    }),
    skip: ({tag}: Props) => !tag,
  })
)(MetadataItemFieldsContainer)

