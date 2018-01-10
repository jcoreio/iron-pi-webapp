// @flow

import * as React from 'react'
import SvgIcon from 'material-ui/SvgIcon'

export type Props = {
}

const d = [
  'M5,2',
  'A3,3 0 0,0 2,5',
  'L2,19',
  'A3,3 0 0,0 5,22',
  'L19,22',
  'A3,3 0 0,0 22,19',
  'L22,5',
  'A3,3 0 0,0 19,2',
  'Z',
  'M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4v2z',
].join('')

const AddRectangle = (props: Props): React.Node => (
  <SvgIcon {...props}>
    <path d={d} />
  </SvgIcon>
)

export default AddRectangle

