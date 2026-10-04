<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Lock, User } from '@element-plus/icons-vue'
import { login } from '@/api/user'

const router = useRouter()
const form = ref({
  account: '',
  password: ''
})
const loading = ref(false)

async function handleLogin() {
  const account = form.value.account.trim()
  if (!account || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  // TODO: 由你在这里接入 axios 登录接口，例如：

  const data = await login({ account, password: form.value.password })
  localStorage.setItem('localnote-token', data.accessToken)
  router.push('/')


  // ElMessage.info('登录接口待接入：请先在 frontend/api 中完成 axios 封装')
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
        <p class="eyebrow">WELCOME BACK</p>
        <h1>登录你的笔记空间</h1>
        <p>登录后即可同步目录、标签和文档内容。</p>
      </div>

      <el-form class="login-form" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="账号 / 邮箱">
          <el-input v-model="form.account" size="large" placeholder="请输入账号或邮箱" :prefix-icon="User"
            autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" type="password" placeholder="请输入密码" :prefix-icon="Lock"
            show-password autocomplete="current-password" @keyup.enter="handleLogin" />
        </el-form-item>

        <el-button class="login-button" type="primary" size="large" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>

      <p class="login-note">接口联调前不会真正发送请求，登录逻辑由你稍后补充。</p>
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

.login-note {
  margin: 18px 0 0;
  color: #a1a8a3;
  font-size: 11px;
  line-height: 1.7;
  text-align: center;
}
</style>
