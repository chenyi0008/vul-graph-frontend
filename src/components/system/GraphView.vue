<template>
  <div class="settings-container">
    <v-card elevation="2">
      <Graph style=" height: auto;"></Graph>
      <!-- <CveGraph cveId="222" /> -->
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Graph from '@/components/neo4j/Graph.vue'
import CveGraph from '@/components/neo4j/CveGraph.vue'

</script>

<style scoped>

</style> 