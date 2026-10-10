<template>
  <div style="padding-bottom: 20px">
    <el-checkbox
      :label="$t('organization.all')"
      class="mt10"
      v-model="isAll"
      @change="allChange"
      :disabled="!editAuth"
    ></el-checkbox>
    <el-checkbox-group
      v-model="checkedValue"
      @change="checkboxChange"
      :disabled="!editAuth"
    >
      <el-checkbox
        v-for="(item, index) in checkboxList"
        :key="index"
        :value="item.warehouseId"
        class="mt10"
        >{{ item.warehouseName }}</el-checkbox
      >
    </el-checkbox-group>
  </div>
</template>

<script>
import {
  getRoleDpForWarehouse
  //  getRoleDataPermissionsType
} from '@/api/organization/role'
export default {
  dicts: ['dp_type_vendor'],
  props: {
    comDisFrom: Boolean,
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      radioValue: '0',
      checkedValue: [],
      checkboxList: [],
      roleId: '',
      timeId: '',
      isAll: false
    }
  },
  computed: {
    editAuth() {
      if (this.comDisFrom) {
        return false
      }
      return this.checkPermi(['organization:role:warehouse:edit'])
    }
  },
  watch: {
    'formData.dpTypeWarehouse': {
      immediate: true,
      handler: function (newVal) {
        // this.radioValue = newVal || '0'
        if (this.formData && this.formData.roleId) {
          this.isAll = newVal === '0'
        }
      }
    }
  },
  created() {
    this.roleId = this.$route.query.roleId
    this.timeId = this.$route.query.timeId
    this.getList()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.roleId = this.$route.query.roleId
      this.getList()
    }
  },
  methods: {
    getList() {
      getRoleDpForWarehouse({ roleId: this.roleId }).then(res => {
        const { warehouseList, warehouseIdList } = res.data
        this.checkboxList = warehouseList || []
        this.checkedValue = warehouseIdList || []
        if (!this.roleId) {
          this.isAll = true
          this.allChange(true)
        }
      })
    },
    allChange(e) {
      if (e) {
        this.checkedValue = this.checkboxList.map(x => x.warehouseId)
      } else {
        this.checkedValue = []
      }
    },
    checkboxChange() {
      this.isAll = this.checkboxList.length === this.checkedValue.length
    },
    submitForm() {
      this.radioValue = this.isAll ? '0' : '1'
      return {
        dpTypeWarehouse: this.radioValue,
        roleId: this.roleId,
        warehouseIdList: this.checkedValue
      }
    }
  }
}
</script>
