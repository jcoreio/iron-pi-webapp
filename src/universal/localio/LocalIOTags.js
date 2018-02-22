// @flow
import {INTERNAL} from '../types/Tag'

export const rawAnalogInput = (id: number) => `${INTERNAL}localio/${id}/rawAnalogInput`
export const rawDigitalInput = (id: number) => `${INTERNAL}localio/${id}/rawDigitalInput`
export const rawOutput = (id: number) => `${INTERNAL}localio/${id}/rawOutput`
export const controlValue = (id: number) => `${INTERNAL}localio/${id}/controlValue`
export const systemValue = (id: number) => `${INTERNAL}localio/${id}/systemValue`

