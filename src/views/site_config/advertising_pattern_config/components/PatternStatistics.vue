<template>
    <!-- 站点配置-广告埋点配置-埋点统计 -->
    <el-table :data="state.tableData" border>
        <el-table-column prop="merchantId" :label="$t('站点ID')" min-width="100" align="center" />
        <el-table-column prop="merchantName" :label="$t('站点名称')" min-width="120" align="center" />
        <el-table-column :label="$t('Facebook广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.facebook">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,0)">{{row.facebook}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('Google广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.google_gtag">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,4)">{{row.google_gtag}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('Tiktok广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.tiktok">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,5)">{{row.tiktok}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('Kwai广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.kuaishou">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,1)">{{row.kuaishou}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('Bigo广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.bigo">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,2)">{{row.bigo}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('Okspin广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.okspin">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,5)">{{row.okspin}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('Adjust广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.adjust">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,6)">{{row.adjust}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('MgskyAds广告')" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.mgsky_ads">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,7)">{{row.mgsky_ads}}</span>
            </template>
        </el-table-column>
        <el-table-column label="3beauties" min-width="120" align="center">
            <template #default="{ row }">
                <span v-if="!row.beauties">0</span>
                <span v-else class="special pointer" @click="handleInfo(row,8)">{{row.beauties}}</span>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { reactive, onMounted, defineEmits } from "vue"
import userStore from '@/store/user'
import { getChannelPatternStat } from '@/api/website'

const emits = defineEmits(['lookChannelData'])
const props = defineProps({
    channelPattern: {
        type: Array,
        default: () => []
    }
})
const state = reactive({
    tableData: [],
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getChannelPatternStat().then(res => {
        state.tableData = res.data
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleInfo = (row, pattern) => {
    emits('lookChannelData', { ...row, pattern })
} 
</script>

<style lang="scss">
</style>
