<template>
  <div class="graph-layout">
    <div class="graph-container">
      <div ref="graphRef" class="graph"></div>
      <div class="controls">
        <v-btn
          icon="mdi-magnify-plus"
          @click="zoomIn"
          class="control-btn"
        ></v-btn>
        <v-btn
          icon="mdi-magnify-minus"
          @click="zoomOut"
          class="control-btn"
        ></v-btn>
        <v-btn
          icon="mdi-refresh"
          @click="resetZoom"
          class="control-btn"
        ></v-btn>
      </div>
    </div>

    <div class="node-info" v-if="selectedNode">
      <v-card class="info-card">
        <v-card-title class="text-h5 d-flex justify-space-between align-center">
          <span>{{ selectedNode.labels[0] }} 详情</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="selectedNode = null"
            class="close-btn"
          ></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(value, key) in selectedNode.properties" :key="key">
              <v-list-item-title>{{ key }}</v-list-item-title>
              <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import neo4j from 'neo4j-driver'
import * as d3 from 'd3'

const graphRef = ref<HTMLElement | null>(null)
const driver = neo4j.driver(
//   'bolt://localhost:7687',
  'bolt://10.33.58.130:7687',
  neo4j.auth.basic('reader', 'reader890')
)

interface Node {
  id: string
  labels: string[]
  properties: Record<string, any>
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string
  target: string
  type: string
  properties: Record<string, any>
}

const nodes = ref<Node[]>([])
const links = ref<Link[]>([])
const zoom = ref<d3.ZoomBehavior<Element, unknown>>()
const selectedNode = ref<Node | null>(null)

