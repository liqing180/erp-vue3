<template>
  <FormPageLayout>
    <template #btn>
      <el-button type="primary" size="small" @click="$emit('back')">
        {{ $t('uiBtn.back') }}
      </el-button>
    </template>
    <template #content>
      <el-result icon="warning" :title="$t('bpm.documentNotMigrated')">
        <template #sub-title>
          <p>{{ $t('bpm.documentNotMigratedDetail') }}</p>
          <p>{{ $route.query.moduleKey }}</p>
        </template>
      </el-result>
    </template>
  </FormPageLayout>
</template>

<script>
export default {
  emits: ['back']
}
</script>
