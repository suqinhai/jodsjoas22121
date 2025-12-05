<template>
    <!-- 运营中心-消息推送-消息列表-新增/编辑/详情 -->
    <Dialog ref="dialog" width="800" :operateActions="state.operateActions" :isShowSubmit="state.formData.status !== 1" :title="state.title" top="3vh"
        @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" class="notification-deploy" :disabled="state.formData.status === 1" :rules="state.rules" :model="state.formData"
            :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('消息类型:')" prop="type">
                <el-select v-model="state.formData.type" :placeholder="$t('请选择消息类型')" @change="state.formData.popUp = 0">
                    <el-option v-for="item in metaData.msgType" :key="item.value" :label="item.label" :value="item.value * 1" />
                </el-select>
            </el-form-item>
            <!-- <el-form-item :label="$t('发送站点:')" v-if="commonData.merchantSiteList.length > 1 && !itemData.id" prop="merchantIds">
                <MerchantSiteSelect style="width: 100%" multiple v-model="state.formData.merchantIds" @change="siteChange"></MerchantSiteSelect>
            </el-form-item> -->
            <el-form-item :label="$t('弹窗频次:')" prop="popUp">
                <el-select v-model="state.formData.popUp" :placeholder="$t('请选择')" @change="state.formData.content = ''">
                    <el-option :label="$t('不弹窗')" :value="0"></el-option>
                    <el-option :label="$t('只弹一次')" :value="1"></el-option>
                    <el-option :label="$t('每次登录')" :value="3"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('收件人:')" prop="scope" v-if="state.formData.type === 0">
                <el-select v-model="state.formData.scope" :placeholder="$t('请选择收件人')">
                    <!-- <el-option :disabled="isDisabled && !!+item.value" v-for="item in metaData.userMsgScope" :key="item.value" :label="item.label"
                        :value="item.value * 1" /> -->
                    <el-option v-for="item in metaData.userMsgScope" :key="item.value" :label="item.label" :value="item.value * 1" />
                </el-select>
            </el-form-item>
            <el-form-item v-if="state.formData.scope  === 1 && state.formData.type == 0" :label="$t('会员ID:')" prop="ranges">
                <el-input @input="(val) => state.formData.ranges = val.replace('，','')" v-model="state.formData.ranges" style="width: 100%"
                    type="textarea" :rows="4" :placeholder="$t('请输入会员ID，多个需要用英文逗号隔开，最多可输入一千个会员ID')" />
            </el-form-item>
            <el-form-item v-if="state.formData.scope  === 2 && state.formData.type == 0" :label="$t('VIP等级:')" prop="checkedGrade">
                <el-checkbox v-model="state.checkAllGrade" :indeterminate="state.isIndeterminateGrade" @change="gradeCheckAllChange">{{$t('全部')}}
                </el-checkbox>
                <el-checkbox-group v-model="state.formData.checkedGrade" @change="gradeCheckedChange">
                    <el-checkbox v-for="item in metaData.userLevel" :key="item.value" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="state.formData.scope  === 3 && state.formData.type == 0" :label="$t('自动层级:')" prop="checkedAutoLevel">
                <el-checkbox v-model="state.checkAllAuto" :indeterminate="state.isIndeterminateAuto" @change="autoCheckAllChange">{{$t('全部')}}
                </el-checkbox>
                <el-checkbox-group v-model="state.formData.checkedAutoLevel" @change="autoCheckedChange">
                    <el-checkbox v-for="item in metaData.autoLevel" :key="item.id" :label="item.id">{{ item.name }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="state.formData.scope  === 4 && state.formData.type == 0" :label="$t('固定层级:')" prop="checkedFixedLevel">
                <el-checkbox v-model="state.checkAllFixed" :indeterminate="state.isIndeterminateFixed" @change="fixedCheckAllChange">{{$t('全部')}}
                </el-checkbox>
                <el-checkbox-group v-model="state.formData.checkedFixedLevel" @change="fixedCheckedChange">
                    <el-checkbox v-for="item in metaData.fixedLevel" :key="item.id" :label="item.id">{{ item.name }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <template v-if="isShow">
                <el-form-item :label="$t('标题:')" prop="title">
                    <el-input v-model="state.formData.title" :placeholder="$t('请输入标题')" />
                </el-form-item>
                <el-form-item :label="$t('副标题:')" v-if="state.formData.type === 1 && state.formData.popUp === 0">
                    <el-input v-model="state.formData.subTitle" :placeholder="$t('请输入副标题')" />
                </el-form-item>
                <el-form-item :label="$t('显示内容:')" prop="content">
                    <Tinymce v-model="state.formData.content" :disabled="state.formData.status === 1"></Tinymce>
                    <!-- <el-input v-else v-model="state.formData.content" type="textarea" :rows="4" :placeholder="$t('请输入内容')" /> -->
                </el-form-item>
            </template>
            <template v-else>
                <el-form-item :label="$t('显示内容:')" class="item-row">
                    <div v-for="(item, index) in state.contentList" :key="index" class="notification-content-row">
                        <el-input v-model="item.text" style="width: 400px" :placeholder="$t('请输入内容')" />
                        <div style="margin: 0 10px">
                            <el-color-picker v-model="item.color" />
                        </div>
                        <el-button v-throttle type="primary" @click="handleAdd(index)" :icon="Plus"></el-button>
                        <el-button v-throttle v-if="state.contentList.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('内容预览:')">
                    <span class="text" v-for="(item, index) in state.contentList" :key="index" :style="{'color': item.color}">{{item.text}}</span>
                </el-form-item>
            </template>
            <div class="sendTypeAndTime">
                <el-form-item :label="$t('发送时间:')" prop="sendType">
                    <el-radio-group v-model="state.formData.sendType">
                        <el-radio :label="1">{{$t('立即发送')}}</el-radio>
                        <el-radio :label="0">{{$t('定时发送')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="sendTime" v-if="state.formData.sendType === 0" label-width="0px">
                    <el-date-picker v-model="state.formData.sendTime" type="datetime" style="width: 200px;margin-left:5px"
                        format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('请设置发送时间')" :disabled-date="disabledDate" />
                </el-form-item>
            </div>
            <!-- <el-form-item :label="$t('是否弹窗:')" v-if="state.formData.type === 0">
                <el-switch v-model="state.formData.popUp" :active-value="1" :inactive-value="0" />
            </el-form-item> -->

            <el-form-item :label="$t('结束时间:')" prop="endTime">
                <el-date-picker style="width: 200px;" v-model="state.formData.endTime" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('结束时间')" :disabled-date="disabledDate" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue"
import { ElMessage } from "element-plus"
import { Plus, Minus } from "@element-plus/icons-vue"
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { addOrEditMessage, postBatchMessage } from "@/api/data_center"
import { dateFormat, getTimeZoneOffset } from "@/common/util"

const timeZoneOffset = getTimeZoneOffset()
const emits = defineEmits(["close", "update"])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {};
        },
    },
    itemData: {
        type: Object,
        default: () => {
            return {};
        },
    },
})
const state = reactive({
    formData: {
        type: 0,
        popUp: 0,
        // merchantIds: []
    },
    title: $t('新增'),
    operateActions: [$t('取消'), $t('确定')],
    contentList: [
        { text: '', color: '#000' }
    ],
    rules: {
        type: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        // merchantIds: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        scope: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        sendType: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        ranges: [
            { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
            {
                pattern: /^\d+(?:,\d+)*$/,
                message: $t('请输入正确的会员ID，多个需要用英文逗号隔开！'),
                trigger: 'change',
            }
        ],
        checkedGrade: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        checkedAutoLevel: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        checkedFixedLevel: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        sendTime: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        title: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        content: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        popUp: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        endTime: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
    },
    checkAllGrade: false,
    isIndeterminateGrade: false,
    checkAllAuto: false,
    isIndeterminateAuto: false,
    checkAllFixed: false,
    isIndeterminateFixed: false,
})
const userData = userStore()
const commonData = commonStore()
const dialog = ref(null)
const deployForm = ref(null)
const disabledDate = (time) => {
    return time.getTime() < Date.now() + timeZoneOffset - 8.64e7
}

