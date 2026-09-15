<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button type="primary" size="small" @click="submitForm"
        >{{ $t('uiBtn.save') }}
      </el-button>
    </template>
    <template v-slot:content>
      <div class="form-card">
        <questionnaireDetails ref="questionnaireDetails" />
      </div>
    </template>
  </FormPageLayout>
</template>

<script>
import questionnaireDetails from './components/questionnaireDetails'
export default {
  name: 'LeadValidationCriteria',
  components: {
    questionnaireDetails
  },
  data() {
    return {
      timeId: ''
    }
  },
  beforeCreate() {},
  created() {
    this.timeId = this.$route.query.timeId
    this.init()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.init()
    }
  },
  computed: {},
  methods: {
    init() {},
    async submitForm() {
      this.$refs.questionnaireDetails &&
        this.$refs.questionnaireDetails.submit()
    }
  }
}
</script>
