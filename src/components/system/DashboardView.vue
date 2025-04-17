<template>
  <div class="dashboard-container">
    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="card in dashboardCards" :key="card.title">
        <v-card class="h-100" elevation="2">
          <v-card-item>
            <v-card-title class="text-subtitle-1 font-weight-medium">{{ card.title }}</v-card-title>
            <v-card-text class="text-h4 text-primary">{{ card.value }}</v-card-text>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 仪表盘卡片数据
const dashboardCards = ref([
  { title: '总漏洞数', value: '128' },
  { title: '高危漏洞', value: '24' },
  { title: '待处理', value: '36' },
  { title: '已修复', value: '92' },
])
</script>

<style scoped>
.dashboard-container {
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