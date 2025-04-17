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
      <v-card-title class="text-center">登录</v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
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
          
          <v-btn
            color="primary"
            type="submit"
            block
            class="mt-4"
            :loading="loading"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </v-btn>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="justify-center">
        <v-btn
          variant="text"
          @click="router.push('/register')"
          :disabled="loading"
        >
          没有账号？立即注册
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
import  InteractiveGridPattern  from '@/components/style/InteractiveGridPattern.vue'

const username = ref('')
const password = ref('')
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

const handleLogin = async () => {
  loading.value = true
  try {
    const result = await userStore.login(username.value, password.value)
    if (result.code === 1) {
      console.log('succeed')
      showMessage(result.msg || '登录成功', 'success')
      // 登录成功，跳转到管理界面
      setTimeout(() => {
        router.push('/system')
      }, 1500)
    } else {
      showMessage(result.msg || '登录失败', 'error')
    }
  } catch (error) {
    console.error(error)
    showMessage('登录失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.relative {
  position: relative;
  background: linear-gradient(to bottom right, #f0f4ff, #e6f0ff);
  overflow: hidden;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  mask-image: radial-gradient(350px circle at center, white, transparent);
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 20px;
  }
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