<template>
  <div class="software-container">
    <v-card elevation="2">
      <v-card-title class="text-h6 font-weight-medium d-flex justify-space-between align-center">
        软件信息列表
        <v-btn
          color="primary"
          @click="showCreateDialog"
        >
          添加软件
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="softwareHeaders"
        :items="softwareList"
        :items-per-page="5"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.affectedVersions="{ item }">
          <v-chip
            v-for="version in item.affectedVersions"
            :key="version"
            size="small"
            class="ma-1"
          >
            {{ version }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            size="small"
            variant="text"
            color="primary"
            @click="showSoftwareDetails(item)"
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

    <!-- 软件详情对话框 -->
    <v-dialog v-model="softwareDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          {{ selectedSoftware?.name }} 详情
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-application</v-icon>
                  </template>
                  <v-list-item-title>软件名称</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSoftware?.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-factory</v-icon>
                  </template>
                  <v-list-item-title>厂商</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSoftware?.vendor }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title>类型</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSoftware?.type }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-alert-circle</v-icon>
                  </template>
                  <v-list-item-title>受影响版本</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      v-for="version in selectedSoftware?.affectedVersions"
                      :key="version"
                      size="small"
                      class="ma-1"
                    >
                      {{ version }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="softwareDialog = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 创建软件对话框 -->
    <v-dialog v-model="createDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          添加软件信息
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="handleCreate">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newSoftware.name"
                  label="软件名称"
                  :rules="[v => !!v || '请输入软件名称']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newSoftware.vendor"
                  label="厂商"
                  :rules="[v => !!v || '请输入厂商']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newSoftware.type"
                  label="类型"
                  :rules="[v => !!v || '请输入类型']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="newSoftware.affectedVersions"
                  label="受影响版本"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || '请至少输入一个版本']"
                  required
                ></v-combobox>
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

    <!-- 编辑软件对话框 -->
    <v-dialog v-model="editDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          编辑软件信息
        </v-card-title>
        <v-card-text>
          <v-form v-model="editValid" @submit.prevent="handleEdit">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editSoftware.name"
                  label="软件名称"
                  :rules="[v => !!v || '请输入软件名称']"
                  required
                  readonly
                ></v-text-field>
                <v-text-field
                  v-model="editSoftware.vendor"
                  label="厂商"
                  :rules="[v => !!v || '请输入厂商']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editSoftware.type"
                  label="类型"
                  :rules="[v => !!v || '请输入类型']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="editSoftware.affectedVersions"
                  label="受影响版本"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || '请至少输入一个版本']"
                  required
                ></v-combobox>
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
          确定要删除 {{ deleteSoftwareName }} 吗？此操作不可恢复。
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
import { getSoftwareList, createSoftware, updateSoftware, deleteSoftware, getSoftwareByName } from '@/api/software'
import type { SoftwareItem } from '@/api/software'

// 软件信息数据
const softwareHeaders = ref([
  { title: '软件名称', key: 'name', sortable: true },
  { title: '厂商', key: 'vendor', sortable: true },
  { title: '类型', key: 'type', sortable: true },
  { title: '受影响版本', key: 'affectedVersions', sortable: false },
  { title: '操作', key: 'actions', sortable: false },
])

const softwareList = ref<SoftwareItem[]>([])
const loading = ref(false)
const softwareDialog = ref(false)
const selectedSoftware = ref<SoftwareItem | null>(null)
const createDialog = ref(false)
const valid = ref(false)
const creating = ref(false)
const editDialog = ref(false)
const editValid = ref(false)
const editing = ref(false)
const deleteDialog = ref(false)
const deleteSoftwareName = ref('')
const deleting = ref(false)

// 新软件表单数据
const newSoftware = ref<SoftwareItem>({
  name: '',
  vendor: '',
  type: '',
  affectedVersions: []
})

// 编辑软件表单数据
const editSoftware = ref<SoftwareItem>({
  name: '',
  vendor: '',
  type: '',
  affectedVersions: []
})

// 显示软件详情
const showSoftwareDetails = (software: SoftwareItem) => {
  selectedSoftware.value = software
  softwareDialog.value = true
}

// 显示创建对话框
const showCreateDialog = () => {
  createDialog.value = true
}

// 显示编辑对话框
const showEditDialog = async (software: SoftwareItem) => {
  try {
    loading.value = true
    const response = await getSoftwareByName(software.name)
    if (response.code === 1) {
      editSoftware.value = { ...response.data }
      editDialog.value = true
    }
  } catch (error) {
    console.error('获取软件详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建软件
const handleCreate = async () => {
  if (!valid.value) return
  
  try {
    creating.value = true
    const response = await createSoftware(newSoftware.value)
    if (response.code === 1) {
      // 创建成功后刷新列表
      await fetchSoftwareList()
      createDialog.value = false
      // 重置表单
      newSoftware.value = {
        name: '',
        vendor: '',
        type: '',
        affectedVersions: []
      }
    }
  } catch (error) {
    console.error('创建软件失败:', error)
  } finally {
    creating.value = false
  }
}

// 编辑软件
const handleEdit = async () => {
  if (!editValid.value) return
  
  try {
    editing.value = true
    const response = await updateSoftware(editSoftware.value)
    if (response.code === 1) {
      // 编辑成功后刷新列表
      await fetchSoftwareList()
      editDialog.value = false
    }
  } catch (error) {
    console.error('编辑软件失败:', error)
  } finally {
    editing.value = false
  }
}

// 显示删除确认对话框
const handleDelete = (software: SoftwareItem) => {
  deleteSoftwareName.value = software.name
  deleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    deleting.value = true
    const response = await deleteSoftware(deleteSoftwareName.value)
    if (response.code === 1) {
      // 删除成功后刷新列表
      await fetchSoftwareList()
      deleteDialog.value = false
    }
  } catch (error) {
    console.error('删除软件失败:', error)
  } finally {
    deleting.value = false
  }
}

// 获取软件列表
const fetchSoftwareList = async () => {
  try {
    loading.value = true
    const response = await getSoftwareList()
    softwareList.value = response.data
  } catch (error) {
    console.error('获取软件列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSoftwareList()
})
</script>

<style scoped>
.software-container {
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