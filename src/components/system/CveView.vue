<template>
  <div class="cve-container">
    <v-row>
      <!-- 左侧图形区域 -->
      <v-col cols="12" md="4" class="graph-column">
        <v-card elevation="2" class="graph-card">
          <v-card-title class="text-h6 font-weight-medium">
            CVE关系图
          </v-card-title>
          <v-card-text class="graph-container">
            <CveGraph 
              v-show="selectedCveForGraph" 
              :key="selectedCveForGraph?.cveId"
              :cveId="selectedCveForGraph?.cveId || ''" 
              :timestamp="graphTimestamp"
            />
            <div v-show="!selectedCveForGraph" class="no-selection">
              <v-icon size="64" color="grey">mdi-graph</v-icon>
              <p class="text-h6 mt-4">请选择一个CVE查看关系图</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右侧CVE列表 -->
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-medium d-flex justify-space-between align-center">
            <span>CVE漏洞列表</span>
            <div class="d-flex align-center">
              <v-btn
                color="info"
                class="mr-2"
                @click="showUploadDialog"
              >
                批量上传
              </v-btn>
              <v-btn
                color="primary"
                @click="showCreateDialog"
              >
                添加CVE
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text style="padding: 0px;">
            <div class="d-flex align-center flex-wrap gap-4">
              <v-text-field
                v-model="searchCveId"
                placeholder="输入CVE ID"
                @update:model-value="handleSearch"
                clearable
                style="width: 200px;"
                density="compact"
                bg-color="#ffffff"
                hide-details
              ></v-text-field>
              <v-select
                v-model="selectedSeverity"
                :items="severityOptions"
                placeholder="漏洞等级"
                @update:model-value="handleSeverityChange"
                clearable
                style="width: 205px;"
                density="compact"
                bg-color="#ffffff"
                hide-details
              ></v-select>
              <v-select
                v-model="selectedVulnType"
                :items="vulnTypeOptions"
                placeholder="漏洞类型"
                @update:model-value="handleVulnTypeChange"
                clearable
                style="width: 350px;"
                density="compact"
                bg-color="#ffffff"
                hide-details
              ></v-select>
            </div>
          </v-card-text>

          <v-data-table
            :headers="cveHeaders"
            :items="cveList"
            :items-per-page="5"
            :loading="loading"
            class="elevation-1"
          >
            <template v-slot:item.publishTime="{ item }">
              {{ formatDateTime(item.publishTime) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="handleRowClick(item)"
              >
                查看关系
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="showCveDetails(item)"
              >
              查看详情
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="warning"
                @click="showEditDialog(item)"
              >
                编辑信息
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="info"
                @click="showBindDialog(item)"
              >
                绑定软件
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="info"
                @click="showBindSystemDialog(item)"
              >
                绑定系统
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="info"
                @click="showBindCountryDialog(item)"
              >
                绑定国家
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="error"
                @click="handleDelete(item)"
              >
                删除信息
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- CVE详情对话框 -->
    <v-dialog v-model="cveDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          {{ selectedCve?.cveId }} 详情
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-shield-alert</v-icon>
                  </template>
                  <v-list-item-title>漏洞类型</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCve?.vulnType }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-chart-line</v-icon>
                  </template>
                  <v-list-item-title>CVSS评分</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCve?.cvssScore }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-target</v-icon>
                  </template>
                  <v-list-item-title>攻击向量</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCve?.attackVector }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-alert-circle</v-icon>
                  </template>
                  <v-list-item-title>影响范围</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCve?.affectedScope }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedCve?.software">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-application</v-icon>
                  </template>
                  <v-list-item-title>已绑定软件</v-list-item-title>
                  <v-list-item-subtitle>
                    <div>名称: {{ selectedCve.software.name }}</div>
                    <div>厂商: {{ selectedCve.software.vendor }}</div>
                    <div>类型: {{ selectedCve.software.type }}</div>
                    <div>受影响版本: 
                      <v-chip
                        v-for="version in selectedCve.software.affectedVersions"
                        :key="version"
                        size="small"
                        class="ma-1"
                      >
                        {{ version }}
                      </v-chip>
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedCve?.system">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-server</v-icon>
                  </template>
                  <v-list-item-title>已绑定系统节点</v-list-item-title>
                  <v-list-item-subtitle>
                    <div>系统名称: {{ selectedCve.system.systemName }}</div>
                    <div>等级: {{ selectedCve.system.level }}</div>
                    <div>厂商: {{ selectedCve.system.vendor }}</div>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-information</v-icon>
                  </template>
                  <v-list-item-title>漏洞描述</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCve?.description }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-hammer-wrench</v-icon>
                  </template>
                  <v-list-item-title>攻击方法</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCve?.attackMethod }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-shield-check</v-icon>
                  </template>
                  <v-list-item-title>解决方案</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCve?.solution }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-link</v-icon>
                  </template>
                  <v-list-item-title>参考链接</v-list-item-title>
                  <v-list-item-subtitle>
                    <a :href="selectedCve?.referenceLink" target="_blank">{{ selectedCve?.referenceLink }}</a>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="cveDialog = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 创建CVE对话框 -->
    <v-dialog v-model="createDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          添加CVE漏洞
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="handleCreate">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newCve.cveId"
                  label="CVE ID"
                  :rules="[v => !!v || '请输入CVE ID']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newCve.vulnType"
                  label="漏洞类型"
                  :rules="[v => !!v || '请输入漏洞类型']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newCve.cvssScore"
                  label="CVSS评分"
                  type="number"
                  :rules="[v => !!v || '请输入CVSS评分']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newCve.attackVector"
                  label="攻击向量"
                  :rules="[v => !!v || '请输入攻击向量']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newCve.affectedScope"
                  label="影响范围"
                  :rules="[v => !!v || '请输入影响范围']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newCve.description"
                  label="漏洞描述"
                  :rules="[v => !!v || '请输入漏洞描述']"
                  required
                ></v-textarea>
                <v-textarea
                  v-model="newCve.attackMethod"
                  label="攻击方法"
                  :rules="[v => !!v || '请输入攻击方法']"
                  required
                ></v-textarea>
                <v-textarea
                  v-model="newCve.solution"
                  label="解决方案"
                  :rules="[v => !!v || '请输入解决方案']"
                  required
                ></v-textarea>
                <v-text-field
                  v-model="newCve.referenceLink"
                  label="参考链接"
                  :rules="[v => !!v || '请输入参考链接']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                type="submit"
                :disabled="!valid || creating"
                :loading="creating"
              >
                创建
              </v-btn>
              <v-btn
                color="grey"
                variant="text"
                @click="createDialog = false"
              >
                取消
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 编辑CVE对话框 -->
    <v-dialog v-model="editDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          编辑CVE漏洞
        </v-card-title>
        <v-card-text>
          <v-form v-model="editValid" @submit.prevent="handleEdit">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editCve.cveId"
                  label="CVE ID"
                  :rules="[v => !!v || '请输入CVE ID']"
                  required
                  readonly
                ></v-text-field>
                <v-text-field
                  v-model="editCve.vulnType"
                  label="漏洞类型"
                  :rules="[v => !!v || '请输入漏洞类型']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editCve.cvssScore"
                  label="CVSS评分"
                  type="number"
                  :rules="[v => !!v || '请输入CVSS评分']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editCve.attackVector"
                  label="攻击向量"
                  :rules="[v => !!v || '请输入攻击向量']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editCve.affectedScope"
                  label="影响范围"
                  :rules="[v => !!v || '请输入影响范围']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="editCve.description"
                  label="漏洞描述"
                  :rules="[v => !!v || '请输入漏洞描述']"
                  required
                ></v-textarea>
                <v-textarea
                  v-model="editCve.attackMethod"
                  label="攻击方法"
                  :rules="[v => !!v || '请输入攻击方法']"
                  required
                ></v-textarea>
                <v-textarea
                  v-model="editCve.solution"
                  label="解决方案"
                  :rules="[v => !!v || '请输入解决方案']"
                  required
                ></v-textarea>
                <v-text-field
                  v-model="editCve.referenceLink"
                  label="参考链接"
                  :rules="[v => !!v || '请输入参考链接']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                type="submit"
                :disabled="!editValid || editing"
                :loading="editing"
              >
                保存
              </v-btn>
              <v-btn
                color="grey"
                variant="text"
                @click="editDialog = false"
              >
                取消
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          确认删除
        </v-card-title>
        <v-card-text>
          确定要删除 {{ deleteCveId }} 吗？此操作不可恢复。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            :loading="deleting"
            @click="confirmDelete"
          >
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 绑定软件对话框 -->
    <v-dialog v-model="bindDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          绑定软件
        </v-card-title>
        <v-card-text>
          <v-row>
            <!-- 未绑定的软件列表 -->
            <v-col cols="6">
              <v-card class="pa-4" height="400">
                <v-card-title>未绑定软件</v-card-title>
                <v-list>
                  <v-list-item
                    v-for="software in unboundSoftware"
                    :key="software.id"
                    @click="moveToBound(software)"
                    class="cursor-pointer"
                  >
                    <v-list-item-title>{{ software.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ software.vendor }}</v-list-item-subtitle>
                    <template v-slot:append>
                      <v-icon>mdi-arrow-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <!-- 已绑定的软件列表 -->
            <v-col cols="6">
              <v-card class="pa-4" height="400">
                <v-card-title>已绑定软件</v-card-title>
                <v-list>
                  <v-list-item
                    v-for="software in boundSoftware"
                    :key="software.id"
                    @click="moveToUnbound(software)"
                    class="cursor-pointer"
                  >
                    <v-list-item-title>{{ software.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ software.vendor }}</v-list-item-subtitle>
                    <template v-slot:append>
                      <v-icon>mdi-arrow-left</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="bindDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="handleBindSoftware"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 绑定系统节点对话框 -->
    <v-dialog v-model="bindSystemDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          绑定系统节点
        </v-card-title>
        <v-card-text>
          <v-row>
            <!-- 未绑定的系统节点列表 -->
            <v-col cols="6">
              <v-card class="pa-4" height="400">
                <v-card-title>未绑定系统节点</v-card-title>
                <v-list>
                  <v-list-item
                    v-for="system in unboundSystems"
                    :key="system.id"
                    @click="moveToBoundSystem(system)"
                    class="cursor-pointer"
                  >
                    <v-list-item-title>{{ system.systemName }}</v-list-item-title>
                    <v-list-item-subtitle>{{ system.vendor }}</v-list-item-subtitle>
                    <template v-slot:append>
                      <v-icon>mdi-arrow-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <!-- 已绑定的系统节点列表 -->
            <v-col cols="6">
              <v-card class="pa-4" height="400">
                <v-card-title>已绑定系统节点</v-card-title>
                <v-list>
                  <v-list-item
                    v-for="system in boundSystems"
                    :key="system.id"
                    @click="moveToUnboundSystem(system)"
                    class="cursor-pointer"
                  >
                    <v-list-item-title>{{ system.systemName }}</v-list-item-title>
                    <v-list-item-subtitle>{{ system.vendor }}</v-list-item-subtitle>
                    <template v-slot:append>
                      <v-icon>mdi-arrow-left</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="bindSystemDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="handleBindSystem"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 绑定国家对话框 -->
    <v-dialog v-model="bindCountryDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          绑定国家
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedCountry"
            :items="countryList"
            item-title="nameZh"
            item-value="nameEn"
            label="选择国家"
            return-object
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="bindCountryDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="handleBindCountry"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 文件上传对话框 -->
    <v-dialog v-model="uploadDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          批量上传CVE文件
        </v-card-title>
        <v-card-text>
          <v-file-input
            v-model="uploadFiles"
            label="选择文件"
            multiple
            accept=".json"
            prepend-icon="mdi-file-upload"
            :rules="[v => !v || v.length <= 10 || '最多只能上传10个文件']"
            :loading="uploading"
            :disabled="uploading"
            show-size
            counter
            chips
            truncate-length="25"
          ></v-file-input>
          <div class="text-caption text-grey mt-2">
            支持上传JSON格式的CVE文件，最多可同时上传10个文件
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="uploadDialog = false"
            :disabled="uploading"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpload"
            :loading="uploading"
            :disabled="!uploadFiles || uploadFiles.length === 0"
          >
            上传
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getCveList, createCve, updateCve, getCveById, deleteCve, bindSoftware, bindSystem, bindCountry, getCountryList, uploadCveFiles } from '@/api/cve'
import type { CveItem, Country } from '@/api/cve'
import { useUserStore } from '@/stores/user'
import { getSoftwareList } from '@/api/software'
import type { SoftwareItem } from '@/api/software'
import { getSystemList } from '@/api/system'
import type { SystemNode } from '@/api/system'
import { useNotification } from '@kyvg/vue3-notification'
import CveGraph from '@/components/neo4j/CveGraph.vue'

