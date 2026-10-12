import {
  queryRevisionVersions,
  compareRevisionDiff
} from '@/api/purchaseManagement/purchaseRequisition'
import schema from './schemas/purchaseRequisite'
import {
  queryRevisionVersions as productVersions,
  compareRevisionDiff as productDiff
} from '@/api/productManagement/productInfo'
import productSchema from './schemas/product'

export const revisionModules = {
  product: {
    loadVersions: productVersions,
    compare: productDiff,
    schema: productSchema
  },
  purchaseRequisite: {
    loadVersions: queryRevisionVersions,
    compare: compareRevisionDiff,
    schema
  }
}
