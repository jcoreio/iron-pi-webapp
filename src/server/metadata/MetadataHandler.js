// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import MetadataItem from '../models/MetadataItem'

import type {MetadataItem as Item} from '../../universal/types/MetadataItem'

export const EVENT_METADATA_CHANGE = 'metadataChange'

export type TagMetadataMap = {[tag: string]: Item}

export type MetadataChangeEvent = {metadata: TagMetadataMap}

export type MetadataHandlerEvents = {
  metadataChange: [MetadataChangeEvent],
}

export default class MetadataHandler extends EventEmitter<MetadataHandlerEvents> {
  _metadata: TagMetadataMap = {}

  constructor() {
    super()
    MetadataItem.afterCreate(this._handleMetadataChange)
    MetadataItem.afterUpdate(this._handleMetadataChange)
  }

  async loadMetadata(): Promise<void> {
    for (let {tag, item} of await MetadataItem.findAll()) {
      this._metadata[tag] = item
    }
  }

  _handleMetadataChange = (metadataItem: MetadataItem) => {
    const {tag, item} = metadataItem
    this._metadata[tag] = item
    this.emit(EVENT_METADATA_CHANGE, {metadata: this._metadata})
  }

  metadata(): TagMetadataMap { return this._metadata }

  getTagMetadata(tag: string): ?Item {
    return this._metadata[tag]
  }
}

