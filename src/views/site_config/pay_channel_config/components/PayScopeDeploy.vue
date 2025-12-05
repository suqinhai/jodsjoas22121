<template>
    <!-- 站点配置-支付通道配置-支付方式配置（线下） -->
    <Dialog ref="dialog" width="600" :title="$t('支付方式配置')" buttonCenter top="10vh" @cancel="emits('close')" @confirm="handleSubmit">
        <div class="pay-scope-deploy">
            <el-table style="width: 400px" :data="state.tableData" border :disabled="false">
                <el-table-column :label="$t('支付方式名称')" align="center">
                    <template #default="{ row }">
                        <span v-if="row.isOld">{{row.label}}</span>
                        <el-input v-else style="width: 100%" @input="(val) => row.label = val.replace(/[\u4E00-\u9FFF]/g,'')" v-model="row.label"
                            :maxlength="40" show-word-limit :placeholder="$t('输入支付方式名称')" />
                    </template>
                </el-table-column>
            </el-table>
            <div class="operate-box">
                <el-button v-throttle v-if="isCanDel && state.tableData.length > 0" type="danger" @click="handleDel" :icon="Minus">
                </el-button>
                <el-button v-throttle type="primary" @click="handleAdd" :icon="Plus"></el-button>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus } from "@element-plus/icons-vue"
import userStore from '@/store/user'
import { postMetaData } from '@/api/common'
import { deepClone } from '@/common/util'

const emits = defineEmits(['close', 'getData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    tableData: [],
    isDisabled: true
})
const dialog = ref(null)
const userData = userStore()

const isCanDel = computed(() => {
    return state.tableData.some(item => !item.isOld)
})

onMounted(() => {
    resetData()
})


const resetData = () => {
    if (props.itemData.value) {
        state.tableData = sortBySortKey(props.itemData.value).map(item => {
            return {
                label: item.label,
                isOld: true,
                sort: item.sort,
            }
        })
    }
    state.isDisabled = true
}

const sortBySortKey =(data)=> {
  const arr = typeof data === 'string' ? JSON.parse(data) : data;
  const sorted = arr.sort((a, b) => a.sort - b.sort);
  return sorted;
}

const handleAdd = () => {
    state.tableData.push({ label: '' })
}

const handleDel = () => {
    state.tableData.pop()
}

function hasDuplicateLabel(data) {
  const arr = typeof data === 'string' ? JSON.parse(data) : data;
  const labels = arr.map(item => item.label);
  const uniqueLabels = new Set(labels);
  return uniqueLabels.size !== labels.length;
}

const handleSubmit = () => {
    let arr = state.tableData.filter(item => item.label)
    if (!arr.length) return ElMessage.warning($t('请至少配置一种支付方式再进行提交！'))
    if(hasDuplicateLabel(arr)){
        return ElMessage.warning($t('支付方式名称不能重复'))
    }
    ElMessageBox.confirm($t('提交后只可增加不可修改，确认要提交吗？'), $t('提示'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        let params = deepClone(props.itemData)
        params.value = JSON.stringify(arr.map((item,index) => {
            return {
                label:item.label,
                required: true,
                value: item.value || index,
                sort: item.sort || index
            }
        }))
        params.merchantId = userData.userInfo.groupId
        dialog.value.showLoading()
        postMetaData(params).then(res => {
            emits('close')
            emits('getData')
        }).catch(err => {
            dialog.value.closeLoading()
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
.pay-scope-deploy {
    display: flex;
    align-items: flex-end;

    .operate-box {
        margin-left: 15px;
    }
}
</style>
