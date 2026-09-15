<template>
  <div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane
        :label="$t('organization.functionalPermissions')"
        name="1"
        v-if="functionalPermissionsAuth"
      >
        <functionalPermissions
          ref="functionalPermissions"
          :comDisFrom="comDisFrom"
        />
      </el-tab-pane>
      <el-tab-pane
        :label="$t('organization.accessPermissions')"
        name="2"
        v-if="accessPermissionsAuth"
      >
        <accessPermissions ref="accessPermissions" :comDisFrom="comDisFrom" />
      </el-tab-pane>
      <el-tab-pane
        :label="$t('organization.warehouse')"
        name="3"
        v-if="warehouseAuth && false"
      >
        <warehouse ref="warehouse" :comDisFrom="comDisFrom" />
      </el-tab-pane>
      <el-tab-pane
        :label="$t('organization.vendor')"
        name="4"
        v-if="vendorAuth && false"
      >
        <vendor ref="vendor" :comDisFrom="comDisFrom" />
      </el-tab-pane>
      <el-tab-pane
        :label="$t('organization.assignUser')"
        name="5"
        v-if="assignUserAuth"
      >
        <assignUser ref="assignUser" :comDisFrom="comDisFrom" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import functionalPermissions from './functionalPermissions.vue'
import accessPermissions from './accessPermissions2.vue'
import warehouse from '@/views/organization/role/warehouse'
import vendor from '@/views/organization/role/vendor'

import assignUser from './assignUser.vue'
export default {
  props: {
    comDisFrom: Boolean
  },
  components: {
    functionalPermissions,
    accessPermissions,
    warehouse,
    vendor,
    assignUser
  },
  data() {
    return {
      activeName: '1'
    }
  },
  computed: {
    functionalPermissionsAuth() {
      return this.checkPermi(['organization:role:functionalPermissions:list'])
    },
    accessPermissionsAuth() {
      return this.checkPermi(['organization:role:accessPermissions:list'])
    },
    warehouseAuth() {
      return this.checkPermi(['organization:role:warehouse:list'])
    },
    vendorAuth() {
      return this.checkPermi(['organization:role:vendor:list'])
    },
    assignUserAuth() {
      return this.checkPermi(['organization:role:assignUser:list'])
    }
  },
  methods: {
    handleClick() {},
    getFromData(params) {
      if (this.functionalPermissionsAuth) {
        const { menuIdList, functionalPermissionsLeftCheckedKeys } =
          this.$refs.functionalPermissions.submitForm()
        params.menuIdList = menuIdList
        params.functionalPermissionsLeftCheckedKeys =
          functionalPermissionsLeftCheckedKeys || []
      }
      if (this.accessPermissionsAuth) {
        const accessPermissionsIdList =
          this.$refs.accessPermissions.submitForm()
        params.accessPermissionsIdList = accessPermissionsIdList
      }
      // if (this.warehouseAuth) {
      // const warehouseData = this.$refs.warehouse.submitForm()
      // params.dpTypeWarehouse = warehouseData.dpTypeWarehouse
      // params.warehouseIdList = warehouseData.warehouseIdList
      // }
      // if (this.vendorAuth) {
      // const vendorData = this.$refs.vendor.submitForm()
      // params.dpTypeVendor = vendorData.dpTypeVendor
      // params.vendorIdList = vendorData.vendorIdList
      // }
      if (this.assignUserAuth) {
        const { menuIdList } = this.$refs.assignUser.submitForm()
        params.userIdList = menuIdList
      }
    }
  }
}
</script>
