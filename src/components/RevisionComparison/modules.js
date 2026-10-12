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
import {
  queryRevisionVersions as salesInquiryVersions,
  compareRevisionDiff as salesInquiryDiff
} from '@/api/salesManagement/salesInquiry'
import salesInquirySchema from './schemas/salesInquiry'

export const revisionModules = {
  salesInquiry: {
    loadVersions: salesInquiryVersions,
    compare: salesInquiryDiff,
    schema: salesInquirySchema
  },
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
