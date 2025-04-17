<template>
  <div class="scans-container">
    <v-card elevation="2">
      <v-card-title class="text-h6 font-weight-medium">扫描任务</v-card-title>
      <v-timeline density="compact" align="start" class="pa-4">
        <v-timeline-item
          v-for="scan in scans"
          :key="scan.id"
          :dot-color="scan.status === 'completed' ? 'success' : 'warning'"
          size="small"
        >
          <template v-slot:opposite>
            <span class="text-caption">{{ scan.time }}</span>
          </template>
          <v-card class="elevation-1">
            <v-card-title class="text-subtitle-1">{{ scan.target }}</v-card-title>
            <v-card-text>
              <div class="text-caption">状态: {{ scan.status === 'completed' ? '已完成' : '进行中' }}</div>
              <div class="text-caption">发现漏洞: {{ scan.vulnerabilities }}</div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 扫描任务数据
const scans = ref([
  { id: 1, target: 'example.com', status: 'completed', time: '2024-03-01 10:00', vulnerabilities: 5 },
  { id: 2, target: 'test.com', status: 'in_progress', time: '2024-03-02 14:30', vulnerabilities: 0 },
  { id: 3, target: 'demo.com', status: 'completed', time: '2024-03-03 09:15', vulnerabilities: 3 },
])
</script>

<style scoped>
.scans-container {
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