//sql
const fetchData = async () => {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (cve:CVE)
      OPTIONAL MATCH (cve)-[r1]->(s:Software)
      OPTIONAL MATCH (cve)-[r2]->(sys:System)
      OPTIONAL MATCH (country:Country)-[r3]->(cve)
      RETURN cve, r1, s, r2, sys, r3, country
    `)

    const nodeMap = new Map<string, Node>()
    const linkSet = new Set<string>()

    result.records.forEach(record => {
      const cve = record.get('cve')
      const software = record.get('s')
      const system = record.get('sys')
      const country = record.get('country')
      const rel1 = record.get('r1')
      const rel2 = record.get('r2')
      const rel3 = record.get('r3')

      if (cve) {
        nodeMap.set(cve.identity.toString(), {
          id: cve.identity.toString(),
          labels: cve.labels,
          properties: cve.properties
        })
      }

      if (software) {
        nodeMap.set(software.identity.toString(), {
          id: software.identity.toString(),
          labels: software.labels,
          properties: software.properties
        })
      }

      if (system) {
        nodeMap.set(system.identity.toString(), {
          id: system.identity.toString(),
          labels: system.labels,
          properties: system.properties
        })
      }

      if (country) {
        nodeMap.set(country.identity.toString(), {
          id: country.identity.toString(),
          labels: country.labels,
          properties: country.properties
        })
      }

      if (rel1) {
        const linkId = `${rel1.start.toString()}-${rel1.end.toString()}`
        if (!linkSet.has(linkId)) {
          links.value.push({
            source: rel1.start.toString(),
            target: rel1.end.toString(),
            type: rel1.type,
            properties: rel1.properties
          })
          linkSet.add(linkId)
        }
      }

      if (rel2) {
        const linkId = `${rel2.start.toString()}-${rel2.end.toString()}`
        if (!linkSet.has(linkId)) {
          links.value.push({
            source: rel2.start.toString(),
            target: rel2.end.toString(),
            type: rel2.type,
            properties: rel2.properties
          })
          linkSet.add(linkId)
        }
      }

      if (rel3) {
        const linkId = `${rel3.start.toString()}-${rel3.end.toString()}`
        if (!linkSet.has(linkId)) {
          links.value.push({
            source: rel3.start.toString(),
            target: rel3.end.toString(),
            type: rel3.type,
            properties: rel3.properties
          })
          linkSet.add(linkId)
        }
      }
    })

    nodes.value = Array.from(nodeMap.values())
    drawGraph()
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    await session.close()
  }
}

const drawGraph = () => {
  if (!graphRef.value) return

  const width = graphRef.value.clientWidth
  const height = graphRef.value.clientHeight

  // 清除之前的图形
  d3.select(graphRef.value).selectAll('*').remove()

  const svg = d3.select(graphRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 添加缩放行为
  zoom.value = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom.value)

  const g = svg.append('g')

  const simulation = d3.forceSimulation<Node>()
    .force('link', d3.forceLink<Node, Link>().id(d => d.id).distance(200))
    .force('charge', d3.forceManyBody<Node>().strength(-1000))
    .force('center', d3.forceCenter<Node>(width / 2, height / 2))
    .force('collision', d3.forceCollide<Node>().radius(50))

  const link = g.append('g')
    .selectAll('line')
    .data(links.value)
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)')

  // 添加箭头标记
  svg.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')

  // 添加高亮箭头标记
  svg.append('defs').append('marker')
    .attr('id', 'arrow-highlight')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#ffd700')

  // 添加关系类型标签
  const linkLabel = g.append('g')
    .selectAll('text')
    .data(links.value)
    .enter()
    .append('text')
    .attr('font-size', 10)
    .attr('fill', '#666')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'auto')
    .attr('dy', -6)
    .text(d => d.type)

  //节点
  const node = g.append('g')
    .selectAll('circle')
    .data(nodes.value)
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('fill', d => {
      if (d.labels.includes('CVE')) return '#ff6b6b'
      if (d.labels.includes('Software')) return '#4ecdc4'
      if (d.labels.includes('Country')) return '#e7b04f'
      return '#45b7d1'
    })
    .style('cursor', 'pointer')
    .attr('stroke', '#fff')  // 默认白色边框
    .attr('stroke-width', 2)
    .on('click', (event, d) => {
      // 重置所有节点和边的样式
      node.attr('stroke', '#fff').attr('stroke-width', 2)
      link.attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', 'url(#arrow)')
      
      // 设置选中节点的样式
      d3.select(event.currentTarget)
        .attr('stroke', '#ffd700')
        .attr('stroke-width', 3)
      
      // 找到相关的边和节点
      const connectedLinks = links.value.filter(l => 
        l.source.id === d.id || l.target.id === d.id
      )
      
      // 高亮相关边
      link.each(function(l) {
        if (connectedLinks.some(cl => 
          cl.source.id === l.source.id && cl.target.id === l.target.id
        )) {
          d3.select(this)
            .attr('stroke', '#ffd700')
            .attr('stroke-opacity', 1)
            .attr('marker-end', 'url(#arrow-highlight)')
        }
      })
      
      // 高亮相邻节点
      const connectedNodeIds = new Set(
        connectedLinks.flatMap(l => [
          l.source.id === d.id ? l.target.id : l.source.id
        ])
      )
      
      node.each(function(n) {
        if (connectedNodeIds.has(n.id)) {
          d3.select(this)
            .attr('stroke', '#fff5b8')  // 浅黄色边框
            .attr('stroke-width', 3)
        }
      })
      
      selectedNode.value = d
    })
    .call(drag(simulation))

     //展示属性名
  const label = g.append('g')
    .selectAll('text')
    .data(nodes.value)
    .enter()
    .append('text')
    .text(d => {
      if (d.labels.includes('CVE')) return d.properties.cveId
      if (d.labels.includes('Software')) return d.properties.名称
      if (d.labels.includes('Country')) return d.properties.中文名
      return d.properties.系统名称
    })
    .attr('font-size', 12)
    .attr('dx', 15)
    .attr('dy', 4)

  simulation.nodes(nodes.value).on('tick', () => {
    link
      .attr('x1', d => (d.source as any).x)
      .attr('y1', d => (d.source as any).y)
      .attr('x2', d => (d.target as any).x)
      .attr('y2', d => (d.target as any).y)

    // 更新关系标签位置和旋转角度
    linkLabel
      .attr('transform', d => {
        const sourceX = (d.source as any).x;
        const sourceY = (d.source as any).y;
        const targetX = (d.target as any).x;
        const targetY = (d.target as any).y;
        
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // 确保文字始终正向显示
        if (angle > 90 || angle < -90) {
          angle += 180;
        }
        
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        return `translate(${midX},${midY}) rotate(${angle})`;
      })

    node
      .attr('cx', d => d.x!)
      .attr('cy', d => d.y!)

    label
      .attr('x', d => d.x!)
      .attr('y', d => d.y!)
  })

  simulation.force<d3.ForceLink<Node, Link>>('link')!.links(links.value)
}

const zoomIn = () => {
  if (zoom.value) {
    d3.select(graphRef.value).select('svg')
      .transition()
      .duration(750)
      .call(zoom.value.scaleBy, 1.3)
  }
}

const zoomOut = () => {
  if (zoom.value) {
    d3.select(graphRef.value).select('svg')
      .transition()
      .duration(750)
      .call(zoom.value.scaleBy, 0.7)
  }
}

const resetZoom = () => {
  if (zoom.value) {
    d3.select(graphRef.value).select('svg')
      .transition()
      .duration(750)
      .call(zoom.value.transform, d3.zoomIdentity)
  }
}

const drag = (simulation: d3.Simulation<Node, undefined>) => {
  function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }

  return d3.drag<SVGCircleElement, Node>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', drawGraph)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawGraph)
  driver.close()
})
</script>

<style scoped>
.graph-layout {
  display: flex;
  width: 100%;
  /* height: 100%; */
  min-height: 80vh;
  gap: 16px;
}

.graph-container {
  flex: 1;
  position: relative;
  min-width: 0;
}

.graph {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 8px;
}

.node-info {
  width: 300px;
  min-width: 300px;
  height: 100%;
}

.info-card {
  height: 100%;
  overflow-y: auto;
}

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.control-btn {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background-color: #f5f5f5;
}

:deep(.v-list-item-title) {
  font-weight: bold;
  margin-bottom: 4px;
}

:deep(.v-list-item-subtitle) {
  color: rgba(0, 0, 0, 0.6);
}

:deep(.v-card-title) {
  padding: 16px;
  font-weight: 500;
}

:deep(.v-card-text) {
  padding: 16px;
}
</style>
