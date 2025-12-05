<template>
    <!-- vip余额游戏限制 -->
    <div class="container vip-limiting-game">
        <el-tabs v-model="type" @tab-click="handleTabClick">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.id">
            </el-tab-pane>
        </el-tabs>
        <LimitingList v-if="type === 0" :userLevel="state.userLevel"></LimitingList>
        <ConfigList v-if="type === 1" :userLevel="state.userLevel"></ConfigList>
        <HistoryList v-if="type === 2" :userLevel="state.userLevel"></HistoryList>
    </div>
</template>

<script setup name='VipLimitingGame'>
import { reactive, onMounted, defineAsyncComponent, ref, watch } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from "element-plus";
import { dateFormat } from '@/common/util'
import { getUserGradeData } from '@/api/common'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const ConfigList = defineAsyncComponent(() => import('./components/ConfigList.vue'))
const LimitingList = defineAsyncComponent(() => import('./components/LimitingList.vue'))
const HistoryList = defineAsyncComponent(() => import('./components/HistoryList.vue'))

const userData = userStore()
const tabData = [
    { id: 0, title: $t('vip等级额度上限列表') },
    { id: 1, title: $t('vip等级额度上限配置') },
    { id: 2, title: $t('操作记录') },
]
const type = ref(0)
const state = reactive({
    userLevel: [],
})

const tableRef = ref()

watch(() => route.query.type, (newType) => {
    if (newType !== undefined) {
        const parsedType = parseInt(newType);
        state.type = parsedType;
        type.value = parsedType;
    }
})
onMounted(() => {
    const initialType = route.query.type ? parseInt(route.query.type) : 0;
    state.type = initialType;
    type.value = initialType;
    if (!route.query.type) {
        router.push({
            path: '/user-manage/vip-limiting-game',
            query: {
                type: initialType
            }
        });
    }
    getUserLevel();
})


const handleTabClick = (tab) => {
    const id = tab.paneName;
    state.type = id;
    type.value = id;
    router.push({
        path: '/user-manage/vip-limiting-game',
        query: {
            type: id
        }
    });
}

const getUserLevel = async () => {
    const res = await getUserGradeData()
    if (res.data) {
        for (let key in res.data) {
            state.userLevel.push({
                label: res.data[key],
                value: key,
            })
        }
    }
}

</script>

<style lang="scss">
.vip-limiting-game {
    .operate{
        margin-left: 20px;
    }
    .item-row {
        display: flex;
        align-items: center;
        justify-self: start;
    }
    .tips-w{
        margin-bottom: 15px;
    }
    .all-page{
        position: relative;
        color: #909399;
        font-weight: 600;
        z-index: 100;
        .active-page{
            position: absolute;
            bottom: -30px;
            left: 40px;
            color: #909399;   
            font-weight: 600;
        }
    }
}
</style>
