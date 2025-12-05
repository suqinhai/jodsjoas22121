<template>
    <!-- 站点配置-子站点配置-复制站点 -->
    <Dialog ref="dialog" width="600" :title="$t('复制站点')" top="5vh" @confirm="handleSubmit" @cancel="cancel">
        <el-form class="copy-site" label-width="auto">
            <el-form-item :label="$t('目标站点:')">
                <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.merchantId" @getchange="getChange">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('复制类型:')">
                <el-select v-model="state.type" :clearable="false" @change="selectChange" :placeholder="$t('请选择复制类型')">
                    <el-option v-for="item in newMerchantConfigType" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column prop="id" :label="$t('站点ID')" min-width="100" align="center" />
                <el-table-column prop="name" :label="$t('站点名称')" min-width="120" align="center" />
                <el-table-column :label="$t('当前配置')" min-width="130" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" text @click="handleJump(row.id)">
                            {{ typeof state.type === 'number' ? row.configs[state.type] : 0 }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column :label="$locale == 'zh' ? '操作（单选）' : ''" min-width="120" align="center">
                    <template v-if="$locale != 'zh'" #header>
                        <div>{{$t('操作')}}</div>
                        <div>{{$t('（单选）')}}</div>
                    </template>
                    <template #default="{ row }">
                        <el-checkbox v-model="row.checked" @change="checkChange(row)" />
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { postCopySiteConfig } from '@/api/website'
import { SITE_CONFIG_KEY } from '@/common/util/appConfig'

let pathData = SITE_CONFIG_KEY.filter((item, index) => ![0, 2, 3, 10].includes(index))
const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {
                dataList: []
            }
        }
    },
    merchantConfigType: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    merchantId: '',
    type: '',
    checkedId: '',
    templateType: '',
})
const dialog = ref(null)
const router = useRouter()
const commonData = commonStore()

onMounted(() => {
    let { id, type } = props.itemData
    if (id) {
        state.merchantId = id
        state.type = type
    } else {
        state.merchantId = commonData.currentMerchantSite.id
        state.type = +props.merchantConfigType[0].value
    }
})
const newMerchantConfigType = computed(() => {
    if (state.templateType === 4) {
        return props.merchantConfigType.filter(item => item.value !== '4')
    }
    return props.merchantConfigType
})

const tableData = computed(() => {
    selectChange()
    return props.itemData.dataList.filter(item => item.id !== state.merchantId && item.configs[state.type])
})

const selectChange = () => {
    props.itemData.dataList.forEach(item => {
        item.checked = false
    })
    state.checkedId = ''
}

const checkChange = ({ id, checked }) => {
    if (checked) {
        props.itemData.dataList.forEach(item => {
            if (item.id !== id) item.checked = false
        })
        state.checkedId = id
    }
}

const handleJump = (merchantId) => {
    router.push(pathData[state.type].path + '?merchantId=' + merchantId)
}

const handleSubmit = () => {
    if (!state.checkedId) return ElMessage.warning($t('请选择目标站点和源站点再进行操作！'))
    dialog.value.showLoading()
    postCopySiteConfig({
        targetSiteId: state.merchantId,
        orgSiteId: state.checkedId,
        type: state.type,
    }).then(() => {
        cancel()
        emits('fetchData')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
const getChange = (val) => {
    state.templateType = val.templateType || ''
}
</script>

<style lang="scss">
.copy-site {
}
</style>
