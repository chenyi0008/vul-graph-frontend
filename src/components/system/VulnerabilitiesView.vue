<template>
  <div class="vulnerabilities-container">
    <v-card elevation="2">
      <v-card-title class="text-h6 font-weight-medium">漏洞列表</v-card-title>
      <v-data-table
        :headers="vulnerabilityHeaders"
        :items="vulnerabilities"
        :items-per-page="5"
        class="elevation-1"
      ></v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 漏洞列表数据
const vulnerabilityHeaders = ref([
  { title: '漏洞ID', key: 'id', sortable: true },
  { title: '漏洞名称', key: 'name', sortable: true },
  { title: '风险等级', key: 'level', sortable: true },
  { title: '发现时间', key: 'time', sortable: true },
  { title: '状态', key: 'status', sortable: true },
])

const vulnerabilities = ref([
  { id: 'VUL-001', name: 'SQL注入漏洞', level: '高危', time: '2024-03-01', status: '待修复' },
  { id: 'VUL-002', name: 'XSS跨站脚本', level: '中危', time: '2024-03-02', status: '已修复' },
  { id: 'VUL-003', name: '文件上传漏洞', level: '高危', time: '2024-03-03', status: '待修复' },
  { id: 'VUL-004', name: '命令注入', level: '高危', time: '2024-03-04', status: '已修复' },
  { id: 'VUL-005', name: '越权访问', level: '中危', time: '2024-03-05', status: '待修复' },
])
</script>

<style scoped>
.vulnerabilities-container {
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