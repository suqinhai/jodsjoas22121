<template>
    <!-- 客服配置-其他客服-新增/编辑-代理链接选择 -->
    <Dialog ref="dialog" width="700" :title="state.title" top="5vh" @confirm="handleSubmit" @cancel="cancel">
        <div class="service-link-deploy">
            <div class="tab">
                <div class="tab-box pointer" :class="{'active':state.switchIndex === 1}" @click="handleTab(1)">
                    {{ $t('渠道链接') }}（{{state.channelSelected.length}}）</div>
                <div class="tab-box pointer" :class="{'active':state.switchIndex === 2}" @click="handleTab(2)">
                    {{ $t('代理链接') }}（{{state.agentSelected.length}}）</div>
            </div>
            <template v-if="state.switchIndex === 1">
                <div class="channel-box">
                    <el-checkbox-group v-model="state.channelSelected">
                        <el-checkbox v-for="its in state.channelList" :key="its.channelId" :label="its.channelId">{{ its.domain }}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </template>
            <template v-if="state.switchIndex === 2">
                <div class="search-box">
                    <el-input @input="(val) => state.userId = val.replace(/\D/g,'')" v-model="state.userId" style="width: 200px;margin-right: 10px"
                        :placeholder="$t('请输入代理ID')" />
                    <el-button v-throttle type="primary" @click="handleSearch">{{$t('搜 索')}}</el-button>
                </div>
                <el-checkbox-group v-model="state.agentSelected">
                    <el-checkbox v-for="its in state.userList" :key="its" :label="its">{{ its }}</el-checkbox>
                </el-checkbox-group>
            </template>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOtherLinkList } from '@/api/service'

const emits = defineEmits(['close', 'handleConfig'])
const props = defineProps({
    agentSelect: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const dialog = ref(null)
const state = reactive({
    switchIndex: 1,
    channelList: [],
    channelSelected: [],
    userId: '',
    userList: [],
    agentSelected: [],
})

onMounted(() => {
    state.channelSelected = props.agentSelect.channelData || []
    state.agentSelected = props.agentSelect.userData || []
    if (state.agentSelected.length) {
        state.userList = [...state.agentSelected]
    }
    handleSearch()
})

// 获取表格数据
const handleSearch = () => {
    if (state.switchIndex === 2 && !state.userId) return ElMessage.warning($t('请输入代理ID再进行搜索！'))
    dialog.value.showLoading()
    let obj = {
        _page: 1,
        _size: 999,
        tab: state.switchIndex
    }
    if (state.switchIndex === 2) obj.userId = state.userId
    getOtherLinkList(obj).then(res => {
        let { list = [] } = res.data
        if (state.switchIndex === 1) {
            state.channelList = list
        } else {
            if (!list.length) {
                state.userList = state.userList.filter(item => item !== state.userId)
                state.agentSelected = state.agentSelected.filter(item => item !== state.userId)
                ElMessage.warning($t('未查询到此代理ID信息！'))
            } else if (state.userList.every(item => item !== state.userId)) {
                state.userList.push(state.userId)
            }
        }
        dialog.value.closeLoading()
    }).catch(err => {
        state[state.switchIndex === 1 ? 'channelList' : 'userList'] = []
        dialog.value.closeLoading()
    })
}

const handleTab = (val) => {
    if (state.switchIndex === val) return
    state.switchIndex = val
}

const handleSubmit = () => {
    emits('handleConfig', {
        channelData: state.channelSelected,
        userData: state.agentSelected,
    })
    emits('close')
}

const cancel = () => {
    emits('close')
}

</script>

<style lang="scss">
.service-link-deploy {
    .tab {
        width: fit-content;
        // width: 360px;
        height: 36px;
        border: 1px solid #409eff;
        border-radius: 2px;
        display: flex;
        margin-bottom: 10px;

        &-box {
            flex-shrink: 0;
            padding: 0 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            color: #409eff;
        }

        .tab-box + .tab-box {
            border-left: 1px solid #409eff;
        }

        .active {
            color: #fff;
            background-color: #409eff;
        }
    }
    .search-box {
        display: flex;
        margin-bottom: 10px;
        .label {
            font-weight: bold;
            margin-right: 10px;
        }
    }
    .channel-box {
        max-height: 55vh;
        overflow-y: auto;
    }
}
</style>
