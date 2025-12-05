<template>
    <!-- 站点配置-虚拟彩金池-虚拟彩金池配置 -->
    <div class="container-main virtual-handsel-pool">
	   <div class="head">
		   <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
	   </div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="id" label="ID" min-width="100" align="center" />
            <el-table-column prop="positionText" :label="$t('展示位置')" min-width="140" align="center" />
            <el-table-column prop="urlText" :label="$t('跳转位置')" min-width="120" align="center">
                <template #default="{ row }">
                    <div v-if="row.url === '0'">{{$t('游戏中心')}}</div>
                    <div v-else>{{row.positionText}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="maxAmount" :label="$t('最大展示金额')" min-width="200" align="center" >
                <template #default="{ row }">
                    <div v-if="row.url === '0'">-</div>
                    <div v-else>{{row.maxAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="minAmount" :label="$t('最小展示金额')" min-width="200" align="center" >
                <template #default="{ row }">
                    <div v-if="row.url === '0'">-</div>
                    <div v-else>{{row.minAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('样式')" min-width="140" align="center">
                <template #default="{ row }">
                    <el-image 
                        class="imgs" 
                        :src="virtualHandselBanner" 
                        :crossorigin="null" 
                        :preview-src-list="[virtualHandselBanner]" 
                        preview-teleported
                        fit="contain" 
                        v-if="row.url === '0'"
                        :on-error="handleImageError"
                    />
                    <el-image class="imgs" :src="row.styleImage" :crossorigin="null" :preview-src-list="[row.styleImage]" preview-teleported
                        fit="contain" v-else/>
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" min-width="150" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="switchChange(row)" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
					<el-button v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                    <el-button v-throttle type="primary" text v-if="row.status !== -1" @click="handleDelete(row)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" :metaData="metaData" @getData="getData" @changeSite="changeSite"
            @close="state.showDeployDialog = false"></DeployDialog>
    </div>
</template>

<script setup name="virtualHandselPool">
import { reactive, onMounted, nextTick, defineAsyncComponent, onActivated } from "vue"
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessageBox } from 'element-plus'
import { getHomeDeploy, postHomeDeploy } from '@/api/website.js'
import { getCommonMeta, getMerchantVendorList } from "@/api/common.js"
import virtualHandselBanner from '@/assets/img/download_bar/virtual-handsel-banner.png'
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
})
let metaData = reactive({
    displayPosition: [],
    merchantVendorList: [],
    isInit: true,
})
const userData = userStore()

onMounted(async () => {
	metaData.styleList = props.metaData.styleList
    try {
        const { data } = await getCommonMeta({ types: "displayPosition" })
        metaData = Object.assign(metaData, data || {})
        const res = await getMerchantVendorList()
        metaData.merchantVendorList = res.data || []
        getData()
    } catch (error) { }
})

const changeSite = async (merchantId)=>{
	try {
	    const { data } = await getCommonMeta({ types: "displayPosition", merchantId })
	    metaData = Object.assign(metaData, data || {})
	    const res = await getMerchantVendorList({ merchantId })
	    metaData.merchantVendorList = res.data || []
	} catch (error) { }
}

const getData = () => {
    state.isInit = true
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'awardPools' }).then(res => {
        if (res.data && res.data.length) {
            state.tableData = res.data.map(item => {
                item.id = item.id ? item.id : 1
				if(!item.styleImage) item.styleImage = props.metaData.styleList.find(its => +item.style === its.value)?.styleImage || ''
                item.positionText = metaData.displayPosition.find(its => +item.position === +its.value)?.label || ''
                item.urlText = metaData.merchantVendorList.find(its => item.url === its.value)?.label || ''
                return item
            })
        } else {
            state.tableData = []
        }
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
        part: 'awardPools',
        alias: 'awardPools',
        status: 1,
        awardPool: JSON.stringify(params)
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

onActivated(() => {
    getData()
})
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
