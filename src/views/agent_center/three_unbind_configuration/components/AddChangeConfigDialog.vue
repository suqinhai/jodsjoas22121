<template>
    <!-- 代理中心-三级掉绑配置-新增/修改 -->
    <Dialog ref="dialog" :width="700" :title="$t('新增')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)"
        @cancel="cancel" className="addChangeConfigDialog">
        <el-form ref="addFrom" :model="state.formData" :label-width="$locale == 'zh' ? '170px' : '250px'" :rules="state.rules">
            <el-form-item :label="$t('代理ID:')" prop="userId">
                <el-input :disabled="state.isSearch" @input="(val) => state.formData.agentUserId = val.replace(/\D/g,'')" v-model="state.formData.agentUserId"
                    style="width: 260px;margin-right: 10px" :placeholder="$t('输入代理ID，进行搜索确认代理存在')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-row v-if="state.memberInfo.id">
                <el-col :span="9">
                    <el-form-item :label="$t('代理ID:')">
                        <span style="white-space: nowrap;" :style="[$locale == 'zh' ? '' : 'margin-left: 20px;']">{{state.memberInfo.id}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="15">
                    <el-form-item :label="$t('代理账号:')">
                        <span>{{state.memberInfo.name}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('邀请几人后开始掉绑:')" prop="level" :class="$locale == 'zh' ? 'level-zh' : 'level'">
                <el-input-number v-model="state.formData.beginNum" style="width: 200px;" :placeholder="$t('请输入邀请几人后开始掉绑')" :min="0" :controls="false" :precision="0"/>
            </el-form-item>
            <el-form-item :label="$t('掉绑方式')">
                <el-radio-group v-model="state.formData.mbMode" style="width: 100%;">
                    <el-radio :label="1" >{{$t('概率')}}</el-radio>
                    <el-radio :label="2" >{{$t('固定')}}</el-radio>
                </el-radio-group>
                <el-input-number v-model="state.formData.mbValue" style="width: 200px;" :placeholder="$t('请输入')" :min="1" :controls="false" :precision="0" :max="100"/>
                <div class="tips" v-if="state.formData.mbMode == 1">{{$t('掉绑概率(百分比): 比如设置邀请10人后开始掉绑，掉绑概率50%，那么第11个玩家50%概率掉绑')}}</div>
                <div class="tips" v-if="state.formData.mbMode == 2">{{$t('固定掉绑: 每邀请几人里掉绑1人，比如邀请10人后开始掉绑，每邀请5人里掉绑1人，那么第15个玩家掉绑')}}</div>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { postEditAgentConfig, getAgentName } from '@/api/agent.js'

const addFrom = ref(null)
const dialog = ref(null)
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    isSearch: false,
    memberInfo: {},
    formData: {
        mbMode: 1,
        type: 2,
    },
    rules: {}
})

const props = defineProps({
    itemData: {
        type: Object,
        default: () => {}
    }
})

onMounted(() => {
    if (props.itemData?.agentUserId) {
        state.isSearch = true
        state.formData = {
            agentUserId: props.itemData.agentUserId,
            beginNum: props.itemData.beginNum,
            mbMode: props.itemData.mbMode,
            mbValue: props.itemData.mbValue,
            type: 2,
        }
        state.memberInfo = {
            id: props.itemData.user.id,
            name: props.itemData.user.name,
        }
    }
})

const handleSearch = () => {
    if (state.isSearch) {
        state.formData = {
            agentUserId: '',
        }
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!state.formData.agentUserId) {
            return ElMessage.warning($t('请输入代理ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getAgentName({ agentUserId: state.formData.agentUserId }).then((res) => {
            if (res.data) {
                state.memberInfo = {id:state.formData.agentUserId, name:res.data }
                state.isSearch = true
            } else {
                ElMessage.warning($t('未查询到此代理ID信息！'))
            }
            dialog.value.closeLoading()
        }).catch((data) => {
            dialog.value.closeLoading()
        })
    }
}

const confirmEdit = (el) => {
    if( !state.formData.agentUserId){
        ElMessage.warning($t('请输入代理ID'))
        return
    }
    if(!state.formData.beginNum && state.formData.beginNum !== 0){
        ElMessage.warning($t('请输入邀请几人后开始掉绑'))
        return
    }
    if(!state.formData.mbValue && state.formData.mbValue !== 0){
        ElMessage.warning($t('请完成掉绑配置'))
        return
    }
    dialog.value.showLoading()
    postEditAgentConfig({ ...state.formData}).then((res) => {
        emits('close')
        emits('refresh')
        dialog.value.closeLoading()
    }).catch((data) => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
.addChangeConfigDialog{
    .level{
        .el-form-item__label{
            line-height: 1;
            text-align: right;
        }
    }
    .tips{
        line-height: 20px;
        margin-top: 10px;
    }
}
</style>