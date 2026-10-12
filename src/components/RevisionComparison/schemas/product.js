// 按物料新增、详情和修订页面维护；隐藏的旧产品字段、规格页签及套装组合不参与对比。
// 条件显示字段保留在白名单中，避免当前关闭开关后遗漏历史值的变化。
export default {
  schemaKey: 'product-version-comparison-v2',
  businessNoI18nKey: 'PRODUCT.materialCode',
  businessNoLabel: '物料编号',
  sections: [
    {
      sectionKey: 'basic',
      sectionLabel: '基本信息',
      sectionI18nKey: 'ui.basicInfo',
      fields: [
        {
          fieldKey: 'categoryIdList',
          fieldLabel: '分类',
          fieldI18nKey: 'PRODUCT.category',
          componentType: 'REFERENCE',
          valueType: 'ARRAY',
          displayFields: ['categoryNameShowStr']
        },
        {
          fieldKey: 'internalPartNo',
          fieldLabel: '物料编号',
          fieldI18nKey: 'PRODUCT.materialCode',
          componentType: 'TEXT',
          valueType: 'STRING'
        },
        {
          fieldKey: 'productName',
          fieldLabel: '物料名称',
          fieldI18nKey: 'PRODUCT.materialName',
          componentType: 'TEXT',
          valueType: 'STRING'
        },
        {
          fieldKey: 'brand',
          fieldLabel: '品牌',
          fieldI18nKey: 'PRODUCT.brand',
          componentType: 'TEXT',
          valueType: 'STRING'
        },
        {
          fieldKey: 'alias',
          fieldLabel: '物料简称',
          fieldI18nKey: 'PRODUCT.materialShortName',
          componentType: 'TEXT',
          valueType: 'STRING'
        },
        {
          fieldKey: 'materialType',
          fieldLabel: '物料类型',
          fieldI18nKey: 'PRODUCT.materialType1',
          componentType: 'TEXT',
          valueType: 'STRING',
          dictType: 'material_type'
        },
        {
          fieldKey: 'inventoryUnitId',
          fieldLabel: '库存单位',
          fieldI18nKey: 'PRODUCT.inventoryUnit',
          componentType: 'REFERENCE',
          valueType: 'INTEGER',
          displayFields: ['inventoryUnit']
        },
        {
          fieldKey: 'isActive',
          fieldLabel: '是否活跃',
          fieldI18nKey: 'ui.isActive',
          componentType: 'SWITCH',
          valueType: 'STRING'
        },
        {
          fieldKey: 'isPhantom',
          fieldLabel: '是否虚拟',
          fieldI18nKey: 'PRODUCT.isPhantom',
          componentType: 'SWITCH',
          valueType: 'STRING'
        },
        {
          fieldKey: 'isInventoryItem',
          fieldLabel: '是否做库存管理',
          fieldI18nKey: 'PRODUCT.nonInventoryItem',
          componentType: 'SWITCH',
          valueType: 'STRING'
        },
        {
          fieldKey: 'batchManagement',
          fieldLabel: '批次管理',
          fieldI18nKey: 'PRODUCT.batchManagement',
          componentType: 'SWITCH',
          valueType: 'STRING'
        },
        {
          fieldKey: 'serialNumberManagement',
          fieldLabel: '序列号管理',
          fieldI18nKey: 'PRODUCT.serialNumberManagement',
          componentType: 'SWITCH',
          valueType: 'STRING'
        },
        {
          fieldKey: 'printMethod',
          fieldLabel: '打印方式',
          fieldI18nKey: 'PRODUCT.printMethod',
          componentType: 'TEXT',
          valueType: 'STRING',
          dictType: 'ivt_print_method'
        },
        {
          fieldKey: 'description',
          fieldLabel: '描述',
          fieldI18nKey: 'ui.description',
          componentType: 'TEXTAREA',
          valueType: 'STRING'
        },
        {
          fieldKey: 'remarks',
          fieldLabel: '备注',
          fieldI18nKey: 'ui.remarks',
          componentType: 'TEXTAREA',
          valueType: 'STRING'
        },
        {
          fieldKey: 'isSystemDocking',
          fieldLabel: '系统对接',
          fieldI18nKey: 'ui.systemDocking',
          componentType: 'SWITCH',
          valueType: 'STRING'
        }
      ]
    },
    {
      sectionKey: 'expandInfo',
      sectionLabel: '扩展信息',
      sectionI18nKey: 'PRODUCT.expandInfo',
      fields: [
        {
          fieldKey: 'ivtSpecifications.type',
          fieldI18nKey: 'ui.type',
          dictType: 'mdm_material_type',
          fieldLabel: '类型.字典',
          componentType: 'TEXT',
          valueType: 'STRING',
          displayFields: ['ivtSpecifications.typeShowStr']
        },
        {
          fieldKey: 'ivtSpecifications.toleranceType',
          dictType: 'mdm_material_tolerance_type',
          fieldLabel: '公差类型.字典',
          componentType: 'TEXT',
          valueType: 'STRING',
          fieldI18nKey: 'PRODUCT.toleranceType'
        },
        {
          fieldKey: 'ivtSpecifications.specificGravity',
          fieldLabel: '比重',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.specificGravity'
        },
        {
          fieldKey: 'ivtSpecifications.overTolerance',
          fieldLabel: '公差上',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.overTolerance'
        },
        {
          fieldKey: 'ivtSpecifications.underTolerance',
          fieldLabel: '公差下',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.underTolerance'
        },
        {
          fieldKey: 'ivtSpecifications.minInMix',
          fieldLabel: '配合比设计最少值',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.minInMixDesign'
        },
        {
          fieldKey: 'ivtSpecifications.maxInMix',
          fieldLabel: '配合比设计最高值',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.maxInMixDesign'
        },
        {
          fieldKey: 'ivtSpecifications.minMoisture',
          fieldLabel: '最低湿度',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.minMoisture'
        },
        {
          fieldKey: 'ivtSpecifications.maxMoisture',
          fieldLabel: '最高湿度',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.maxMoisture'
        },
        {
          fieldKey: 'ivtSpecifications.minTemperatureC',
          fieldI18nKey: 'PRODUCT.minTemperatureC',
          fieldLabel: 'minTemperatureC',
          componentType: 'NUMBER',
          valueType: 'DECIMAL'
        },
        {
          fieldKey: 'ivtSpecifications.maxTemperatureC',
          fieldI18nKey: 'PRODUCT.maxTemperatureC',
          fieldLabel: 'maxTemperatureC',
          componentType: 'NUMBER',
          valueType: 'DECIMAL'
        },
        {
          fieldKey: 'ivtSpecifications.minFinenessModulus',
          fieldLabel: '最小细度比',
          componentType: 'NUMBER',
          valueType: 'DECIMAL',
          fieldI18nKey: 'PRODUCT.minFinenessModulus'
        },
        {
          fieldKey: 'ivtSpecifications.maxFinenessModulus',
          fieldI18nKey: 'PRODUCT.maxFinenessModulus',
          fieldLabel: '最大细度比',
          componentType: 'NUMBER',
          valueType: 'DECIMAL'
        },
        {
          fieldKey: 'ivtSpecifications.extendRemarks',
          fieldI18nKey: 'ui.remarks',
          fieldLabel: '扩展页签的备注',
          componentType: 'TEXTAREA',
          valueType: 'STRING'
        }
      ]
    },
    {
      sectionKey: 'commonFileList',
      sectionLabel: '附件列表',
      sectionI18nKey: 'ui.attachment',
      collections: [
        {
          fieldKey: 'commonFileList',
          fieldLabel: '附件列表',
          fieldI18nKey: 'ui.attachment',
          itemKeyPrefix: 'commonFileList',
          identityRules: [
            {
              fields: ['fileMd5'],
              requiredEmptyFields: []
            },
            {
              fields: ['fileId'],
              requiredEmptyFields: []
            },
            {
              fields: ['fileName', 'fileSize'],
              requiredEmptyFields: []
            }
          ],
          itemLabelFields: ['fileName'],
          summaryFields: ['fileName', 'fileExtension', 'fileSize', 'remarks'],
          componentType: 'ATTACHMENT',
          fields: [
            {
              fieldKey: 'fileName',
              fieldLabel: '文件名',
              fieldI18nKey: 'PURCHASE.versionComparisonV2.fileName',
              componentType: 'TEXT',
              valueType: 'STRING'
            },
            {
              fieldKey: 'fileExtension',
              fieldLabel: '文件类型',
              fieldI18nKey: 'PURCHASE.versionComparisonV2.fileType',
              componentType: 'TEXT',
              valueType: 'STRING'
            },
            {
              fieldKey: 'fileSize',
              fieldLabel: '文件大小',
              fieldI18nKey: 'PURCHASE.versionComparisonV2.fileSize',
              componentType: 'NUMBER',
              valueType: 'INTEGER',
              formatter: { type: 'FILE_SIZE' }
            },
            {
              fieldKey: 'remarks',
              fieldLabel: '备注',
              fieldI18nKey: 'ui.remarks',
              componentType: 'TEXTAREA',
              valueType: 'STRING'
            }
          ]
        }
      ]
    },
    {
      sectionKey: 'commonFileListForImage',
      sectionLabel: '图片列表',
      sectionI18nKey: 'PRODUCT.productImage',
      collections: [
        {
          fieldKey: 'commonFileListForImage',
          fieldLabel: '图片列表',
          fieldI18nKey: 'PRODUCT.productImage',
          itemKeyPrefix: 'commonFileListForImage',
          identityRules: [
            {
              fields: ['fileMd5'],
              requiredEmptyFields: []
            },
            {
              fields: ['id'],
              requiredEmptyFields: []
            },
            {
              fields: ['fileName', 'size'],
              requiredEmptyFields: []
            }
          ],
          itemLabelFields: ['fileName'],
          summaryFields: ['fileName', 'fileExtension', 'size', 'remarks'],
          componentType: 'ATTACHMENT',
          fields: [
            {
              fieldKey: 'fileName',
              fieldLabel: '文件名',
              fieldI18nKey: 'PURCHASE.versionComparisonV2.fileName',
              componentType: 'TEXT',
              valueType: 'STRING'
            },
            {
              fieldKey: 'fileExtension',
              fieldLabel: '文件类型',
              fieldI18nKey: 'PURCHASE.versionComparisonV2.fileType',
              componentType: 'TEXT',
              valueType: 'STRING'
            },
            {
              fieldKey: 'size',
              fieldLabel: '文件大小',
              fieldI18nKey: 'PURCHASE.versionComparisonV2.fileSize',
              componentType: 'NUMBER',
              valueType: 'INTEGER',
              formatter: { type: 'FILE_SIZE' }
            },
            {
              fieldKey: 'remarks',
              fieldLabel: '备注',
              fieldI18nKey: 'ui.remarks',
              componentType: 'TEXTAREA',
              valueType: 'STRING'
            }
          ]
        }
      ]
    }
  ]
}
