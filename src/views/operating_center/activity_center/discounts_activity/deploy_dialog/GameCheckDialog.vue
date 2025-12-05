<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-闯关活动-选择游戏 -->
    <Dialog ref="dialog" width="1100" :title="$t('游戏选择') + '（'+ itemData.vendor_ + itemData.type_ +'）'" top="5vh"
        :operateActions="[$t('取消'), $t('保存')]" @confirm="handleSubmit" @cancel="emits('close')">
        <el-form :label-width="$locale == 'zh' ? '80px' : 'auto'">
            <el-form-item :label="$t('游戏搜索:')">
                <el-select v-model="state.gid" filterable clearable :placeholder="$t('请选择游戏')">
                    <el-option v-for="item in itemData.gameList" :key="item.gid" :label="item.name" :value="item.gid" />
                </el-select>
                <el-button v-if="state.gid" style="margin-left: 20px;" v-throttle type="primary" @click="handleAdd">{{$t('添加选择')}}</el-button>
            </el-form-item>
            <el-form-item :label="$t('已选游戏:')">
                <el-checkbox-group v-model="state.dataList" @change="handleCheck">
                    <el-checkbox :disabled="item.played" v-for="item in itemData.gameList" :key="item.gid" :label="item.gid">{{ item.name }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { deepClone } from "@/common/util/index"
import { ElMessage } from "element-plus"

const emits = defineEmits(['close', 'setGame'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const state = reactive({
    gid: '',
    dataList: [],
    checkedGameData: []
})

onMounted(() => {
    let { checkedGameData } = props.itemData
    if (checkedGameData) {
        state.checkedGameData = deepClone(checkedGameData)
        state.dataList = checkedGameData.map(item => item.gId)
    }
})

const handleAdd = () => {
    if (state.dataList.some(item => item === state.gid)) return ElMessage.warning($t('此游戏已选择，请勿重复操作！'))
    let obj = props.itemData.gameList.find(item => item.gid === state.gid)
    state.checkedGameData.push({ gId: obj.gid, gameName: obj.name, isNewAdd: true })
    state.dataList.push(obj.gid)
}

const handleCheck = (row) => {
    let newGid = ''
    if (row.length > state.checkedGameData.length) {
        newGid = row.find(item => state.checkedGameData.every(its => its.gId !== item))
        let obj = props.itemData.gameList.find(item => item.gid === newGid)
        state.checkedGameData.push({ gId: obj.gid, gameName: obj.name, isNewAdd: true })
    } else {
        newGid = state.checkedGameData.find(item => !row.includes(item.gId)).gId
        state.checkedGameData = state.checkedGameData.filter(item => item.gId !== newGid)
    }
}

const handleSubmit = () => {
    emits('setGame', state.checkedGameData)
    emits('close')
}
</script>

<style lang="scss">
</style>
