<template>
  <div
    :class="[
      'login_container',
      isMobile ? 'login_container-mobile' : '',
      active === '0' ? 'active-bgc' : ''
    ]"
  >
    <div v-if="active === '1'" class="login-form">
      <div class="title">Setting New Password</div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="140px"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item
          label="New Password"
          prop="password"
          style="margin-bottom: 34px"
        >
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="off"
            clearable
            show-password
            @input="removeWhitespace('password', $event)"
          >
            <template #prefix>
              <svg-icon
                icon-class="password"
                class="el-input__icon input-icon"
              />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            autocomplete="off"
            clearable
            show-password
            @input="removeWhitespace('confirmPassword', $event)"
          >
            <template #prefix>
              <svg-icon
                icon-class="password"
                class="el-input__icon input-icon"
              />
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <div style="width: 100%; margin: 40px 0 25px; text-align: center">
        <el-button
          type="primary"
          :loading="isLoading"
          style="width: 100%"
          @click.prevent="submit"
        >
          <span>Submit</span>
        </el-button>
      </div>
    </div>

    <div v-if="active === '0'" class="link-expired">
      The link has expired.
    </div>
  </div>
</template>

<script>
import {
  setNewPassword,
  setNewPasswordInfo,
  setInitialPassword,
  resetPasswordForSubmitVC,
  resetPasswordForSubmitPW,
  resetPasswordForVerificationUuid
} from '@/api/login'

export default {
  name: 'TmsWebSettingnewpassword',
  data() {
    return {
      form: {
        registerId: '',
        uuid: '',
        password: '',
        confirmPassword: '',
        passwordType: false,
        newPasswordType: false,
        userUuid: '',
        verificationCode: '',
        resetPasswordUuid: ''
      },
      rules: {
        password: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            trigger: ['blur', 'change'],
            message: 'New Password is required.'
          },
          {
            min: 6,
            max: 20,
            message: 'Password length must be between 6 and 20 characters.',
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            trigger: ['blur', 'change'],
            message: 'Confirm Password is required.'
          },
          {
            min: 6,
            max: 20,
            message: 'Password length must be between 6 and 20 characters.',
            trigger: 'blur'
          }
        ]
      },
      isLoading: false,
      t: '',
      active: undefined
    }
  },
  computed: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }
  },
  created() {
    this.form.registerId = this.$route.query.id || ''
    this.form.uuid = this.$route.query.uuid || ''
    this.form.userUuid = this.$route.query.userUuid || ''
    this.form.verificationCode = this.$route.query.verificationCode || ''
    this.t = this.$route.query.t || ''
    this.verifyResetPasswordLink()
  },
  methods: {
    removeWhitespace(field, value) {
      this.form[field] = value.replace(/\s/g, '')
    },
    clearInput(field) {
      this.form[field] = undefined
    },
    verifyResetPasswordLink() {
      return resetPasswordForVerificationUuid({
        userUuid: this.form.userUuid
      })
        .then(res => {
          this.active = res.msg
          if (res.msg === '1') {
            return this.submitVerificationCode()
          }
          return undefined
        })
        .catch(() => {})
    },
    setNewPasswordInfo() {
      return setNewPasswordInfo({
        registerId: this.form.registerId,
        uuid: this.form.uuid
      })
        .then(res => {
          if (res.data.active === 0) {
            if (res.data.registerType === '1') {
              sessionStorage.setItem('entryIdx', 2)
            } else {
              sessionStorage.setItem('entryIdx', 1)
            }
            this.$router.push({ path: '/' }).catch(() => {})
          }
        })
        .catch(() => {})
    },
    submitVerificationCode() {
      return resetPasswordForSubmitVC({
        userUuid: this.form.userUuid,
        verificationCode: this.form.verificationCode
      })
        .then(res => {
          this.form.resetPasswordUuid = res.msg
        })
        .catch(() => {})
    },
    submit() {
      if (this.form.password && this.form.confirmPassword) {
        this.form.password = this.form.password.trim()
        this.form.confirmPassword = this.form.confirmPassword.trim()
      }

      this.$refs.form
        .validate()
        .then(valid => {
          if (!valid) return

          if (this.form.password !== this.form.confirmPassword) {
            this.$modal.msgError(
              'The passwords entered twice are inconsistent.'
            )
            return
          }

          this.isLoading = true
          if (this.form.userUuid && this.form.verificationCode) {
            this.submitResetPassword()
            return
          }

          const { passwordType, newPasswordType, ...params } = this.form
          if (this.t === '1') {
            setNewPassword(params)
              .then(() => {
                sessionStorage.setItem('entryIdx', 2)
                this.$router.push({ path: '/' }).catch(() => {})
              })
              .finally(() => {
                this.isLoading = false
              })
            return
          }

          setInitialPassword(params)
            .then(res => {
              const query = res.data
              query.username = res.data.account
              query.tenantType = res.data.registerType
              if (res.data.registerType === '1') {
                sessionStorage.setItem('entryIdx', 2)
                query.tenantCode = 'Customer'
              } else {
                sessionStorage.setItem('entryIdx', 1)
              }

              this.$store.dispatch('FedLogOut')
              return this.$store.dispatch('Login', query)
            })
            .then(() => {
              this.$router.push({ path: '/' }).catch(() => {})
            })
            .finally(() => {
              this.isLoading = false
            })
        })
        .catch(() => {})
    },
    submitResetPassword() {
      resetPasswordForVerificationUuid({ userUuid: this.form.userUuid })
        .then(res => {
          this.active = res.msg
          if (res.msg !== '1') {
            this.isLoading = false
            return
          }

          return resetPasswordForSubmitPW({
            password: this.form.password,
            resetPasswordUuid: this.form.resetPasswordUuid,
            userUuid: this.form.userUuid
          }).then(() => {
            sessionStorage.setItem('type', '')
            this.$router.push({
              path: '/login',
              query: { redirect: '/index' }
            })
            this.$modal.msgSuccess(this.$t('login.resetSuccess'))
            this.isLoading = false
          })
        })
        .catch(() => {
          this.isLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  margin: 0 auto 30px auto;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #1890ff;
}

.login_container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 1300px;
  height: 100vh;
  min-height: 800px;
  background: linear-gradient(90deg, #40c2ff, #4084ff);

  .login-form {
    position: relative;
    border-radius: 6px;
    background: #ffffff;
    width: 500px;
    padding: 25px 25px 5px 25px;
  }
}

.link-expired {
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login_container-mobile {
  position: fixed;
  top: 0;
  left: 0;
  min-width: 0;
  min-height: 0;
  width: 100vw;
  height: 100vh;

  .login-form {
    position: relative;
    border-radius: 6px;
    background: #ffffff;
    width: 90vw;
    max-width: 500px;
    padding: 20px;

    :deep(.el-form-item) {
      margin-bottom: 10px !important;
    }

    :deep(.el-form-item__label) {
      padding: 0 !important;
    }
  }

  .link-expired {
    font-size: 18px;
  }
}

.active-bgc {
  background: initial;
  background-color: #fff !important;
}
</style>
