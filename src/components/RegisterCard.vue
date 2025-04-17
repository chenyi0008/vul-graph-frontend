<template>
  <div class="relative grid h-screen place-content-center">
    <InteractiveGridPattern
      :class="'[mask-image:radial-gradient(350px_circle_at_center,white,transparent)]'"
      :width="20"
      :height="20"
      :squares="[80, 80]"
      squares-class-name="hover:fill-blue-500"
    />
    <v-card class="mx-auto relative z-10" width="400">
      <v-card-title class="text-center">注册</v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="handleRegister">
          <v-text-field
            v-model="username"
            label="用户名"
            required
            :disabled="loading"
          ></v-text-field>
          
          <v-text-field
            v-model="password"
            label="密码"
            type="password"
            required
            :disabled="loading"
          ></v-text-field>
          
          <v-text-field
            v-model="confirmPassword"
            label="确认密码"
            type="password"
            required
            :disabled="loading"
            :rules="[password === confirmPassword || '两次输入的密码不一致']"
          ></v-text-field>
          
          <v-btn
            color="primary"
            type="submit"
            block
            class="mt-4"
            :loading="loading"
            :disabled="loading"
          >
            {{ loading ? '注册中...' : '注册' }}
          </v-btn>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="justify-center">
        <v-btn
          variant="text"
          @click="router.push('/login')"
          :disabled="loading"
        >
          已有账号？立即登录
        </v-btn>
      </v-card-actions>

      <!-- 消息提示 -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
        location="bottom"
        class="mb-4"
      >
        <div class="d-flex align-center">
          <v-icon
            :icon="snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert'"
            class="mr-2"
          ></v-icon>
          {{ snackbar.text }}
        </div>
      </v-snackbar>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import InteractiveGridPattern from '@/components/style/InteractiveGridPattern.vue'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const userStore = useUserStore()
const router = useRouter()

// 消息提示状态
const snackbar = ref({
  show: false,
  text: '',
  color: 'success' as 'success' | 'error'
})

// 显示消息提示
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  snackbar.value.show = true
  snackbar.value.text = text
  snackbar.value.color = type === 'success' ? 'success' : 'error'
}

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    showMessage('两次输入的密码不一致', 'error')
    return
  }

  loading.value = true
  try {
    const result = await userStore.register(username.value, password.value)
    if (result.code === 1) {
      showMessage(result.msg || '注册成功', 'success')
      // 清空表单
      username.value = ''
      password.value = ''
      confirmPassword.value = ''
      // 1.5秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      showMessage(result.msg || '注册失败', 'error')
    }
  } catch (error) {
    console.error(error)
    showMessage('注册失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.relative {
  position: relative;
  background: linear-gradient(to bottom right, #f0f4ff, #e6f0ff);
}

.v-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.v-card-title {
  font-size: 24px;
  font-weight: 600;
  padding: 24px 0;
  color: #1a237e;
}

.v-card-text {
  padding: 0 24px 24px;
}

.v-text-field {
  margin-bottom: 16px;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.v-card-actions {
  padding: 16px 24px;
}
</style> 