// const isDisabled = computed(() => {
//     return state.formData.merchantIds && state.formData.merchantIds.length > 1 && !props.metaData.id
// })
const isShow = computed(() => {
    return userData.getTemplateType() === 4 || (userData.getTemplateType() !== 4 && (state.formData.type === 0 || (state.formData.type === 1 && state.formData.popUp !== 0)))
})

onMounted(() => {
    if (props.itemData.id) {
        let { fixedLevel, autoLevel, userLevel } = props.metaData
        state.formData = { ...props.itemData }
        let { ranges, scope, content, type, popUp } = state.formData
        state.title = $t('修改')
        state.formData.sendTime && (state.formData.sendTime = dateFormat(state.formData.sendTime))
        state.formData.endTime && (state.formData.endTime = dateFormat(state.formData.endTime))

        if (scope === 2) {
            state.formData.checkedGrade = ranges.split(",").filter(item => userLevel.some(its => its.value === item))
            const checkedCount = state.formData.checkedGrade.length
            state.checkAllGrade = checkedCount === userLevel.length
            state.isIndeterminateGrade = checkedCount > 0 && checkedCount < userLevel.length
        } else if (scope === 3) {
            state.formData.checkedAutoLevel = ranges.split(",").map(item => +item)
            const checkedCount = state.formData.checkedAutoLevel.length
            state.checkAllAuto = checkedCount === autoLevel.length
            state.isIndeterminateAuto = checkedCount > 0 && checkedCount < autoLevel.length
        } else if (scope === 4) {
            state.formData.checkedFixedLevel = ranges.split(",").map(item => +item)
            const checkedCount = state.formData.checkedFixedLevel.length
            state.checkAllFixed = checkedCount === fixedLevel.length
            state.isIndeterminateFixed = checkedCount > 0 && checkedCount < fixedLevel.length
        }
        if (props.itemData.status === 4) {
            state.title = $t('详情');
            state.operateActions = [$t('关闭')]
        }
        if (!isShow.value) {
            state.contentList = JSON.parse(content)
        } else if (userData.getTemplateType() === 4 && type === 1 && popUp === 0) {
            let obj = JSON.parse(content)
            state.formData.content = obj.content
            state.formData.subTitle = obj.subTitle || ''
        }
    }
})

