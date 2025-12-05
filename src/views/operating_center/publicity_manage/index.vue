<template>
    <!-- 宣传管理 -->
    <div class="container publicity-manage">
        <div class="location-box" v-if="userData.getTemplateType() === 4">
            <span class="form-label ">{{$t('大厅轮播图位置:')}}</span>
            <el-radio-group v-model="state.locationType" @change="radioChange">
                <el-radio :label="0" :value="0">{{$t('左侧')}}</el-radio>
                <el-radio :label="1" :value="1">{{$t('右侧')}}</el-radio>
            </el-radio-group>
        </div>
        <el-form class="filter-form" inline :model="state.formData">
            <!-- <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange"
                    value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    />
            </el-form-item> -->
            <el-form-item :label="$t('宣传名称:')">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入宣传名称')" />
            </el-form-item>
            <el-form-item :label="$t('宣传类型:')">
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择宣传类型')">
                    <el-option v-for="item in bannerType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.site-banner.addOrEdit'">
                <el-button v-throttle type="primary" @click="handleConfig(0)">{{$t('新 增')}}</el-button>
            </el-form-item>
            <div class="right-box" v-permiss="'merchant.site-banner.editPlayTime'">
                <el-button v-throttle type="primary" @click="state.carouselDeployShow = true">{{$t('宣传时间配置')}}</el-button>
            </div>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="sort" :label="$t('排序')" width="60" align="center" />
            <el-table-column prop="name" :label="$t('宣传名称')" min-width="140" align="center" />
            <el-table-column :label="$t('宣传类型')" min-width="180" align="center">
                <template #default="{ row }">
                    {{metaData.bannerType.find(item => row.type === +item.value)?.label || ''}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('宣传图')" width="150" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.image && userData.getTemplateType() === 5 && state.formData.type === '1'" class="imgs" :src="row.image.split(',')[1]" :preview-src-list="[row.image.split(',')[1]]" :crossorigin="null" preview-teleported
                        fit="contain"/>
                    <el-image v-if="!!row.image && userData.getTemplateType() !== 5 && state.formData.type === '1'" class="imgs" :src="row.image.split(',')[0]" :preview-src-list="[row.image.split(',')[0]]" :crossorigin="null" preview-teleported
                        fit="contain" />
                     <el-image v-if="!!row.image && state.formData.type !== '1'" class="imgs" :src="row.image.split(',')[0]" :preview-src-list="[row.image]" :crossorigin="null" preview-teleported
                        fit="contain" />
                </template>
            </el-table-column>
            <el-table-column prop="beginTime" :label="$t('开始时间')" min-width="160" align="center" />
            <el-table-column prop="endTime" :label="$t('结束时间')" min-width="160" align="center" />
            <el-table-column :label="$t('跳转类型')" min-width="120" align="center">
                <template #default="{ row }">
                    {{metaData.redirectType.find(item => row.redirect === +item.value)?.label || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="realStatus_" :label="$t('状态')" min-width="80" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="160">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-if="(row.realStatus !== 1 || [1,2,5].includes(userData.getTemplateType())) && userData.isHasPermiss('merchant.site-banner.addOrEdit')" text
                        @click="handleConfig( row.id )">{{$t('修改')}}</el-button>
                    <el-button v-throttle type="primary" text @click="handleConfig( row.id, 1)">{{$t('详情')}}</el-button>
                    <el-button v-permiss="'merchant.site-banner.addOrEdit'" v-throttle type="danger" text @click="handleDel( row.id )">{{$t('删除')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>
        <PublicityDeploy :metaData="metaData" :activityList="activityList" :itemData="state.itemData" v-if="state.publicityShow"
            @close="state.publicityShow = false" @fetchData="fetchData">
        </PublicityDeploy>
        <CarouselTimeDeploy :metaData="metaData" v-if="state.carouselDeployShow" @close="state.carouselDeployShow = false">
        </CarouselTimeDeploy>
    </div>
</template>

<script setup name='publicityManage'>
import { ref, reactive, defineAsyncComponent, onMounted, onActivated, computed } from 'vue'

import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getPublicityList, getPublicityConfig, deletePublicityConfig } from '@/api/data_center'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import { getCommonMeta, getActivityData } from '@/api/common'
import { dateFormat } from '@/common/util'
const PublicityDeploy = defineAsyncComponent(() => import('./components/PublicityDeploy.vue'))
const CarouselTimeDeploy = defineAsyncComponent(() => import('./components/CarouselTimeDeploy.vue'))

const state = reactive({
    locationType: '',
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    publicityShow: false,
    carouselDeployShow: false,
    itemData: {},
    type: '',
    isInit: true,
})
let activityList = ref([])
const route = useRoute()
const userData = userStore()
const commonData = commonStore()
let metaData = reactive({
    bannerType: [],
    redirectType: []
})

onMounted(async () => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    let res = await getCommonMeta({ types: 'redirectType,bannerType' })
    metaData = Object.assign(metaData, res.data || {})
    metaData.bannerType = metaData.bannerType.filter(item => +item.value !== 0)
    if (userData.getTemplateType() === 4) {
        metaData.bannerType = metaData.bannerType.filter(item => [1, 4, 6].includes(+item.value))
        if (userData.isCustomTemplate) {
            metaData.redirectType = metaData.redirectType.filter(item => ![3, 4, 6, 7, 11].includes(+item.value))
        }else{
            metaData.redirectType = metaData.redirectType.filter(item => ![1, 3, 4, 6, 7, 11].includes(+item.value))
        }
    }
    state.type = route.query.type || '1'
    state.formData.type = state.type
    fetchData()
    if (userData.getTemplateType() === 4) {
        // 轮播图位置
        getHomeDeploy({ part: 'bannerLocation' }).then(res => {
            state.locationType = typeof res.data.location === 'number' ? res.data.location : 1
        })
    }
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (state.type !== route.query.type) {
        state.type = route.query.type || '1'
        state.formData = {
            type: state.type
        }
        fetchData('search')
    }
})

const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                type: state.type
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    globalVBus.$emit('globalLoading', true)
    getPublicityList(params).then(res => {
        let { total, list } = res.data
        state.total = total || 0
        state.tableData = list.map(item => {
            item.beginTime && (item.beginTime = dateFormat(item.beginTime))
            item.endTime && (item.endTime = dateFormat(item.endTime))
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = async (id, type = 0) => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { data } = await getActivityData({ status: '2,3' })
        if (data && data.length) {
            activityList.value = data.map(item => {
                return {
                    promotionId: item.id,
                    promotionName: item.name,
                    promotionType: item.type,
                    rules_: item.rules,
                    remark: item.remark,
                }
            })
        } else {
            activityList.value = []
        }
        if (!id) {
            state.itemData = {}
        } else {
            let obj = await getPublicityConfig({ id })
            state.itemData = obj.data
            state.itemData.beginTime = dateFormat(state.itemData.beginTime)
            state.itemData.endTime = dateFormat(state.itemData.endTime)
            !!type && (state.itemData.realStatus = 1)
        }
        globalVBus.$emit('globalLoading', false)
        state.publicityShow = true
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }
}

const handleDel = (id) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认删除吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        showClose: true,
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deletePublicityConfig({ id }).then(res => {
            // ElMessage.success($t('操作成功！'));
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const radioChange = (val) => {
    ElMessageBox.confirm($t('确定要修改大厅轮播图位置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postHomeDeploy({
            part: 'bannerLocation',
            alias: 'bannerLocation',
            status: 1,
            bannerLocation: JSON.stringify({ location: state.locationType })
        }).then(() => {
            globalVBus.$emit('globalLoading', false)
        }).catch(() => {
            state.locationType = val === 1 ? 0 : 1
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => {
        state.locationType = val === 1 ? 0 : 1
    })
}
const bannerType = computed(() => {
    if(userData.getTemplateType() === 4){
        return metaData.bannerType.filter(its => +its.value !== 6)
    }
    return metaData.bannerType

})
</script>

<style lang="scss">
.publicity-manage {
    .location-box {
        margin-bottom: 10px;
    }
    .filter-form {
        display: flex;
        align-items: flex-start;
        .el-form-item__content {
            flex-shrink: 0;
        }
    }
    .right-box {
        flex: 1;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
