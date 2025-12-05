<template>
    <!-- 热门管理 -->
    <div class="container game-hot-manage">
        <el-form class="filter-form" inline :model="state.fromData">
            <el-form-item :label="$t('厂家别名:')">
                <el-select class="select-box" v-model="state.fromData.alias" :placeholder="$t('请选择厂家')" clearable>
                    <el-option v-for="item in venderList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('游戏类型:')">
                <el-select class="select-box" v-model="state.fromData.type" :placeholder="$t('请选择游戏类型')" clearable>
                    <el-option v-for="item in gameTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('游戏名称:')">
                <el-input v-model="state.fromData.name" :placeholder="$t('请输入游戏名称')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('排序')" width="150" align="center">
                <template #default="{row}">
                    <span v-if="!row.isEdit">{{row.hotSort}}</span>
                    <el-input-number v-else style="width: 100%" v-model="row.hotSort" :controls="false" :precision="0" :min="0"
                        :placeholder="$t('请输入大于0的整数')" />
                </template>
            </el-table-column>
            <el-table-column prop="hotType_" :label="$t('热门类型')" min-width="120" align="center" />
            <el-table-column prop="alias_" :label="$t('游戏厂家')" min-width="120" align="center" />
            <el-table-column prop="type_" :label="$t('游戏类型')" min-width="120" align="center" />
            <el-table-column prop="name" :label="$t('游戏名称')" min-width="120" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="160" align="center">
                <template #default="{ row }">
                    <el-button v-if="!row.isEdit && userData.isHasPermiss('merchant.merchant-game.hotEdit')" v-throttle type="primary" text
                        @click="row.isEdit = true,row.initSort = item.hotSort">{{$t('修改排序')}}</el-button>
                    <el-button v-if="row.isEdit" v-throttle type="primary" text @click="row.isEdit = false,row.hotSort = item.initSort">{{$t('取消')}}
                    </el-button>
                    <el-button v-if="row.isEdit" v-throttle type="primary" text @click="handleOperate(row,0)">{{$t('保存')}}</el-button>
                    <el-button v-permiss="'merchant.merchant-game.hotEdit'" v-throttle type="danger" text @click="handleOperate(row,1)">{{$t('移除')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup name="gameHotManage">
import { reactive, onMounted } from "vue"
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user';
import { getHotGameList, postHotGameData } from "@/api/merchant_center.js"
import { getCommonMeta } from '@/api/common.js'

const state = reactive({
    fromData: {},
    tableData: [],
});
const venderList = reactive([]);
const gameTypeList = reactive([]);
const userData = userStore()

onMounted(() => {
    getCommonMeta({ types: 'gameType,gameVendor' }).then(({ data, code }) => {
        if (code === 0 && data) {
            gameTypeList.push(...data.gameType)
            venderList.push(...data.gameVendor)
        }
    })
    fetchData()
})

const fetchData = (val = '') => {
    if (val === 'reset') state.fromData = {}
    globalVBus.$emit('globalLoading', true)
    getHotGameList(state.fromData).then((res) => {
        if (res.code === 0) {
            state.tableData = res.data.map(item => {
                item.isEdit = false
                item.initSort = item.hotSort
                return item
            })
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 移除/编辑排序
const handleOperate = ({ id, hotType, hotSort, initSort }, type) => {
    if (type) {
        ElMessageBox.confirm($t('确定要将此游戏从热门移除吗？'), $t('提示'), {
            confirmButtonText: $t('确 定'),
            cancelButtonText: $t('取消'),
            type: 'warning',
        }).then(() => {
            postData({
                id,
                hotType,
                hot: 0,
                sort: initSort || 0
            })
        }).catch(() => { })
    } else {
        postData({
            id,
            hotType,
            hot: 1,
            sort: hotSort || 0
        })
    }
}

const postData = (params) => {
    globalVBus.$emit('globalLoading', true)
    postHotGameData(params).then(res => {
        fetchData()
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.game-hot-manage {
}
</style>
