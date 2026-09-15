<template>
  <div class="product-picture-row">
    <div class="product-name" :title="row.productName">{{ row.productName }}</div>
    <div v-if="row.defaultImageUrl" class="product-picture">
      <el-image
        class="product-image"
        fit="contain"
        :src="row.defaultImageUrl"
        :preview-src-list="previewList"
        preview-teleported
        @click.stop
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommonProductAndPicture',
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    previewList() {
      const list = this.row.commonFileListForImage || []
      return list.length > 0
        ? list.map(item => item.url).filter(Boolean)
        : [this.row.defaultImageUrl].filter(Boolean)
    }
  }
}
</script>

<style scoped>
.product-picture-row {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  overflow: hidden;
}

.product-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.product-picture {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  line-height: 0;
}

.product-image {
  width: 100%;
  height: 100%;
}
</style>