// 站点切换
// const siteChange = () => {
//     if (isDisabled.value) state.formData.scope = 0
// }

// 删除
const handleDel = (index) => {
    state.contentList.splice(index, 1)
}

// 添加一级
const handleAdd = (index) => {
    state.contentList.splice(index + 1, 0, {
        text: '',
        color: '#000',
    })
}

// VIP等级全部勾选
const gradeCheckAllChange = (val) => {
    state.formData.checkedGrade = val ? props.metaData.userLevel.map((item) => item.value) : []
    state.isIndeterminateGrade = false
}

// VIP等级勾选变化
const gradeCheckedChange = (value) => {
    const checkedCount = value.length
    state.checkAllGrade = checkedCount === props.metaData.userLevel.length
    state.isIndeterminateGrade = checkedCount > 0 && checkedCount < props.metaData.userLevel.length
}

// 自动层级全部勾选
const autoCheckAllChange = (val) => {
    state.formData.checkedAutoLevel = val ? props.metaData.autoLevel.map(item => item.id) : []
    state.isIndeterminateAuto = false
}

// 自动层级勾选变化
const autoCheckedChange = (value) => {
    const checkedCount = value.length
    state.checkAllAuto = checkedCount === props.metaData.autoLevel.length
    state.isIndeterminateAuto = checkedCount > 0 && checkedCount < props.metaData.autoLevel.length
}

// 固定层级全部勾选
const fixedCheckAllChange = (val) => {
    state.formData.checkedFixedLevel = val ? props.metaData.fixedLevel.map(item => item.id) : []
    state.isIndeterminateFixed = false
}

// 固定层级勾选变化
const fixedCheckedChange = (value) => {
    const checkedCount = value.length
    state.checkAllFixed = checkedCount === props.metaData.fixedLevel.length
    state.isIndeterminateFixed = checkedCount > 0 && checkedCount < props.metaData.fixedLevel.length
}


const handleSubmit = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            let params = { ...state.formData }
            let { id, type, popUp, scope, ranges, sendType, sendTime, endTime, checkedGrade, checkedAutoLevel, checkedFixedLevel, merchantIds, content, subTitle } = params
            if (!isShow && state.contentList.every(item => !item.text)) {
                return ElMessage.warning($t('请设置展示内容！'))
            }

            if (scope === 1 && type == 0) {
                let arr = ranges.split(',')
                if (arr.length > 1000) return ElMessage.warning($t('会员ID最多可输入一千个！'))
            }
            let nowTime = new Date(dateFormat(Date.now())).getTime()
            if (sendType === 0 && new Date(sendTime).getTime() <= nowTime) return ElMessage.warning($t('定时发送时间不能早于当前时间！'))
            if (new Date(endTime).getTime() <= nowTime) return ElMessage.warning($t('结束时间不能早于当前时间！'))
            if (sendType === 0 && new Date(sendTime).getTime() >= new Date(endTime).getTime()) return ElMessage.warning($t('结束时间不能早于发送时间！'))
            if (type === 0) {
                // if (merchantIds && merchantIds.length > 1 && !id) {
                //     delete params.ranges
                // } else {
                if (scope === 2) {
                    params.ranges = checkedGrade.join(",")
                } else if (scope === 3) {
                    params.ranges = checkedAutoLevel.join(",")
                } else if (scope === 4) {
                    params.ranges = checkedFixedLevel.join(",")
                }
                // }
            } else {
                delete params.ranges
                params.scope = 0
                if (!isShow.value) {
                    params.title = ''
                    params.content = JSON.stringify(state.contentList.filter(item => item.text))
                } else if (userData.getTemplateType() === 4 && type === 1 && popUp === 0) {
                    params.content = JSON.stringify({
                        content,
                        subTitle
                    })
                }
            }
            // if (type !== 0 || scope === 0) delete params.ranges
            // if (id) {
            //     params.merchantId = props.itemData.merchant.id
            // } else {
            //     params.merchantId = 0
            //     if (commonData.merchantSiteList.length > 1) {
            //         if (merchantIds.length === 1) {
            //             params.merchantId = merchantIds.join(',')
            //         } else {
            //             params.merchantIds = merchantIds.join(',')
            //         }
            //     } else {
            //         params.merchantId = commonData.currentMerchantSite.id
            //     }
            // }
            delete params.merchant
            delete params.checkedGrade
            delete params.checkedAutoLevel
            delete params.checkedFixedLevel
            // let api = params.merchantId ? addOrEditMessage : postBatchMessage
            dialog.value.showLoading()
            addOrEditMessage(params).then((res) => {
                emits("close")
                emits("update")
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    });
};

const cancel = () => {
    emits("close")
};
</script>

<style lang="scss">
.notification-deploy {
    .sendTypeAndTime {
        display: flex;
    }
    .notification-content-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }
}
</style>
