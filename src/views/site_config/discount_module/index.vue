<template>
    <!-- 优惠模块 -->
    <div class="container discount-module">
        <div class="head" style="margin: 0 0 10px">{{$t('优惠类型配置')}}</div>
        <el-table :data="state.tableData" style="width: 400px" border>
            <!-- <el-table-column prop="id" label="ID" width="100" align="center" /> -->
            <!-- <el-table-column prop="sort" :label="$t('排序')" min-width="100" align="center" /> -->
            <el-table-column prop="name" :label="$t('名称')" min-width="150" align="center" />
            <el-table-column :label="$t('显示开关')" min-width="120" align="center">
                <template #default="{ row,$index }">
                    <el-switch @click="switchChange($index)" v-model="row.status" :active-value="1" :inactive-value="0">
                    </el-switch>
                </template>
            </el-table-column>
        </el-table>
        <div class="foot" style="margin-top: 20px">{{$t('内容配置')}}<el-button v-throttle type="primary" style="margin-left: 10px" @click="router.push('/operating-center/activity-center')">{{$t('前往配置')}}</el-button>
        </div>
    </div>
</template>

<script setup name="discountModule">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'

let nameObj = {
    promotion: $t('活动'),
    incomeBox: $t('存钱宝'),
    rebate: $t('返水'),
    task: $t('任务'),
    vip: 'VIP',
    pending: $t('待办的'),
}
const state = reactive({
    tableData: [],
})
const router = useRouter()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'offerTypes' }).then(res => {
        let arr = Object.values(res.data)
        state.tableData = Object.keys(res.data).map((item, index) => {
            return {
                name: nameObj[item] || '',
                status: arr[index],
                alias: item,
                sort: index + 1
            }
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 按钮操作
const switchChange = (index) => {
    globalVBus.$emit('globalLoading', true)
    let params = {
        ...state.tableData[index],
        part: 'offerTypes',
    }
    delete params.name
    postHomeDeploy(params).then(() => {
        fetchData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.discount-module {
    .foot {
        line-height: 40px;
        font-size: 16px;
        font-weight: 600;
    }
}
</style>
