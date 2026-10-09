import {
  queryRevisionVersions,
  compareRevisionDiff
} from '@/api/purchaseManagement/purchaseRequisition'
import schema from './schemas/purchaseRequisite'

export const revisionModules = {
  purchaseRequisite: {
    loadVersions: queryRevisionVersions,
    compare: compareRevisionDiff,
    schema
  }
}
