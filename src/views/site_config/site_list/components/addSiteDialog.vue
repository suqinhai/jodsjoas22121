<template>
    <!-- 站点列表-新增站点 -->
    <Dialog :title="$t('新增站点')" ref="dialog" @confirm="confirmAddSite(deployFormRef)" @cancel="emits('close')">
        <el-form :model="state.formData" ref="deployFormRef" :label-width="$locale == 'zh' ? '120px' : 'auto'" :rules="state.rules">
            <el-form-item :label="$t('已有站点数量：')">{{commonData.merchantSiteList.length || 0}}</el-form-item>
            <!-- <el-form-item :label="$t('费用扣除：')">
                <span>{{$t('开版费：')}}</span>{{state.merchantInfo && state.merchantInfo.openFee}}
                <span>{{$t('线路费用：')}}</span>{{state.merchantInfo && state.merchantInfo.lineCost}}
                <span>{{$t('费用总计：')}}</span> {{state.merchantInfo && add(state.merchantInfo.lineCost, state.merchantInfo.openFee) }}
            </el-form-item> -->
            <el-form-item :label="$t('商户模板选择：')">
                <el-radio :label="1" v-model="state.formData.template">{{$t('不选择(不使用任何模版，需要重新配置)')}}</el-radio>
                <el-radio :label="2" v-model="state.formData.template">{{$t('选择站点（选择已经新增过的站点模版）')}}</el-radio>
            </el-form-item>
            <el-form-item label=" " v-if="state.formData.template === 2" prop="orgMerchantId">
                <el-select v-model="state.formData.orgMerchantId" filterable>
                    <el-option v-for="item in commonData.merchantSiteList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('经销商模式：')" v-if="isHaveMode">
                <el-switch v-model="state.formData.dealerType" :active-text="$t('开启(首充模式)')" :inactive-text="$t('关闭')" />
                <!-- <span style="margin-left:10px;">{{ state.formData.dealerType?$t('已开启'):$t('已关闭') }}</span> -->
            </el-form-item>
            <!-- <el-form-item label="" v-if="state.formData.dealerType">
                <el-radio :label="1"  v-model="state.formData.dealerMode">{{$t('损益模式')}}</el-radio>
                <el-radio :label="2"  v-model="state.formData.dealerMode">{{$t('充值模式')}}</el-radio>
                <el-radio :label="3" v-model="state.formData.dealerMode">{{$t('首充模式')}}</el-radio>
            </el-form-item> -->
            <!-- <el-form-item :label="$t('控制模式：')" prop="ctrlMode">
                <el-radio :label="0" v-model="state.formData.ctrlMode">{{$t('简易模式')}}</el-radio>
                <el-radio :label="1" v-model="state.formData.ctrlMode">{{$t('专业模式')}}</el-radio>
            </el-form-item> -->
            <el-form-item :label="$t('站点名称：')" prop="name">
                <el-input v-model="state.formData.name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('后台备注：')">
                <el-input v-model="state.formData.remark" type="textarea" :rows="4" show-word-limit maxlength="1000"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getMerchantInfo, postAddSite } from '@/api/merchant_center'
import { getCommonMeta } from '@/api/common.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { add, div, mul, toolPoint } from '@/common/util'
import userStore from '@/store/user'
import commonStore from '@/store/common'
const prop = defineProps(['currentItem'])
const emits = defineEmits(['close', 'refresh'])
const deployFormRef = ref(null)
const commonData = commonStore()
const userData = userStore()
const dialog = ref(null)

const isHaveMode = computed(() => {
    return typeof userData.siteInfo.dealerMode === 'number'
})

const chooseSiteTemplate = (rule, value, callback) => {
    if (state.formData.template === 2 && !value) {
        callback(new Error($t('请选择线路模板')))
    } else {
        callback()
    }
}

const timeZone = computed(() => {
    let timeZone = userData.merchantInfo.timeZone.split(':')[0]
    if (timeZone < 10 && timeZone > -10 && timeZone != 0) {
        timeZone = timeZone.replace('0', '')
    }
    if (timeZone.indexOf('-') > -1) {
        timeZone = timeZone.replace('-', '+')
    } else {
        timeZone = timeZone.replace('+', '-')
    }
    return 'Etc/GMT' + timeZone
})