const notification = useNotification()
const userStore = useUserStore()

// 选中的CVE用于显示图形
const selectedCveForGraph = ref<CveItem | null>(null)

// 添加时间戳
const graphTimestamp = ref(Date.now())

// 处理表格行点击
const handleRowClick = (item: any) => {
  console.log('选中CVE:', item.cveId)
  selectedCveForGraph.value = item as CveItem
}

// CVE漏洞数据
const cveHeaders = ref([
  { title: 'CVE ID', key: 'cveId', sortable: true },
  { title: '状态', key: 'status', sortable: true },
  { title: 'CVSS评分', key: 'cvssScore', sortable: true },
  { title: '漏洞类型', key: 'vulnType', sortable: true },
  { title: '发布时间', key: 'publishTime', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
])

// 格式化时间的函数
const formatDateTime = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const cveList = ref<CveItem[]>([])
const loading = ref(false)
const cveDialog = ref(false)
const selectedCve = ref<CveItem | null>(null)
const createDialog = ref(false)
const valid = ref(false)
const creating = ref(false)
const editDialog = ref(false)
const editValid = ref(false)
const editing = ref(false)
const deleteDialog = ref(false)
const deleteCveId = ref('')
const deleting = ref(false)

// 新CVE表单数据
const newCve = ref<CveItem>({
  cveId: '',
  status: 'PUBLISHED',
  description: '',
  cvssScore: 0,
  referenceLink: '',
  attackMethod: '',
  vulnType: '',
  affectedScope: '',
  attackVector: '',
  impact: 'C:L/I:L/A:N',
  solution: '',
  publishTime: new Date().toISOString()
})

// 编辑CVE表单数据
const editCve = ref<CveItem>({
  cveId: '',
  status: 'PUBLISHED',
  description: '',
  cvssScore: 0,
  referenceLink: '',
  attackMethod: '',
  vulnType: '',
  affectedScope: '',
  attackVector: '',
  impact: 'C:L/I:L/A:N',
  solution: '',
  publishTime: new Date().toISOString()
})

// 软件列表
const softwareList = ref<SoftwareItem[]>([])
const bindDialog = ref(false)
const selectedCveForBind = ref<CveItem | null>(null)
const selectedSoftwareIds = ref<string[]>([])

// 系统节点列表
const systemList = ref<SystemNode[]>([])
const bindSystemDialog = ref(false)
const selectedCveForSystemBind = ref<CveItem | null>(null)
const selectedSystemIds = ref<string[]>([])

// 软件绑定相关
const unboundSoftware = ref<SoftwareItem[]>([])
const boundSoftware = ref<SoftwareItem[]>([])

// 系统节点绑定相关
const unboundSystems = ref<SystemNode[]>([])
const boundSystems = ref<SystemNode[]>([])

// 国家列表
const countryList = ref<Country[]>([])
const bindCountryDialog = ref(false)
const selectedCveForCountryBind = ref<CveItem | null>(null)
const selectedCountry = ref<Country | null>(null)

// 根据CVSS评分获取颜色
const getCvssColor = (score: number) => {
  if (score >= 9.0) return 'error'
  if (score >= 7.0) return 'warning'
  if (score >= 4.0) return 'info'
  return 'success'
}

// 显示CVE详情
const showCveDetails = (cve: CveItem) => {
  selectedCve.value = cve
  cveDialog.value = true
}

// 显示创建对话框
const showCreateDialog = () => {
  createDialog.value = true
}

// 显示编辑对话框
const showEditDialog = async (cve: CveItem) => {
  try {
    loading.value = true
    const response = await getCveById(cve.cveId)
    if (response.code === 1) {
      editCve.value = { ...response.data }
      editDialog.value = true
    }
  } catch (error) {
    console.error('获取CVE详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建CVE
const handleCreate = async () => {
  if (!valid.value) return
  
  try {
    creating.value = true
    const response = await createCve(newCve.value)
    if (response.code === 1) {
      // 创建成功后刷新列表
      await fetchCveList()
      createDialog.value = false
      // 重置表单
      newCve.value = {
        cveId: '',
        status: 'PUBLISHED',
        description: '',
        cvssScore: 0,
        referenceLink: '',
        attackMethod: '',
        vulnType: '',
        affectedScope: '',
        attackVector: '',
        impact: 'C:L/I:L/A:N',
        solution: '',
        publishTime: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('创建CVE失败:', error)
  } finally {
    creating.value = false
  }
}

// 编辑CVE
const handleEdit = async () => {
  if (!editValid.value) return
  
  try {
    editing.value = true
    const response = await updateCve(editCve.value)
    if (response.code === 1) {
      // 编辑成功后刷新列表
      await fetchCveList()
      editDialog.value = false
    }
  } catch (error) {
    console.error('编辑CVE失败:', error)
  } finally {
    editing.value = false
  }
}

// 显示删除确认对话框
const handleDelete = (cve: CveItem) => {
  deleteCveId.value = cve.cveId
  deleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    deleting.value = true
    const response = await deleteCve(deleteCveId.value)
    if (response.code === 1) {
      // 删除成功后刷新列表
      await fetchCveList()
      deleteDialog.value = false
    }
  } catch (error) {
    console.error('删除CVE失败:', error)
  } finally {
    deleting.value = false
  }
}

// 获取CVE列表
const fetchCveList = async (params = {}) => {
  try {
    loading.value = true
    const response = await getCveList(params)
    cveList.value = response.data
  } catch (error) {
    console.error('获取CVE列表失败:', error)
    notification.notify({
      title: '错误',
      text: '获取CVE列表失败',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 显示绑定软件对话框
const showBindDialog = (cve: CveItem) => {
  selectedCveForBind.value = cve
  // 初始化未绑定和已绑定的软件列表
  const boundIds = cve.softwareList?.map(s => s.id) || []
  boundSoftware.value = cve.softwareList || []
  unboundSoftware.value = softwareList.value?.filter(s => !boundIds.includes(s.id)) || []
  bindDialog.value = true
}

// 计算可用的软件列表(排除已绑定的)
const availableSoftware = computed(() => {
  if (!selectedCveForBind.value) return softwareList.value || []
  const boundIds = selectedCveForBind.value.softwareList?.map(s => s.id) || []
  return (softwareList.value || []).filter(s => !boundIds.includes(s.id))
})

// 软件选择相关
const toggleSoftwareSelection = (software: SoftwareItem) => {
  const index = selectedSoftwareIds.value.indexOf(software.id)
  if (index === -1) {
    selectedSoftwareIds.value.push(software.id)
  } else {
    selectedSoftwareIds.value.splice(index, 1)
  }
}

const isSoftwareSelected = (software: SoftwareItem) => {
  return selectedSoftwareIds.value.includes(software.id)
}

// 系统节点选择相关
const toggleSystemSelection = (system: SystemNode) => {
  const index = selectedSystemIds.value.indexOf(system.id)
  if (index === -1) {
    selectedSystemIds.value.push(system.id)
  } else {
    selectedSystemIds.value.splice(index, 1)
  }
}

const isSystemSelected = (system: SystemNode) => {
  return selectedSystemIds.value.includes(system.id)
}

// 软件绑定相关
const moveToBound = (software: SoftwareItem) => {
  const index = unboundSoftware.value.findIndex(s => s.id === software.id)
  if (index !== -1) {
    unboundSoftware.value.splice(index, 1)
    boundSoftware.value.push(software)
  }
}

const moveToUnbound = (software: SoftwareItem) => {
  const index = boundSoftware.value.findIndex(s => s.id === software.id)
  if (index !== -1) {
    boundSoftware.value.splice(index, 1)
    unboundSoftware.value.push(software)
  }
}

// 系统节点绑定相关
const moveToBoundSystem = (system: SystemNode) => {
  const index = unboundSystems.value.findIndex(s => s.id === system.id)
  if (index !== -1) {
    unboundSystems.value.splice(index, 1)
    boundSystems.value.push(system)
  }
}

const moveToUnboundSystem = (system: SystemNode) => {
  const index = boundSystems.value.findIndex(s => s.id === system.id)
  if (index !== -1) {
    boundSystems.value.splice(index, 1)
    unboundSystems.value.push(system)
  }
}

// 修改绑定软件函数
const handleBindSoftware = async () => {
  if (!selectedCveForBind.value) return
  
  try {
    const softwareIds = boundSoftware.value.map(s => s.id)
    const response = await bindSoftware(selectedCveForBind.value.cveId, softwareIds)
    if (response.code === 1) {
      // 更新当前CVE的软件信息
      if (selectedCveForBind.value) {
        selectedCveForBind.value.softwareList = boundSoftware.value
      }
      // 更新列表中的CVE信息
      const index = cveList.value.findIndex(item => item.cveId === selectedCveForBind.value?.cveId)
      if (index !== -1) {
        cveList.value[index] = { ...cveList.value[index], softwareList: boundSoftware.value }
      }
      
      // 更新时间戳以触发图形重新渲染
      graphTimestamp.value = Date.now()
      
      bindDialog.value = false
      selectedCveForBind.value = null
      boundSoftware.value = []
      unboundSoftware.value = []
      
      notification.notify({
        title: '成功',
        text: '软件绑定成功',
        type: 'success'
      })
    }
  } catch (error) {
    console.error('绑定软件失败:', error)
    notification.notify({
      title: '错误',
      text: '软件绑定失败',
      type: 'error'
    })
  }
}

// 获取软件列表
const fetchSoftwareList = async () => {
  try {
    const response = await getSoftwareList()
    softwareList.value = response.data
  } catch (error) {
    console.error('获取软件列表失败:', error)
  }
}

// 显示绑定系统节点对话框
const showBindSystemDialog = (cve: CveItem) => {
  selectedCveForSystemBind.value = cve
  // 初始化未绑定和已绑定的系统节点列表
  const boundIds = cve.systemList?.map(s => s.id) || []
  boundSystems.value = cve.systemList || []
  unboundSystems.value = systemList.value?.filter(s => !boundIds.includes(s.id)) || []
  bindSystemDialog.value = true
}

// 计算可用的系统节点列表(排除已绑定的)
const availableSystems = computed(() => {
  if (!selectedCveForSystemBind.value) return systemList.value || []
  const boundIds = selectedCveForSystemBind.value.systemList?.map(s => s.id) || []
  return (systemList.value || []).filter(s => !boundIds.includes(s.id))
})

// 修改绑定系统节点函数
const handleBindSystem = async () => {
  if (!selectedCveForSystemBind.value) return
  
  try {
    const systemIds = boundSystems.value.map(s => s.id)
    const response = await bindSystem(selectedCveForSystemBind.value.cveId, systemIds)
    if (response.code === 1) {
      // 更新当前CVE的系统节点信息
      if (selectedCveForSystemBind.value) {
        selectedCveForSystemBind.value.systemList = boundSystems.value
      }
      // 更新列表中的CVE信息
      const index = cveList.value.findIndex(item => item.cveId === selectedCveForSystemBind.value?.cveId)
      if (index !== -1) {
        cveList.value[index] = { ...cveList.value[index], systemList: boundSystems.value }
      }
      
      // 更新时间戳以触发图形重新渲染
      graphTimestamp.value = Date.now()
      
      bindSystemDialog.value = false
      selectedCveForSystemBind.value = null
      boundSystems.value = []
      unboundSystems.value = []
      
      notification.notify({
        title: '成功',
        text: '系统节点绑定成功',
        type: 'success'
      })
    }
  } catch (error) {
    console.error('绑定系统节点失败:', error)
    notification.notify({
      title: '错误',
      text: '系统节点绑定失败',
      type: 'error'
    })
  }
}

// 获取系统节点列表
const fetchSystemList = async () => {
  try {
    const response = await getSystemList()
    systemList.value = response.data
  } catch (error) {
    console.error('获取系统节点列表失败:', error)
  }
}

// 显示绑定国家对话框
const showBindCountryDialog = (cve: CveItem) => {
  selectedCveForCountryBind.value = cve
  selectedCountry.value = cve.country || null
  bindCountryDialog.value = true
}

// 获取国家列表
const fetchCountryList = async () => {
  try {
    const response = await getCountryList()
    countryList.value = response.data
  } catch (error) {
    console.error('获取国家列表失败:', error)
  }
}

// 绑定国家
const handleBindCountry = async () => {
  if (!selectedCveForCountryBind.value || !selectedCountry.value) return
  
  try {
    const response = await bindCountry(selectedCveForCountryBind.value.cveId, selectedCountry.value.nameEn)
    if (response.code === 1) {
      // 更新当前CVE的国家信息
      if (selectedCveForCountryBind.value) {
        selectedCveForCountryBind.value.country = selectedCountry.value
      }
      // 更新列表中的CVE信息
      const index = cveList.value.findIndex(item => item.cveId === selectedCveForCountryBind.value?.cveId)
      if (index !== -1) {
        cveList.value[index] = { ...cveList.value[index], country: selectedCountry.value }
      }
      
      // 更新时间戳以触发图形重新渲染
      graphTimestamp.value = Date.now()
      
      bindCountryDialog.value = false
      selectedCveForCountryBind.value = null
      selectedCountry.value = null
      
      notification.notify({
        title: '成功',
        text: '国家绑定成功',
        type: 'success'
      })
    }
  } catch (error) {
    console.error('绑定国家失败:', error)
    notification.notify({
      title: '错误',
      text: '国家绑定失败',
      type: 'error'
    })
  }
}

// 漏洞等级选项
const severityOptions = [
  { title: '低危 (0-3.9)', value: 'low', min: 0, max: 3.9 },
  { title: '中危 (4.0-6.9)', value: 'medium', min: 4.0, max: 6.9 },
  { title: '高危 (7.0-8.9)', value: 'high', min: 7.0, max: 8.9 },
  { title: '严重 (9.0-10.0)', value: 'critical', min: 9.0, max: 10.0 }
]

const selectedSeverity = ref(null)

// 漏洞类型选项
const vulnTypeOptions = [
  { title: 'CWE-79：跨站脚本', value: 'CWE-79' },
  { title: 'CWE-787：越界写入', value: 'CWE-787' },
  { title: 'CWE-89：SQL注入', value: 'CWE-89' },
  { title: 'CWE-352：跨站请求伪造', value: 'CWE-352' },
  { title: 'CWE-22：路径遍历', value: 'CWE-22' },
  { title: 'CWE-125：越界读取', value: 'CWE-125' },
  { title: 'CWE-78：操作系统命令注入', value: 'CWE-78' },
  { title: 'CWE-416：释放后使用', value: 'CWE-416' },
  { title: 'CWE-862：缺少授权', value: 'CWE-862' },
  { title: 'CWE-434：无限制上传危险文件', value: 'CWE-434' },
  { title: 'CWE-94：代码注入', value: 'CWE-94' },
  { title: 'CWE-20：不正确的输入验证', value: 'CWE-20' },
  { title: 'CWE-77：命令注入', value: 'CWE-77' },
  { title: 'CWE-287：身份验证不当', value: 'CWE-287' },
  { title: 'CWE-269：权限管理不当', value: 'CWE-269' },
  { title: 'CWE-502：不受信任数据的反序列化', value: 'CWE-502' },
  { title: 'CWE-200：敏感信息暴露', value: 'CWE-200' },
  { title: 'CWE-863：授权不正确', value: 'CWE-863' },
  { title: 'CWE-918：服务器端请求伪造', value: 'CWE-918' },
  { title: 'CWE-119：内存缓冲区边界限制不当', value: 'CWE-119' },
  { title: 'CWE-476：空指针解引用', value: 'CWE-476' },
  { title: 'CWE-798：使用硬编码凭证', value: 'CWE-798' },
  { title: 'CWE-190：整数溢出或回绕', value: 'CWE-190' },
  { title: 'CWE-400：不受控制的资源消耗', value: 'CWE-400' },
  { title: 'CWE-306：缺少关键功能的身份验证', value: 'CWE-306' }
]

const selectedVulnType = ref(null)

// 在script部分添加
const searchCveId = ref('')

// 处理搜索
const handleSearch = async (value) => {
  try {
    loading.value = true
    let params = { min: 0, max: 999, type: '' }
    
    if (value) {
      params.id = value
    }
    
    // 如果同时选择了漏洞等级，添加到查询参数中
    if (selectedSeverity.value) {
      const selectedOption = severityOptions.find(option => option.value === selectedSeverity.value)
      if (selectedOption) {
        params.min = selectedOption.min
        params.max = selectedOption.max
      }
    }
    
    // 如果同时选择了漏洞类型，添加到查询参数中
    if (selectedVulnType.value) {
      params.type = selectedVulnType.value
    }
    
    const response = await getCveList(params)
    cveList.value = response.data
  } catch (error) {
    console.error('获取CVE列表失败:', error)
    notification.notify({
      title: '错误',
      text: '获取CVE列表失败',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 修改handleVulnTypeChange函数
const handleVulnTypeChange = async (value) => {
  try {
    loading.value = true
    let params = { min: 0, max: 999, type: '' }
    
    if (value) {
      params.type = value
    }
    
    // 如果同时选择了漏洞等级，添加到查询参数中
    if (selectedSeverity.value) {
      const selectedOption = severityOptions.find(option => option.value === selectedSeverity.value)
      if (selectedOption) {
        params.min = selectedOption.min
        params.max = selectedOption.max
      }
    }
    
    // 如果同时输入了CVE ID，添加到查询参数中
    if (searchCveId.value) {
      params.id = searchCveId.value
    }
    
    const response = await getCveList(params)
    cveList.value = response.data
  } catch (error) {
    console.error('获取CVE列表失败:', error)
    notification.notify({
      title: '错误',
      text: '获取CVE列表失败',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 修改handleSeverityChange函数
const handleSeverityChange = async (value) => {
  try {
    loading.value = true
    let params = { min: 0, max: 999, type: '' }
    
    if (value) {
      const selectedOption = severityOptions.find(option => option.value === value)
      if (selectedOption) {
        params.min = selectedOption.min
        params.max = selectedOption.max
      }
    }
    
    // 如果同时选择了漏洞类型，添加到查询参数中
    if (selectedVulnType.value) {
      params.type = selectedVulnType.value
    }
    
    // 如果同时输入了CVE ID，添加到查询参数中
    if (searchCveId.value) {
      params.id = searchCveId.value
    }
    
    const response = await getCveList(params)
    cveList.value = response.data
  } catch (error) {
    console.error('获取CVE列表失败:', error)
    notification.notify({
      title: '错误',
      text: '获取CVE列表失败',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 文件上传相关
const uploadDialog = ref(false)
const uploadFiles = ref<File[]>([])
const uploading = ref(false)

// 显示上传对话框
const showUploadDialog = () => {
  uploadDialog.value = true
  uploadFiles.value = []
}

// 处理文件上传
const handleUpload = async () => {
  if (!uploadFiles.value || uploadFiles.value.length === 0) return
  
  try {
    uploading.value = true
    const response = await uploadCveFiles(uploadFiles.value)
    if (response.code === 1) {
      notification.notify({
        title: '成功',
        text: '文件上传成功',
        type: 'success'
      })
      // 上传成功后刷新列表
      await fetchCveList()
      uploadDialog.value = false
      uploadFiles.value = []
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    notification.notify({
      title: '错误',
      text: '文件上传失败',
      type: 'error'
    })
  } finally {
    uploading.value = false
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  // 初始化时加载所有CVE数据
  try {
    loading.value = true
    const response = await getCveList({ min: 0, max: 999 })
    cveList.value = response.data
  } catch (error) {
    console.error('获取CVE列表失败:', error)
    notification.notify({
      title: '错误',
      text: '获取CVE列表失败',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
  
  // 获取其他列表数据
  await fetchSoftwareList()
  await fetchSystemList()
  await fetchCountryList()
})
</script>

<style scoped>
.cve-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.v-row {
  width: 100%;
  margin: 0;
  padding: 0;
}

.v-col {
  padding: 16px;
}

.graph-column {
  height: 80vh;
}

.graph-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.graph-container {
  flex: 1;
  min-height: 0;
  position: relative;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9e9e9e;
}

.v-card {
  transition: all 0.3s ease;
}

.v-list-item-subtitle {
  white-space: normal;
  word-break: break-word;
}

.cursor-pointer {
  cursor: pointer;
}

.v-list-item {
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.selected-item {
  background-color: rgba(25, 118, 210, 0.08);
}

.v-list-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style> 