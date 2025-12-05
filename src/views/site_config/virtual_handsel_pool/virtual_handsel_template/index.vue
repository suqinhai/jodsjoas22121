<template>
    <!-- 站点配置-虚拟彩金池-虚拟彩金池模板管理 -->
    <div class="container-main virtual-handsel-pool">
        <div class="head">
            <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
        </div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="id" label="ID" min-width="100" align="center" />
            <el-table-column prop="styleName" :label="$t('样式名字')" min-width="140" align="center" />
            <el-table-column :label="$t('样式素材')" min-width="140" align="center">
                <template #default="{ row }">
                    <el-image class="imgs" :src="row.styleImage" :crossorigin="null" :preview-src-list="[row.styleImage]" preview-teleported
                        fit="contain" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" min-width="150" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="row.isDefault" v-model="row.status" :active-value="1" :inactive-value="0" @change="switchChange(row)" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
					<el-button v-throttle type="primary" text v-if="!row.isDefault" @click="handleConfig(row)">{{$t('修改')}}</el-button>
					<el-button v-throttle type="primary" text v-if="!row.isDefault" @click="handleDelete(row)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" @getData="getData"
            @close="state.showDeployDialog = false"></DeployDialog>
    </div>
</template>

<script setup name="virtualHandselPool">
import { reactive, onMounted, defineAsyncComponent, nextTick } from "vue"
import userStore from '@/store/user'
import { ElMessageBox } from 'element-plus'
import commonStore from '@/store/common'
import { getHomeDeploy, postHomeDeploy } from '@/api/website.js'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))


const commonData = commonStore()
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})

const state = reactive({
    tableData: [],
    itemData: {},
    showDeployDialog: false,
	isInit: true
})

onMounted(() => {
    getData()
})

const getData = () => {
	state.isInit = true
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'awardTemplate' }).then(res => {
		res.data?.forEach((item)=>{
			if(!item.styleImage) item.styleImage = props.metaData.styleList.find(its => +item.id === its.value)?.styleImage || ''
		})
        state.tableData = res.data || []
		nextTick(() => {
		    state.isInit = false
		})
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleDelete = (val) => {
    ElMessageBox.confirm($t('确定要删除此配置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        let obj = { ...val }
        obj.status = 2
        globalVBus.$emit('globalLoading', true)
        postConfigData(obj)
    }).catch(() => { })
}

const switchChange = (row) => {
	if (state.isInit) return
    postConfigData(row)
}

const postConfigData = (params) => {
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        part: 'awardTemplate',
        alias: 'awardTemplate',
        status: 1,
        awardTemplate: JSON.stringify(params)
    }).then(res => {
        getData()
    }).catch(err => {
        if (params.status !== 2) params.status = !params.status ? 1 : 0
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showDeployDialog = true

} 
</script>

<style lang="scss" scoped>
.virtual-handsel-pool {
    .head {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
        margin-bottom: 10px;
    }
}
</style>
