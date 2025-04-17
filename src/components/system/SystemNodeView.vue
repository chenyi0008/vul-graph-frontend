<template>
  <div class="system-container">
    <v-card elevation="2">
      <v-card-title class="text-h6 font-weight-medium d-flex justify-space-between align-center">
        系统节点列表
        <v-btn
          color="primary"
          @click="showCreateDialog"
        >
          添加系统节点
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="systemHeaders"
        :items="systemList"
        :items-per-page="5"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn
            size="small"
            variant="text"
            color="primary"
            @click="showSystemDetails(item)"
          >
            详情
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            color="warning"
            @click="showEditDialog(item)"
          >
            编辑
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            color="error"
            @click="handleDelete(item)"
          >
            删除
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- 系统节点详情对话框 -->
    <v-dialog v-model="systemDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          {{ selectedSystem?.systemName }} 详情
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-application</v-icon>
                  </template>
                  <v-list-item-title>系统名称</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSystem?.systemName }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-shield-star</v-icon>
                  </template>
                  <v-list-item-title>等级</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSystem?.level }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-factory</v-icon>
                  </template>
                  <v-list-item-title>厂商</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSystem?.vendor }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="systemDialog = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 创建系统节点对话框 -->
    <v-dialog v-model="createDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          添加系统节点
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="handleCreate">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newSystem.systemName"
                  label="系统名称"
                  :rules="[v => !!v || '请输入系统名称']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newSystem.level"
                  label="等级"
                  :rules="[v => !!v || '请输入等级']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newSystem.vendor"
                  label="厂商"
                  :rules="[v => !!v || '请输入厂商']"
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

    <!-- 编辑系统节点对话框 -->
    <v-dialog v-model="editDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          编辑系统节点
        </v-card-title>
        <v-card-text>
          <v-form v-model="editValid" @submit.prevent="handleEdit">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editSystem.systemName"
                  label="系统名称"
                  :rules="[v => !!v || '请输入系统名称']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editSystem.level"
                  label="等级"
                  :rules="[v => !!v || '请输入等级']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editSystem.vendor"
                  label="厂商"
                  :rules="[v => !!v || '请输入厂商']"
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
          确定要删除 {{ deleteSystemName }} 吗？此操作不可恢复。
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSystemList, createSystem, updateSystem, deleteSystem } from '@/api/system'
import type { SystemNode } from '@/api/system'

// 系统节点数据
const systemHeaders = ref([
  { title: '系统名称', key: 'systemName', sortable: true },
  { title: '等级', key: 'level', sortable: true },
  { title: '厂商', key: 'vendor', sortable: true },
  { title: '操作', key: 'actions', sortable: false },
])

const systemList = ref<SystemNode[]>([])
const loading = ref(false)
const systemDialog = ref(false)
const selectedSystem = ref<SystemNode | null>(null)
const createDialog = ref(false)
const valid = ref(false)
const creating = ref(false)
const editDialog = ref(false)
const editValid = ref(false)
const editing = ref(false)
const deleteDialog = ref(false)
const deleteSystemName = ref('')
const deleting = ref(false)
const deleteSystemId = ref('')

// 新系统节点表单数据
const newSystem = ref<SystemNode>({
  id: null,
  systemName: '',
  level: '',
  vendor: ''
})

// 编辑系统节点表单数据
const editSystem = ref<SystemNode>({
  id: null,
  systemName: '',
  level: '',
  vendor: ''
})

// 显示系统节点详情
const showSystemDetails = (system: SystemNode) => {
  selectedSystem.value = system
  systemDialog.value = true
}

// 显示创建对话框
const showCreateDialog = () => {
  createDialog.value = true
}

// 显示编辑对话框
const showEditDialog = (system: SystemNode) => {
  editSystem.value = { ...system }
  editDialog.value = true
}

// 创建系统节点
const handleCreate = async () => {
  if (!valid.value) return
  
  try {
    creating.value = true
    const response = await createSystem(newSystem.value)
    if (response.code === 1) {
      // 创建成功后刷新列表
      await fetchSystemList()
      createDialog.value = false
      // 重置表单
      newSystem.value = {
        id: null,
        systemName: '',
        level: '',
        vendor: ''
      }
    }
  } catch (error) {
    console.error('创建系统节点失败:', error)
  } finally {
    creating.value = false
  }
}

// 编辑系统节点
const handleEdit = async () => {
  if (!editValid.value) return
  
  try {
    editing.value = true
    const response = await updateSystem(editSystem.value)
    if (response.code === 1) {
      // 编辑成功后刷新列表
      await fetchSystemList()
      editDialog.value = false
    }
  } catch (error) {
    console.error('编辑系统节点失败:', error)
  } finally {
    editing.value = false
  }
}

// 显示删除确认对话框
const handleDelete = (system: SystemNode) => {
  deleteSystemName.value = system.systemName
  deleteSystemId.value = system.id || ''
  deleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    deleting.value = true
    const response = await deleteSystem(deleteSystemId.value)
    if (response.code === 1) {
      // 删除成功后刷新列表
      await fetchSystemList()
      deleteDialog.value = false
    }
  } catch (error) {
    console.error('删除系统节点失败:', error)
  } finally {
    deleting.value = false
  }
}

// 获取系统节点列表
const fetchSystemList = async () => {
  try {
    loading.value = true
    const response = await getSystemList()
    systemList.value = response.data
  } catch (error) {
    console.error('获取系统节点列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSystemList()
})
</script>

<style scoped>
.system-container {
  max-width: 1200px;
  margin: 0 auto;
}

.v-card {
  transition: all 0.3s ease;
}

.v-list-item-subtitle {
  white-space: normal;
  word-break: break-word;
}
</style> 