const state = reactive({
    formData: {
        template: 1,
        orgMerchantId: '',
        dealerType: false,
        name: '',
        remark: ''
    },
    rules: {
        name: [{ required: true, message: $t('请输入站点名称'), trigger: 'blur' }],
        orgMerchantId: [{ validator: chooseSiteTemplate, trigger: 'blur' }],
    },
    siteList: [],
    dealerList: [],
    merchantInfo: ''
})

onMounted(() => {
    getCommonMeta({ types: 'dealerMode' }).then(({ data, code }) => {
        if (code === 0 && data) {
            state.dealerList = data
        }
    })
    getMerchantFee()
})

const getMerchantFee = () => {
    let merchantId = JSON.parse(localStorage.getItem('merchant_info')).id
    getMerchantInfo({ merchantId }).then(res => {
        if (res.code === 0) {
            state.merchantInfo = res.data
        }
    })
}

const daysInCurrentMonth = () => {
    // 获取当前日期和时间
    const now = new Date();

    // 获取当前日期在指定时区的年份和月份
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone.value,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
    const parts = formatter.formatToParts(now);
    const currentYear = parseInt(parts.find(part => part.type === 'year').value, 10);
    const currentMonth = parseInt(parts.find(part => part.type === 'month').value, 10);

    // 获取下个月的第0天，即为当前月份的最后一天
    const nextMonthFirstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
    nextMonthFirstDay.setUTCDate(nextMonthFirstDay.getUTCDate() - 1);

    // 获取当前月份的天数
    const daysInMonth = nextMonthFirstDay.getUTCDate();

    return daysInMonth;
}

function daysUntilNextMonthForTimezone() {
    // 获取当前日期和时间
    const now = new Date();
    // 获取当前日期在指定时区的年份、月份和日期
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone.value,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
    const parts = formatter.formatToParts(now);
    const currentYear = parseInt(parts.find(part => part.type === 'year').value, 10);
    const currentMonth = parseInt(parts.find(part => part.type === 'month').value, 10);
    const currentDate = parseInt(parts.find(part => part.type === 'day').value, 10);

    // 创建当前日期对象
    const currentDateInTimezone = new Date(Date.UTC(currentYear, currentMonth - 1, currentDate));

    // 计算下个月的年份和月份
    let nextMonth = currentMonth + 1;
    let nextMonthYear = currentYear;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextMonthYear += 1;
    }

    // 获取下个月1号的日期对象
    const nextMonthFirstDay = new Date(Date.UTC(nextMonthYear, nextMonth - 1, 1));

    // 计算两个日期之间的时间差
    const timeDifference = nextMonthFirstDay - currentDateInTimezone;

    // 将时间差转换为天数
    const daysUntilNextMonth = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysUntilNextMonth;
}


const confirmAddSite = (val) => {
    val.validate((valid) => {
        if (valid) {
            const { name, remark, orgMerchantId, dealerMode, template, dealerType } = state.formData
            let params = {
                name,
                remark,
                agentMode: 1,
            }
            if (template === 2) params.orgMerchantId = orgMerchantId
            if (dealerType) params.dealerMode = 3
            // const lineCost = (mul(div(daysUntilNextMonthForTimezone(), daysInCurrentMonth()), state.merchantInfo.lineCost)).toFixed(6)
    //         ElMessageBox.confirm(`<div style='line-height: 20px;'><div>${$t('新增站点需要预扣开版费：')}${state.merchantInfo.openFee} usdt${$t('一次性费用')}()</div>
    // <div>${$t('线路费用：')}${state.merchantInfo.lineCost} usdt</div><div>${$t('费用总计：')}${add(state.merchantInfo.lineCost, state.merchantInfo.openFee)} usdt</div>
    // <div><div style='margin-top: 10px;color: red'>${$t('注：新增站点收整月线路费用，多出的线路费在第二个月的线路费中减掉')}</div>`,
    //             $t('提示'), {
    //             dangerouslyUseHTMLString: true,
    //         }).then(res => {
    //             dialog.value.showLoading()
    //             postAddSite(params).then(() => {
    //                 commonData.getMerchantSiteData()
    //                 userData.getMerchantDetail()
    //                 emits('refresh')
    //                 emits('close')
    //             }).catch(() => {
    //                 dialog.value.closeLoading()
    //             })
    //         })
                dialog.value.showLoading()
                postAddSite(params).then(() => {
                    commonData.getMerchantSiteData()
                    userData.getMerchantDetail()
                    emits('refresh')
                    emits('close')
                }).catch(() => {
                    dialog.value.closeLoading()
                })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })


}
</script>

<style lang="scss" scoped>
.addSiteDialog {
}
</style>