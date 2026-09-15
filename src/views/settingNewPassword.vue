<template>
  <div class="login_container">
    <div class="login-form">
      <div class="title">Setting New Password</div>
      <el-form label-width="140px" ref="form" :model="form" :rules="rules">
        <el-form-item
          label="New Password"
          prop="password"
          style="margin-bottom: 34px"
        >
          <el-input
            v-model="form.password"
            autoComplete="off"
            type="password"
            show-password
          >
            <template v-slot:prefix>
              <svg-icon
                style="height: 22px"
                icon-class="password"
                class="el-input__icon input-icon"
              />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            autoComplete="off"
            type="password"
            show-password
          >
            <template v-slot:prefix>
              <svg-icon
                style="height: 22px"
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
  </div>
</template>

<script>
import {
  setNewPassword,
  setNewPasswordInfo,
  setInitialPassword,
  resetPasswordForSubmitVC,
  resetPasswordForSubmitPW
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
        newPasswordType: false
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
      t: ''
    }
  },
  created() {
    this.form = {
      registerId: '',
      uuid: '',
      password: '',
      confirmPassword: '',
      passwordType: false,
      newPasswordType: false,
      userUuid: '',
      verificationCode: '',
      resetPasswordUuid: ''
    }
    this.form.registerId = this.$route.query.id || ''
    this.form.uuid = this.$route.query.uuid || ''
    this.form.userUuid = this.$route.query.userUuid || ''
    this.form.verificationCode = this.$route.query.verificationCode || ''
    this.t = this.$route.query.t || ''
    if (this.form.registerId && this.form.uuid) {
      this.setNewPasswordInfo()
    } else if (this.form.userUuid && this.form.verificationCode) {
      this.resetPasswordForSubmitVC()
    }
  },
  activated() {},
  methods: {
    setNewPasswordInfo() {
      setNewPasswordInfo({
        registerId: this.form.registerId,
        uuid: this.form.uuid
      })
        .then(res => {
          console.log(res)
          // active: 链接是否有效： 0否, 1是
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
    resetPasswordForSubmitVC() {
      resetPasswordForSubmitVC({
        userUuid: this.form.userUuid,
        verificationCode: this.form.verificationCode
      })
        .then(res => {
          this.form.resetPasswordUuid = res.msg
        })
        .catch(() => {})
    },
    changeInputType(type) {
      this.form[type] = !this.form[type]
    },
    submit() {
      if (this.form.password && this.form.confirmPassword) {
        this.form.password = this.form.password.trim()
        this.form.confirmPassword = this.form.confirmPassword.trim()
      }
      this.$refs.form
        .validate()
        .then(valid => {
          if (valid) {
            if (this.form.password !== this.form.confirmPassword) {
              this.$modal.msgError(
                'The passwords entered twice are inconsistent.'
              )
              return
            }
            this.isLoading = true
            if (this.form.userUuid && this.form.verificationCode) {
              resetPasswordForSubmitPW({
                password: this.form.password,
                resetPasswordUuid: this.form.resetPasswordUuid,
                userUuid: this.form.userUuid
              })
                .then(res => {
                  // 登录页
                  sessionStorage.setItem('type', '')
                  this.$router.push({
                    path: '/login',
                    query: { redirect: '/index' }
                  })
                  this.$modal.msgSuccess(this.$t('login.resetSuccess'))
                })
                .catch(err => {
                  console.log(err)
                })
              return
            }
            const { passwordType, newPasswordType, ...params } = this.form
            if (this.t === '1') {
              setNewPassword(params).then(res => {
                sessionStorage.setItem('entryIdx', 2)
                this.$router.push({ path: '/' }).catch(() => {})
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
                // 运营平台
                /**
                    code: "10"
                    password: "123456"
                    tenantType: 3
                    username: "admin"
                    uuid: "72a657bfef2f4760a9586edb78bc995c"
                 */

                // 承运商
                /**
                    code: "13"
                    password: "123456"
                    tenantCode: "OceanCarrier"
                    tenantType: 2
                    username: "OceanCarrier"
                    uuid: "7240f049915541d68f4220f5324444c9"
                 */
                this.$store.dispatch('FedLogOut')
                this.$store
                  .dispatch('Login', query)
                  .then(() => {
                    this.$router.push({ path: '/' }).catch(() => {})
                    this.isLoading = false
                  })
                  .catch(() => {
                    this.isLoading = false
                  })
              })
              .catch(() => {
                this.isLoading = false
              })
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  margin: 0px auto 30px auto;
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
}

.login-form {
  position: relative;
  border-radius: 6px;
  background: #ffffff;
  width: 500px;
  padding: 25px 25px 5px 25px;
}
</style>
