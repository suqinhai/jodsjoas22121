<template>
    <!-- 游戏类型设置 -->
    <div class="container game-type-setting">
        <div class="head" style="margin: 0 0 10px">
            <div class="title">{{$t('游戏配置')}}<div class="pr pointer" style="margin: 0 10px">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.app.layout-sections')" v-model="state.game" :active-value="1"
                        :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                    <div v-permiss="'merchant.app.layout-sections'" class="small-mask pa" @click="handleSwitch"></div>
                </div>
            </div>
        </div>
        <el-table :data="state.tableData" :style="{'width': isCustomize ? '800px' : '1000px'}" border>
            <el-table-column prop="sort" :label="$t('排序')" min-width="80" align="center" />
            <el-table-column prop="i18Name" :label="$t('游戏类型')" min-width="160" align="center" />
            <template v-if="!isCustomize">
                <el-table-column :label="$t('激活图标')" min-width="120" align="center">
                    <template #default="{ row }">
                        <el-image v-if="!!row.icon" class="imgs" :src="row.icon" :crossorigin="null" :preview-src-list="[row.icon]" preview-teleported
                            fit="contain" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('未激活图标')" min-width="120" align="center">
                    <template #default="{ row }">
                        <el-image v-if="!!row.noIcon" class="imgs" :src="row.noIcon" :crossorigin="null" :preview-src-list="[row.noIcon]"
                            preview-teleported fit="contain" />
                    </template>
                </el-table-column>
            </template>
            <el-table-column :label="$t('首页显示行数')" min-width="160" align="center" prop="homepageRows" v-if="!userData.isCustomTemplate"/>
            <el-table-column :label="$t('显示开关')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="row.alias !== 'hot' && switchChange(row)" :disabled="row.alias === 'hot'" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.app.layout-sections'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <GameTypeDeploy v-if="state.deployShow" :itemData="state.itemData" @fetchData="getData" @close="state.deployShow = false">
        </GameTypeDeploy>
    </div>
</template>

<script setup name="gameTypeSetting">
import { reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
const GameTypeDeploy = defineAsyncComponent(() => import('./components/GameTypeDeploy.vue'))

const state = reactive({
    game: 0,
    tableData: [],
    itemData: {},
    deployShow: false,
})
const userData = userStore()

const isCustomize = computed(() => {
    return userData.getTemplateType() === 4
})

onMounted(() => {
    getData()
    getHomeData()
})

// 获取游戏类型配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'gameTypes', type: 'home' }).then(res => {
        let { data } = res
        state.tableData = data || []
        if (isCustomize.value) {
            let filKey = userData.getTemplateColor() === 3003 ? ['recent'] : ['recent', 'favorites']
            state.tableData = state.tableData.filter(item => !filKey.includes(item.alias))
        }
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取首页配置数据
const getHomeData = () => {
    getHomeDeploy({ part: 'sections', type: 'home' }).then(res => {
        let { data = {} } = res
        state.game = data.game || 0
    })
}

const handleSwitch = () => {
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        type: 'home',
        part: 'sections',
        alias: 'game',
        status: state.game ? 0 : 1
    }).then(() => {
        getHomeData()
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const switchChange = (row) => {
    let params = { ...row }
    params.part = 'gameTypes'
    params.type = 'home'
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy(params).then(() => {
        getData()
    }).catch(() => {
        row.status = !row.status ? 1 : 0
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (row) => {
    state.itemData = { ...row }
    state.deployShow = true
}

</script>

<style lang="scss">
.game-type-setting {
    .head {
        display: flex;
        justify-content: space-between;
        width: 1000px;
        margin-top: 20px;
        padding-right: 20px;
        .title {
            display: flex;
            align-items: center;
            line-height: 40px;
            font-size: 16px;
            font-weight: 600;
        }
    }

    .el-button {
        margin-left: 10px;
    }

    .small-mask {
        left: 0;
        top: 0;
        opacity: 0;
        width: 100%;
        height: 100%;
    }
}
</style>
