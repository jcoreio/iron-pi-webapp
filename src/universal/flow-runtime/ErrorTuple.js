// @flow

import type {Validation} from 'flow-runtime'

type ExtractErrorTuple = <T>(validation: {errors: Array<T>}) => T
export type ErrorTuple = $Call<ExtractErrorTuple, Validation>

