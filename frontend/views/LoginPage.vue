<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Lock, Message, User } from '@element-plus/icons-vue'
import { login, register } from '../api/auth'

const router = useRouter()
const mode = ref('login')
const loading = ref(false)
const form = ref({
  account: '',
  userName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLogin = computed(() => mode.value === 'login')
const headingTitle = computed(() => isLogin.value ? '登录你的笔记空间' : '创建你的笔记空间')
const headingSub = computed(() => isLogin.value ? '登录后即可同步目录、标签和文档内容。' : '注册后即可开始创建目录和笔记。')

function switchMode(next) {
  mode.value = next
  form.value.password = ''
  form.value.confirmPassword = ''
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || '请稍后重试'
}

async function handleLogin() {
  const account = form.value.account.trim()
  if (!account || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  loading.value = true
  try {
    const { data } = await login({ account, password: form.value.password })
    localStorage.setItem('localnote-token', data.accessToken)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  const userName = form.value.userName.trim()
  const email = form.value.email.trim()
  const password = form.value.password
  const confirmPassword = form.value.confirmPassword

  if (!userName || !email || !password || !confirmPassword) {
    ElMessage.warning('请完整填写注册信息')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }
  if (password.length < 6 || password.length > 12) {
    ElMessage.warning('密码长度需要在 6 到 12 位之间')
    return
  }
  if (password !== confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    await register({ userName, email, password })
    ElMessage.success('注册成功，请登录')
    form.value.account = userName
    form.value.password = ''
    form.value.confirmPassword = ''
    mode.value = 'login'
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function handleSubmit() {
  if (isLogin.value) handleLogin()
  else handleRegister()
}
</script>

<template>
  <main class="login-shell">
    <section class="login-panel">
      <button class="back-link" type="button" @click="router.push('/')">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        <span>返回本地笔记</span>
      </button>

      <div class="brand">
        <span class="brand-mark">L</span>
        <div>
          <strong>LocalNote</strong>
          <small>PRIVATE NOTES</small>
        </div>
      </div>

      <div class="login-heading">
        <p class="eyebrow">{{ isLogin ? 'WELCOME BACK' : 'JOIN LOCALNOTE' }}</p>
        <h1>{{ headingTitle }}</h1>
        <p>{{ headingSub }}</p>
      </div>

      <el-form class="login-form" label-position="top" @submit.prevent="handleSubmit">
        <template v-if="isLogin">
          <el-form-item label="账号 / 邮箱">
            <el-input v-model="form.account" size="large" placeholder="请输入账号或邮箱" :prefix-icon="User"
              autocomplete="username" />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="用户名">
            <el-input v-model="form.userName" size="large" placeholder="请输入用户名" :prefix-icon="User"
              autocomplete="username" />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input v-model="form.email" size="large" placeholder="请输入邮箱" :prefix-icon="Message"
              autocomplete="email" />
          </el-form-item>
        </template>

        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" type="password" placeholder="请输入密码" :prefix-icon="Lock"
            show-password :autocomplete="isLogin ? 'current-password' : 'new-password'" @keyup.enter="handleSubmit" />
        </el-form-item>

        <el-form-item v-if="!isLogin" label="确认密码">
          <el-input v-model="form.confirmPassword" size="large" type="password" placeholder="请再次输入密码"
            :prefix-icon="Lock" show-password autocomplete="new-password" @keyup.enter="handleSubmit" />
        </el-form-item>

        <el-button class="login-button" type="primary" size="large" :loading="loading" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册' }}
        </el-button>
      </el-form>

      <p class="auth-switch">
        <template v-if="isLogin">
          还没有账号？
          <button type="button" @click="switchMode('register')">立即注册</button>
        </template>
        <template v-else>
          已经有账号？
          <button type="button" @click="switchMode('login')">返回登录</button>
        </template>
      </p>
    </section>
  </main>
</template>

<style scoped>
.login-shell {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at 18% 20%, rgba(35, 100, 88, .12), transparent 30%),
    radial-gradient(circle at 82% 75%, rgba(217, 119, 69, .10), transparent 28%),
    #f7f8f5;
}

.login-panel {
  width: min(430px, 100%);
  padding: 34px 38px 30px;
  border: 1px solid #e2e6e0;
  border-radius: 18px;
  background: rgba(255, 255, 255, .92);
  box-shadow: 0 24px 60px rgba(40, 70, 58, .12);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0;
  border: 0;
  color: #718078;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
}

.back-link:hover {
  color: #236458;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  background: #236458;
  font: 700 21px 'Noto Serif SC', serif;
  box-shadow: 0 8px 18px rgba(35, 100, 88, .2);
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  color: #26312c;
  font: 700 20px 'Noto Serif SC', serif;
}

.brand small {
  margin-top: 3px;
  color: #9aa19c;
  font-size: 9px;
  letter-spacing: .18em;
}

.login-heading {
  margin: 34px 0 26px;
}

.eyebrow {
  margin: 0 0 7px;
  color: #d97745;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .17em;
}

.login-heading h1 {
  margin: 0;
  color: #26312c;
  font: 700 27px 'Noto Serif SC', serif;
  letter-spacing: -.03em;
}

.login-heading p:last-child {
  margin: 9px 0 0;
  color: #8d9691;
  font-size: 13px;
}

.login-form :deep(.el-form-item__label) {
  color: #56615b;
  font-size: 12px;
  font-weight: 600;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: #f3f5f1;
  box-shadow: none;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #236458 inset;
}

.login-button {
  width: 100%;
  height: 46px;
  margin-top: 6px;
  border: 0;
  box-shadow: 0 8px 18px rgba(35, 100, 88, .16);
}

.auth-switch {
  margin: 18px 0 0;
  color: #8d9691;
  font-size: 12px;
  text-align: center;
}

.auth-switch button {
  padding: 0;
  border: 0;
  color: #236458;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
}

.auth-switch button:hover {
  color: #1a4f45;
}
</style>
