<template>
  <div class="settings-container">
    <v-card elevation="2">
      <v-card-title class="text-h6 font-weight-medium">系统设置</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="settings.notificationEmail"
            label="通知邮箱"
            prepend-icon="mdi-email"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-switch
            v-model="settings.autoScan"
            label="自动扫描"
            prepend-icon="mdi-scan"
            color="primary"
            class="mb-4"
          ></v-switch>
          <v-switch
            v-model="settings.emailNotification"
            label="邮件通知"
            prepend-icon="mdi-bell"
            color="primary"
            class="mb-4"
          ></v-switch>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="saveSettings" variant="flat">保存设置</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 系统设置
const settings = ref({
  notificationEmail: 'admin@example.com',
  autoScan: true,
  emailNotification: true,
})

// 保存设置
const saveSettings = () => {
  // 这里可以添加保存设置的逻辑
  console.log('保存设置:', settings.value)
}
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style> 