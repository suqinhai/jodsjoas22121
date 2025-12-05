<template>
    <!-- 游戏中心-中奖排行管理-排行榜-新增-选择游戏 -->
    <Dialog width="800" :title="$t('游戏选择')" top="5vh" :operateActions="[$t('取消'), $t('保存')]" @confirm="handleSubmit" @cancel="emits('close')">
        <div class="game-select">
            <div class="head">{{$t('已选择:')}}
                <span class="special" style="margin-left: 10px">{{ state.selectData.name }}</span>
            </div>
            <el-form class="filter-form" inline>
                <el-form-item :label="$t('游戏名称:')">
                    <el-input v-model="state.gameName" :placeholder="$t('请输入游戏名称')" />
                </el-form-item>
                <el-form-item>
                    <el-button v-throttle type="primary" @click="fetchData('')">{{$t('搜 索')}}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
                </el-form-item>
            </el-form>
            <div class="game-container">
                <el-radio-group v-model="state.gameId" @change="radioChange">
                    <el-radio v-for="item in state.showData" :key="item.id" :value="item.id" :label="item.id">{{ item.name }}
                    </el-radio>
                </el-radio-group>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close', 'setGame'])
const props = defineProps({
    gameData: {
        type: Array,
        default: () => [],
    },
    selectGame: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const state = reactive({
    gameId: '',
    gameName: '',
    showData: [],
    selectData: {},
})

onMounted(() => {
    if (props.selectGame.id) {
        state.selectData = { ...props.selectGame }
        state.gameId = props.selectGame.id
    }
    state.showData = [...props.gameData]
})

const fetchData = (val = '') => {
    if (val === 'reset') {
        state.gameName = ''
        state.showData = [...props.gameData]
    } else {
        state.showData = !state.gameName ? [...props.gameData] : props.gameData.filter(item => item.name.toUpperCase().indexOf(state.gameName.toUpperCase()) > -1)
    }
}

// 勾选变化
const radioChange = (val) => {
    state.selectData = state.showData.find(item => item.id === val)
}

const handleSubmit = () => {
    if (!state.gameId) return ElMessage.warning($t('请选择一款游戏后再进行保存！'))
    emits('setGame', state.selectData)
    emits('close')
}
</script>

<style lang="scss" scoped>
.game-select {
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
