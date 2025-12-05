<template>
    <!-- 游戏中心-中奖排行管理-排行榜-新增 -->
    <div>
        <Dialog ref="dialog" :width="$locale == 'zh' ? 400 : 600" :title="$t('新增')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)"
            @cancel="cancel">
            <el-form ref="operateForm" :rules="state.rules" :model="state.formData" label-width="auto">
                <el-form-item :label="$t('会员名称:')" prop="username">
                    <el-input style="width: 100%;" v-model="state.formData.username" maxlength="16" show-word-limit :placeholder="$t('请输入会员名称')" />
                </el-form-item>
                <el-form-item :label="$t('金额:')" prop="winCoin">
                    <el-input-number style="width: 100%;" v-model="state.formData.winCoin" :controls="false" :precision="0" :min="1" :max="99999999"
                        :placeholder="$t('请输入金额')" />
                </el-form-item>
                <el-form-item :label="$t('结算时间:')" prop="endTime">
                    <el-date-picker v-model="state.formData.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => disabledDate(time)" :placeholder="$t('请选择时间')">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('游戏类型:')" prop="gameType">
                    <el-select style="width: 100%;" v-model="state.formData.gameType" :placeholder="$t('请选择游戏类型')"
                        @change="state.formData.vendor = '',state.selectGame = {}">
                        <el-option v-for="item in metaData.gameType" :key="item.value" :label="item.label" :value="+item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('厂家类型:')" prop="vendor">
                    <el-select style="width: 100%;" :disabled="!state.formData.gameType" v-model="state.formData.vendor" :placeholder="$t('请选择厂家类型')"
                        @change="state.selectGame = {}">
                        <el-option v-for="item in metaData.gameVendor" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('已选择游戏:')">
                    <span style="margin-right: 10px;">{{ state.selectGame.name }}</span>
                    <el-button :disabled="!state.formData.vendor" v-throttle type="primary" @click="handleCheckGame">
                        {{$t('选择游戏')}}</el-button>
                </el-form-item>
            </el-form>
        </Dialog>
        <GameCheck v-if="state.showDialog" :gameData="state.gameData" :selectGame="state.selectGame" @close="state.showDialog = false"
            @setGame="setGame">
        </GameCheck>
    </div>
</template>

<script setup>
import { ref, reactive, defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { merchantVendorListApi, postWinningRankingData } from '@/api/merchant_center'
import { getTimeZoneOffset } from "@/common/util/index"
import { dateFormat } from '@/common/util'
const GameCheck = defineAsyncComponent(() => import("./GameCheck.vue"))

const timeZoneOffset = getTimeZoneOffset()
const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const state = reactive({
    formData: {},
    rules: {
        username: [
            { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
            { type: 'string', min: 4, max: 16, message: $t('会员名称请输入4-16个字符！'), trigger: "change" }
        ],
        winCoin: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        endTime: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        gameType: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        vendor: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
    },
    showDialog: false,
    selectGame: {},
    gameData: []
})
const dialog = ref(null)
const operateForm = ref(null)

//禁止选中当前日期之前的时间
const disabledDate = (time) => {
    return time.getTime() < Date.now() + timeZoneOffset - 8.64e7
}

const handleCheckGame = () => {
    dialog.value.showLoading()
    merchantVendorListApi({
        types: state.formData.gameType,
        aliasList: state.formData.vendor,
        _page: 1,
        _size: 9999,
        site: 2,
    }).then((res) => {
        state.gameData = res.data?.list || []
        state.showDialog = true
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const setGame = (val) => {
    state.selectGame = { ...val }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { username, winCoin, endTime } = state.formData
            let { id, gid, alias, type } = state.selectGame
            if (new Date(endTime).getTime() <= new Date(dateFormat(Date.now())).getTime()) return ElMessage.warning($t('结算开始时间必须晚于商户当前时间！'))
            dialog.value.showLoading()
            postWinningRankingData({
                username,
                winCoin,
                endTime,
                gid,
                gameType: type,
                vendor: alias,
                localGameId: id,
            }).then(() => {
                emits('close')
                emits('fetchData')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
</style>
