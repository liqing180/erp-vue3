<template>
  <div v-if="visible" class="password-mask">
    <div class="password-box">
      <div class="password-title">{{ t('login.settingNewPassword') }}</div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="160px"
        class="password-form"
      >
        <el-form-item :label="t('ui.newPassword')" prop="password">
          <el-input
            v-model="form.password"
            :type="form.passwordVisible ? 'text' : 'password'"
            autocomplete="off"
            clearable
            class="password-input"
            @input="value => updatePassword('password', value)"
          >
            <template #prefix>
              <svg-icon icon-class="password" class="input-icon" />
            </template>
            <template #suffix>
              <svg-icon
                :icon-class="form.passwordVisible ? 'psd-hide' : 'psd-show'"
                class="input-icon password-visible-icon"
                @click="form.passwordVisible = !form.passwordVisible"
              />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="t('ui.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            :type="form.confirmPasswordVisible ? 'text' : 'password'"
            autocomplete="off"
            clearable
            class="password-input"
            @input="value => updatePassword('confirmPassword', value)"
          >
            <template #prefix>
              <svg-icon icon-class="password" class="input-icon" />
            </template>
            <template #suffix>
              <svg-icon
                :icon-class="form.confirmPasswordVisible ? 'psd-hide' : 'psd-show'"
                class="input-icon password-visible-icon"
                @click="form.confirmPasswordVisible = !form.confirmPasswordVisible"
              />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item class="confirm-form-item">
          <el-button
            :loading="loading"
            type="primary"
            class="confirm-button"
            @click.prevent="submitPassword"
          >
            {{ t('uiBtn.confirm') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { initPassword } from '@/api/login'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { proxy } = getCurrentInstance()
const { t } = useI18n()
const store = useStore()

const formRef = ref()
const visible = ref(false)
const loading = ref(false)
const form = reactive({
  password: '',
  confirmPassword: '',
  passwordVisible: false,
  confirmPasswordVisible: false
})

const passwordRules = [
  {
    required: true,
    pattern: /^(?!(\s+$))/,
    trigger: ['blur', 'change'],
    message: t('ui.reqMsg').replace('$1', t('ui.newPassword'))
  },
  {
    min: 6,
    max: 20,
    message: t('login.validPassword'),
    trigger: 'blur'
  }
]

const rules = {
  password: passwordRules,
  confirmPassword: [
    {
      required: true,
      pattern: /^(?!(\s+$))/,
      trigger: ['blur', 'change'],
      message: t('ui.reqMsg').replace('$1', t('ui.confirmPassword'))
    },
    {
      min: 6,
      max: 20,
      message: t('login.validPassword'),
      trigger: 'blur'
    }
  ]
}

function updatePassword(field, value) {
  form[field] = String(value || '').replace(/\s/g, '')
}

function reset() {
  Object.assign(form, {
    password: '',
    confirmPassword: '',
    passwordVisible: false,
    confirmPasswordVisible: false
  })
  nextTick(() => formRef.value?.clearValidate())
}

function open() {
  reset()
  visible.value = true
}

async function submitPassword() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const password = form.password.trim()
  const confirmPassword = form.confirmPassword.trim()
  if (password !== confirmPassword) {
    proxy.$modal.msgError(t('login.passwordInconsistent'))
    return
  }

  loading.value = true
  try {
    await initPassword({ password })
    store.commit('SET_IS_ALREADY_SET_PASSWORD', '1')
    proxy.$modal.msgSuccess(t('login.resetSuccess'))
    visible.value = false
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style lang="scss" scoped>
.password-mask {
  position: fixed;
  inset: 0;
  z-index: 1001;
  background-color: rgba(0, 0, 0, 0.5);
}

.password-box {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 550px;
  padding: 0 30px 30px;
  background-color: #fff;
  border-radius: 10px;
  transform: translate(-50%, -50%);
}

.password-title {
  padding: 20px 0;
  border-bottom: 1px solid #ccc;
  color: #303133;
  font-size: 18px;
}

.password-form {
  margin-top: 30px;

  :deep(.el-form-item__label) {
    font-size: 15px !important;
    font-weight: 700 !important;
    line-height: 40px;
  }
}

.password-input {
  :deep(.el-input__wrapper),
  :deep(.el-input__inner) {
    min-height: 35px;
    font-size: 15px !important;
  }
}

.input-icon {
  font-size: 15px;
}

.password-visible-icon {
  font-size: 20px;
  cursor: pointer;
}

.confirm-form-item {
  width: 100%;
  margin-top: 20px;
}

.confirm-button {
  width: 100%;
  height: 40px;
}
</style>
