<script setup>
import { computed, ref ,onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Hide, Key, Lock, Message, User, View } from '@element-plus/icons-vue'
import { login, register } from '../api/auth'
import { getCaptcha } from '../api/captcha'

const router = useRouter()
const mode = ref('login')
const loading = ref(false)
const form = ref({
  account: '',
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  captchaCode: '',
  captchaId: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const captchaImage = ref('')
const captchaLoading = ref(false)
const captchaSrc = computed(() =>
  captchaImage.value ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(captchaImage.value)}` : ''
)


async function refreshCaptcha() {
  if (captchaLoading.value) return
  captchaLoading.value = true
  try {
    const { data } = await getCaptcha()
    captchaImage.value = data.image
    form.value.captchaId = data.captchaId
  } catch {
    captchaImage.value = ''
    form.value.captchaId = ''
    ElMessage.error('验证码加载失败，请点击重试')
  } finally {
    captchaLoading.value = false
  }
}

const isLogin = computed(() => mode.value === 'login')
const headingTitle = computed(() => isLogin.value ? '登录你的笔记空间' : '创建你的笔记空间')
const headingSub = computed(() => isLogin.value ? '登录后即可同步内容。' : '注册后即可开始创建目录和笔记。')

function switchMode(next) {
  mode.value = next
  form.value.password = ''
  form.value.confirmPassword = ''
  form.value.captchaCode = ''
  showPassword.value = false
  showConfirmPassword.value = false
}

function getErrorMessage(error) {
  console.error(error)
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
    const data = await login({ account, password: form.value.password,captchaId:form.value.captchaId,captchaCode:form.value.captchaCode })
    localStorage.setItem('localnote-token', data.accessToken)
    ElMessage.success('登录成功')
    router.push('/home')
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
  if (userName.length > 12) {
    ElMessage.warning('用户名最多 12 个字符')
    return
  }
  if (userName.includes('@')) {
    ElMessage.warning('用户名不能包含 @ 符号')
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
  const captchaCode = form.value.captchaCode.trim()
  if (!form.value.captchaId) {
    ElMessage.warning('验证码已失效，请点击刷新后重试')
    refreshCaptcha()
    return
  }
  if (!captchaCode) {
    ElMessage.warning('请输入图片验证码')
    return
  }

  loading.value = true
  try {
    await register({ userName, email, password, captchaId: form.value.captchaId, captchaCode })
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

onMounted(() => {
  refreshCaptcha()
})
</script>

<template>
  <main class="login-shell">
    <section class="login-panel">
      <div class="login-header">
        <div class="brand">
          <span class="brand-mark">L</span>
          <div>
            <strong>LocalNote</strong>
            <small>PRIVATE NOTES</small>
          </div>
        </div>

        <div class="login-heading">
          <h1>{{ headingTitle }}</h1>
          <p>{{ headingSub }}</p>
        </div>
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
          <el-input v-model="form.password" size="large" :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码" :prefix-icon="Lock"
            :autocomplete="isLogin ? 'current-password' : 'new-password'" @keyup.enter="handleSubmit">
            <template #suffix>
              <button type="button" class="password-toggle"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showPassword"
                @mousedown.prevent @click="showPassword = !showPassword">
                <el-icon>
                  <View v-if="showPassword" />
                  <Hide v-else  />
                </el-icon>
              </button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="!isLogin" label="确认密码">
          <el-input v-model="form.confirmPassword" size="large" :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码" :prefix-icon="Lock" autocomplete="new-password" @keyup.enter="handleSubmit">
            <template #suffix>
              <button type="button" class="password-toggle"
                :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showConfirmPassword"
                @mousedown.prevent @click="showConfirmPassword = !showConfirmPassword">
                <el-icon>
                  <View v-if="showConfirmPassword" />
                  <Hide v-else  />
                </el-icon>
              </button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="图片验证码">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" size="large" placeholder="请输入图片中的字符" :prefix-icon="Key"
              maxlength="4" autocomplete="off" @keyup.enter="handleSubmit" />
            <button class="captcha-image" type="button" aria-label="刷新图片验证码"
              :aria-busy="captchaLoading" :disabled="captchaLoading" @click="refreshCaptcha">
              <img v-if="captchaSrc" :src="captchaSrc" alt="验证码" />
              <span v-else class="captcha-placeholder">{{ captchaLoading ? '加载中…' : '点击获取' }}</span>
            </button>
          </div>
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
  --login-ink: #25302c;
  --login-muted: #6b756f;
  --login-line: #e1e6e0;
  --login-accent: #236458;
  display: grid;
  height: 100vh;
  height: 100dvh;
  place-items: center;
  overflow: hidden;
  padding: 20px;
  color: var(--login-ink);
  background:
    radial-gradient(ellipse 520px 420px at 15% 16%, rgba(35, 100, 88, .13), transparent 70%),
    radial-gradient(ellipse 460px 380px at 85% 80%, rgba(217, 119, 69, .11), transparent 70%),
    radial-gradient(ellipse 700px 520px at 50% 112%, rgba(35, 100, 88, .07), transparent 70%),
    #f7f8f5;
}

.login-shell ::selection {
  color: var(--login-ink);
  background: rgba(35, 100, 88, .18);
}

.login-panel {
  width: min(430px, 100%);
  padding: 26px 34px 22px;
  border: 1px solid rgba(225, 230, 224, .9);
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 1px 2px rgba(37, 48, 44, .05),
    0 28px 60px -22px rgba(40, 70, 58, .24);
  animation: panel-enter .52s cubic-bezier(.16, 1, .3, 1) both;
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
    filter: blur(6px);
  }

  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}

.login-panel :is(button, a):focus-visible {
  outline: 2px solid var(--login-accent);
  outline-offset: 2px;
}

.login-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: var(--login-accent);
  font: 700 15px 'Noto Serif SC', serif;
  box-shadow: 0 6px 14px -4px rgba(35, 100, 88, .45);
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  color: var(--login-ink);
  font: 700 15px 'Noto Serif SC', serif;
  letter-spacing: -.01em;
}

.brand small {
  margin-top: 2px;
  color: var(--login-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .11em;
}

.login-heading {
  flex: 1;
  min-width: 0;
  text-align: right;
}

.login-heading h1 {
  margin: 0;
  color: var(--login-ink);
  font: 700 22px/1.3 'Noto Serif SC', serif;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.login-heading p {
  margin: 6px 0 0;
  color: var(--login-muted);
  font-size: 12.5px;
  line-height: 1.55;
  text-wrap: balance;
}

.login-form {
  --el-text-color-regular: #25302c;
  --el-text-color-placeholder: #6b756f;
  --el-component-size-large: 44px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.login-form :deep(.el-form-item:last-of-type) {
  margin-bottom: 4px;
}

.login-form :deep(.el-form-item__label) {
  margin-bottom: 4px;
  color: #4f5b54;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 1px 12px;
  border: 1px solid var(--login-line);
  border-radius: 10px;
  background: #f8faf7;
  box-shadow: none;
  transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #c9d3cc;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--login-accent);
  background: #fff;
  box-shadow:
    0 0 0 1px var(--login-accent) inset,
    0 0 0 3px rgba(35, 100, 88, .12);
}

.login-form :deep(.el-input__inner) {
  color: var(--login-ink);
  caret-color: var(--login-accent);
}

.login-form :deep(.el-input__prefix),
.login-form :deep(.el-input__suffix) {
  color: var(--login-muted);
}

.login-form :deep(input:-webkit-autofill) {
  -webkit-text-fill-color: var(--login-ink);
  -webkit-box-shadow: 0 0 0 1000px #f8faf7 inset;
  caret-color: var(--login-accent);
}

.password-toggle {
  display: inline-flex;
  width: 28px;
  height: 28px;
  margin-right: -4px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 7px;
  color: var(--login-muted);
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: color .16s ease, background-color .16s ease;
}

.password-toggle:hover {
  color: var(--login-accent);
  background: rgba(35, 100, 88, .08);
}

.captcha-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.captcha-row :deep(.el-input) {
  flex: 1;
  min-width: 0;
}

.captcha-image {
  display: grid;
  flex: none;
  width: 112px;
  height: 44px;
  padding: 0;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--login-line);
  border-radius: 10px;
  background: #f3f5f1;
  cursor: pointer;
  transition: border-color .18s ease, background-color .18s ease, opacity .18s ease;
}

.captcha-image:hover:not(:disabled) {
  border-color: var(--login-accent);
  background: #eef3ee;
}

.captcha-image:disabled {
  cursor: wait;
  opacity: .65;
}

.captcha-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  color: var(--login-muted);
  font-size: 12px;
  letter-spacing: .04em;
}

.login-button {
  width: 100%;
  height: 46px;
  margin-top: 4px;
  border: 0;
  border-radius: 11px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: .06em;
  box-shadow: 0 10px 22px -10px rgba(35, 100, 88, .55);
  transition: transform .18s cubic-bezier(.22, 1, .36, 1), box-shadow .18s ease, background-color .18s ease;
}

.login-button:hover:not(.is-loading) {
  background-color: #1c5449;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px -12px rgba(35, 100, 88, .6);
}

.login-button:active:not(.is-loading) {
  transform: translateY(0);
}

.auth-switch {
  margin: 14px 0 0;
  color: var(--login-muted);
  font-size: 12.5px;
  text-align: center;
}

.auth-switch button {
  padding: 0;
  border: 0;
  color: var(--login-accent);
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  text-underline-offset: 3px;
}

.auth-switch button:hover {
  color: #1a4f45;
  text-decoration: underline;
}

@media (max-width: 520px) {
  .login-shell {
    padding: 16px;
  }

  .login-panel {
    padding: 22px 22px 20px;
    border-radius: 16px;
  }

  .login-heading h1 {
    font-size: 20px;
  }

  .captcha-image {
    width: 96px;
  }
}

@media (max-height: 620px) {
  .login-panel {
    padding: 16px 22px 14px;
  }

  .brand-mark {
    width: 30px;
    height: 30px;
  }

  .login-heading h1 {
    font-size: 19px;
  }

  .login-form {
    --el-component-size-large: 38px;
  }

  .login-form :deep(.el-form-item) {
    margin-bottom: 6px;
  }

  .login-form :deep(.el-form-item__label) {
    margin-bottom: 2px;
    line-height: 16px;
  }

  .login-button {
    height: 40px;
  }

  .auth-switch {
    margin-top: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-panel {
    animation: none;
  }

  .password-toggle,
  .captcha-image,
  .login-button,
  .login-form :deep(.el-input__wrapper) {
    transition: none;
  }
}
</style>
