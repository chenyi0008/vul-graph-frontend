<template>
  <v-app>
    <v-main>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
</script>

<style>
.v-application {
  background-color: #f5f5f5;
}
</style>
