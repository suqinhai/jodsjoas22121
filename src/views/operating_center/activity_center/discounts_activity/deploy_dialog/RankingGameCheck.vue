<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-排行榜活动-选择游戏 -->
    <Dialog ref="dialog" width="1200" :title="title" top="5vh" :operateActions="[$t('取消'), $t('保存')]" @confirm="handleSubmit"
        @cancel="emits('close')">
        <div class="ranking-game-deploy">
            <div class="head">{{$t('已选择数量:')}}
                <span class="special" style="margin-left: 10px">{{ state.checkedData.length }}</span>
            </div>
            <div v-if="state.type === 'gameType'">
                <el-checkbox v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate" @change="handleAll">
                    {{$t('全部')}}</el-checkbox>
                <el-checkbox-group v-model="state.checkedData" @change="handleCheck">
                    <el-checkbox :disabled="item.isDisabled" v-for="item in provideData.metaData.gameType" :key="item.value" :label="+item.value">
                        {{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </div>
            <div v-if="state.type === 'vendor'">
                <el-checkbox v-if="state.tableData.length" v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate" @change="handleAll">
                    {{$t('全部')}}</el-checkbox>
                <el-checkbox-group v-model="state.checkedData" @change="handleCheck">
                    <el-checkbox :disabled="item.isDisabled" v-for="item in state.tableData" :key="item.value" :label="item.value">
                        {{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </div>
            <div v-if="state.type === 'game'">
                <el-form class="filter-form" inline :model="state.formData">
                    <el-form-item :label="$t('游戏类型:')">
                        <el-select style="width: 150px" v-model="state.formData.type" :placeholder="$t('请选择游戏类型')" clearable>
                            <el-option v-for="item in itemData.gameTypeList" :key="item.type" :label="item.name" :value="item.type" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('游戏厂家:')">
                        <el-select style="width: 150px" v-model="state.formData.alias" :placeholder="$t('请选择游戏厂家')" clearable>
                            <el-option v-for="item in itemData.vendorList" :key="item.type" :label="getVendorName(item.type)" :value="item.type" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('游戏名称:')">
                        <el-input v-model="state.formData.name" :placeholder="$t('请输入游戏名称')" />
                    </el-form-item>
                    <el-form-item>
                        <el-button v-throttle type="primary" @click="fetchData('')">{{$t('搜 索')}}</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
                    </el-form-item>
                </el-form>
                <el-checkbox v-if="state.showData.length" v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate" @change="handleAll">
                    {{$t('全部')}}</el-checkbox>
                <div class="game-container">
                    <el-checkbox-group v-model="state.checkedData" @change="handleCheck">
                        <el-checkbox :disabled="item.isDisabled" v-for="item in state.showData" :key="item.id" :label="item.id">{{ item.name }}
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'

const keyData = {
    gameType: 'gameType',
    vendor: 'gameVendor',
}
const emits = defineEmits(['close', 'setGameData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const state = reactive({
    type: '',
    formData: {},
    tableData: [],
    showData: [],
    checkedData: [],
    isCheckedAll: true,
    isIndeterminate: true,
    isCanCancel: true
})
const provideData = inject('provideData')
const dialog = ref(null)

const title = computed(() => {
    if (state.type === 'gameType') return $t('游戏类型(可多选)')
    if (state.type === 'vendor') return $t('游戏厂家(可多选)')
    if (state.type === 'game') return $t('指定游戏(可多选)')
})
const metaList = computed(() => {
    let arr = state.type === 'gameType' ? provideData.metaData.gameType : state.type === 'game' ? state.showData : state.tableData
    arr.forEach(item => {
        item.isDisabled = props.itemData.dataList.some(its => its.isDisabled && (state.type !== 'game' ? its.type == item.value : its.id === item.id))
    })
    return arr
})
const currentListCheckNum = computed(() => {
    if (state.type !== 'game') return state.checkedData.filter(item => metaList.value.some(its => its.value == item)).length
    if (state.type === 'game') return state.checkedData.filter(item => metaList.value.some(its => its.id === item)).length
})

onMounted(() => {
    let { dataList, tableData, type, gameTypeList, vendorList } = props.itemData
    state.type = type
    state.tableData = tableData
    if (state.type !== 'game') {
        state.checkedData = dataList.map(item => item.type)
    } else {
        state.checkedData = dataList.map(item => item.id)
        if (gameTypeList.length) state.formData.type = gameTypeList[0].type
        if (vendorList.length) state.formData.alias = vendorList[0].type
        fetchData('')
    }
    state.isCheckedAll = currentListCheckNum.value === metaList.value.length
    state.isIndeterminate =
        currentListCheckNum.value > 0 && currentListCheckNum.value < metaList.value.length
})

const fetchData = (val = '') => {
    if (val === 'reset' || !Object.values(state.formData).length) {
        state.formData = {}
        state.showData = [...state.tableData]
    } else {
        let { type, alias, name } = state.formData
        state.showData = state.tableData.filter(item => ((type && type === item?.type) || !type)
            && ((alias && alias === item?.alias) || !alias) && ((name && item?.name.toUpperCase().indexOf(name.toUpperCase()) > -1) || !name))
    }
    state.showData.forEach(item => {
        if (props.itemData.dataList.some(its => its.id === item && its.isDisabled)) {
            item.isDisabled = true
        }
    })
    state.isCheckedAll = currentListCheckNum.value === metaList.value.length
    state.isIndeterminate =
        currentListCheckNum.value > 0 && currentListCheckNum.value < metaList.value.length
}

// 获取厂家名称
const getVendorName = (val) => {
    return provideData.metaData.gameVendor.find(item => item.value === val)?.label || ''
}

// 选择所有
const handleAll = (val) => {
    if (state.type === 'game') {
        if (val) {
            state.showData.forEach(item => {
                if (!state.checkedData.includes(item.id)) state.checkedData.push(item.id)
            })
        } else {
            state.checkedData = state.checkedData.filter(item => {
                if (metaList.value.find(its => its.id === item)) {
                    return props.itemData.dataList.some(its => its.id === item && its.isDisabled)
                } else {
                    return true
                }
            })
        }
    } else {
        state.checkedData = val ? metaList.value.map(item => (state.type === 'vendor' ? item.value : +item.value)) :
            state.checkedData.filter(item => {
                if (metaList.value.find(its => its.value == item)) {
                    return props.itemData.dataList.some(its => its.type === item && its.isDisabled)
                } else {
                    return true
                }
            })
    }
    state.isIndeterminate = val ? false : state.checkedData.some(item => props.itemData.dataList.some(its => (state.type === 'game' ? its.id === item : its.type === item) && its.isDisabled))
}

// 勾选变化
const handleCheck = (val) => {
    const checkedCount = state.type === 'game' ? currentListCheckNum.value : val.length
    state.isCheckedAll = checkedCount === metaList.value.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < metaList.value.length
}

const handleSubmit = () => {
    let arr = []
    if (state.type !== 'game') {
        arr = state.checkedData.map(item => {
            let obj = {
                type: item,
                isDisabled: props.itemData.dataList.some(its => its.isDisabled && its.type === item),
            }
            if (state.type === 'gameType') obj.name = metaList.value.find(its => item === +its.value).label
            return obj
        })
    } else {
        if (state.checkedData.length > 1000) return ElMessage.warning($t('指定游戏最多选择1000款！'))
        state.tableData.forEach(item => {
            if (state.checkedData.includes(item.id)) {
                arr.push({
                    id: item.id,
                    type: item.type,
                    typeName: item.type_,
                    alias: item.alias,
                    vendorName: item.alias_,
                    gId: item.gid,
                    name: item.name,
                    isDisabled: item.isDisabled
                })
            }
        })
    }
    emits('setGameData', arr)
    emits('close')
}
</script>

<style lang="scss">
.ranking-game-deploy {
    .head {
        margin-bottom: 10px;
    }

    .filter-form {
        .el-form-item {
            margin-bottom: 10px;
        }
    }

    .game-container {
        max-height: 68vh;
        overflow-y: auto;
    }
}
</style>
