<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      width="200"
      class="bg-grey-lighten-5 rounded-sm"
    >
      <v-list-item
        :prepend-avatar="avatar"
        :title="userStore.username"
        nav
        class="bg-grey-lighten-3"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav class="mt-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          @click="handleMenuClick(item)"
          :active="currentView === item.value"
          rounded="3"
          class="mb-1"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="white"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-white">web漏洞知识图谱</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        prepend-icon="mdi-logout"
        @click="handleLogout"
        color="white"
        variant="text"
      >
        退出登录
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-4">
        <DashboardView v-if="currentView === 'dashboard'" />
        <VulnerabilitiesView v-if="currentView === 'vulnerabilities'" />
        <CveView v-if="currentView === 'cve'" />
        <SoftwareView v-if="currentView === 'software'" />
        <SystemNodeView v-if="currentView === 'system'" />
        <SettingsView v-if="currentView === 'settings'" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import avatar from '@/assets/20250416222128.jpg'
import DashboardView from '@/components/system/DashboardView.vue'
import VulnerabilitiesView from '@/components/system/VulnerabilitiesView.vue'
import CveView from '@/components/system/CveView.vue'
import SettingsView from '@/components/system/SettingsView.vue'
import SoftwareView from '@/components/system/SoftwareView.vue'
import SystemNodeView from '@/components/system/SystemNodeView.vue'

const drawer = ref<boolean>(true)
const rail = ref<boolean>(false)
const currentView = ref<string>('cve')
const userStore = useUserStore()
const router = useRouter()

// 添加窗口宽度监听
const checkWindowWidth = () => {
  if (window.innerWidth < 960) {
    drawer.value = false
    rail.value = false
  } else {
    drawer.value = true
  }
}

// 组件挂载时添加监听
onMounted(() => {
  checkWindowWidth()
  window.addEventListener('resize', checkWindowWidth)
})

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('resize', checkWindowWidth)
})

interface MenuItem {
  title: string
  icon: string
  value: string
}

const menuItems = ref<MenuItem[]>([
  { title: 'CVE漏洞', icon: 'mdi-shield-alert', value: 'cve' },
  { title: '软件信息', icon: 'mdi-application', value: 'software' },
  { title: '系统节点', icon: 'mdi-server', value: 'system' },
  { title: '仪表盘', icon: 'mdi-view-dashboard', value: 'dashboard' },
  { title: '漏洞列表', icon: 'mdi-bug', value: 'vulnerabilities' },
  { title: '系统设置', icon: 'mdi-cog', value: 'settings' },
])

const handleMenuClick = (item: MenuItem) => {
  currentView.value = item.value
  // 在小屏幕时点击菜单项后自动收起菜单
  if (window.innerWidth < 960) {
    drawer.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.v-list-item {
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.08) !important;
  color: rgb(25, 118, 210) !important;
}
</style> 