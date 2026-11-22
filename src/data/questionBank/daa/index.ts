import type { Family } from '../build'
import { daaUnit1Families } from './unit1'
import { daaUnit2Families } from './unit2'
import { daaUnit3Families } from './unit3'
import { daaUnit4Families } from './unit4'
import { daaUnit5Families } from './unit5'
import { daaUnit6Families } from './unit6'

export const daaFamilies: Family[] = [
  ...daaUnit1Families,
  ...daaUnit2Families,
  ...daaUnit3Families,
  ...daaUnit4Families,
  ...daaUnit5Families,
  ...daaUnit6Families,
]

export {
  daaUnit1Families,
  daaUnit2Families,
  daaUnit3Families,
  daaUnit4Families,
  daaUnit5Families,
  daaUnit6Families,
}
