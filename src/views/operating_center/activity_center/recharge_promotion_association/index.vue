<template>
    <!-- 运营中心-优惠活动列表-充值促销关联列表 -->
    <div class="container-main discounts-details">
        <el-form class="filter-form" inline v-if="commonData.merchantSiteList.length > 1">
            <el-form-item :label="$t('站点:')">
                <MerchantSiteSelect :optionData="optionData" :isClassify="false" :clearable="false" v-model="state.formData.siteId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item label-width="0">
                <el-checkbox v-model="state.notJoinPromotion" :true-label="1" :false-label="0"  :label="$t('是否不参予任何促销活动选项（勾选后则前端充值页面不显示该选项）')" @change="handleNotJoinPromotion"></el-checkbox>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('说明：列表为已生效的充值活动')}}</div>
        <el-table :data="state.tableData" border>
            <el-table-column prop="condition_" :label="$t('活动条件')" min-width="120" align="center" />
            <el-table-column prop="name" :label="$t('前端标题')" min-width="160" align="center" />
            <el-table-column prop="attachConfig.summary" :label="$t('前端说明')" min-width="200" align="center" />
            <el-table-column prop="beginTime" :label="$t('生效时间')" width="160" align="center" />
        </el-table>
    </div>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import commonStore from '@/store/common'
import { promotionListApi } from "@/api/discounts_center"
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    optionData: [],
    notJoinPromotion: 0
})
const commonData = commonStore()

const optionData = computed(() => {
    return commonData.merchantSiteList.filter(item => item.custom)
})
const getHomeData = () => {
    getHomeDeploy({ part: 'scatter', type: 4, alias: 'notJoinPromotion',status: state.notJoinPromotion }).then(res => {
        let { data = {} } = res
        state.notJoinPromotion = data.notJoinPromotion || 0
    })
}
const handleNotJoinPromotion = (val) => {
    postHomeDeploy({ part: 'scatter', type: 4, alias: 'notJoinPromotion',status: state.notJoinPromotion }).then(res => {})
}
onMounted(() => {
    state.formData.siteId = optionData.value[0].id
    fetchData()
    getHomeData()
})

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    promotionListApi({ ...state.formData, status: 3, type: 1 }).then(res => {
        let { list = [] } = res.data
        state.tableData = list.map(item => {
            item.beginTime && (item.beginTime = dateFormat(item.beginTime))
            item.attachConfig && (item.attachConfig = JSON.parse(item.attachConfig))
            return item
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
.discounts-details {
}
</style>
