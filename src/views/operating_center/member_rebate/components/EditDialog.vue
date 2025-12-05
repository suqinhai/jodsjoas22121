<template>
    <!-- 会员返利-详情/修改 -->
    <Dialog ref="dialog" :width="dialogWidth" :title="state.title" top="8vh" :isShowSubmit="!itemData.dialogType"
        :operateActions="!itemData.dialogType?[$t('取消'), $t('确定')]:[$t('关闭')]" @confirm="handleSubmit" @cancel="cancel">
        <div class="rebate-deploy">
            <div class="tips" v-if="!state.playVendorList.length && !!itemData.dialogType">{{$t('暂无相关配置数据')}}</div>
            <div class="rebate-head" v-if="!itemData.dialogType">
                <el-input-number v-model="state.inputValue" style="width: 200px;margin-right: 10px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入返水设定值')" />
                <el-button v-throttle type="primary" @click="handleAdd">{{$t('增加返水设定')}}</el-button>
            </div>
            <div class="rebate-main" v-if="state.playVendorList.length">
                <div class="rebate-main-tab">
                    <div class="tab-box">
                        <div class="tab-small head">{{$t('返水设定(有效投注＞)')}}</div>
                        <div class="tab-small pointer" v-for="(item,index) in state.rebateSettingList" :key="index"
                            :class="{'tab-small--active': state.currentIndex === index}" @click="state.currentIndex = index">
                            <el-input-number v-if="state.currentIndex === index && !itemData.dialogType" v-model="item.value"
                                style="width: 110px;margin-left: 5px" :controls="false" :precision="2" :min="0" :placeholder="$t('返水设定值')" />
                            <span v-else style="margin-left: 20px">{{item.value}}</span>
                            <el-button v-throttle v-if="state.rebateSettingList.length > 1 && !itemData.dialogType" type="danger" text
                                @click.native.stop="handleDel(index)">{{$t('删除')}}</el-button>
                        </div>
                    </div>
                </div>
                <div class="rebate-main-table">
                    <div class="rebate-box" :class="{'rebate-box-beyond': state.playVendorList[state.currentIndex].playVendors.length > 4}">
                        <div class="rebate-col" :key="index" v-for="(item,index) in state.playVendorList[state.currentIndex].playVendors">
                            <div class="small-box head">{{item.label}}
                                <el-input-number :disabled="!!itemData.dialogType" v-model="item.award" style="width: 100px;margin: 0 5px"
                                    :controls="false" :precision="2" :min="0" placeholder="0.00" @blur="inputBlur(item)" />%
                            </div>
                            <template v-if="userData.getTemplateType() !== 4">
                                <div class="small-box"
                                    :class="{'small-box--special': ins + 1 === maxVendorNum && ins + 1 >= state.rebateSettingList.length}"
                                    v-for="(its,ins) in item.vendorData" :key="ins">
                                    {{its.name + item.label}}
                                    <el-input-number :disabled="!!itemData.dialogType" v-model="its.value" style="width: 100px;margin: 0 5px"
                                        :controls="false" :precision="2" :min="0" placeholder="0.00" />%
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postRebateActivityData } from '@/api/discounts_center'
import { deepClone } from '@/common/util'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    merchantVendorList: {
        type: Array,
        default: () => []
    }
})
const state = reactive({
    title: '',
    inputValue: undefined,
    currentIndex: 0,
    playVendorList: [],
    rebateSettingList: [],
})
const dialog = ref(null)
const userData = userStore()

const dialogWidth = computed(() => {
    let arrLength = props.merchantVendorList.length
    let width
    switch (arrLength) {
        case 0:
        case 1:
            width = 520
            break
        case 2:
            width = 850 - (userData.getTemplateType() !== 4 ? 0 : 120)
            break
        case 3:
            width = 1100 - (userData.getTemplateType() !== 4 ? 0 : 200)
            break
        default:
            width = 1200 - (userData.getTemplateType() !== 4 ? 0 : 100)
            break
    }
    return width
})

const maxVendorNum = computed(() => {
    if (!state.playVendorList.length) return 0
    let arr = deepClone(state.playVendorList[0].playVendors)
    arr.sort((a, b) => b.vendorData.length - a.vendorData.length)
    return arr[0].vendorData.length
})

onMounted(() => {
    let { configs = '', dialogType, level_ } = props.itemData
    state.title = level_ + (!!dialogType ? $t('详情') : $t('修改'))
    if (configs.length) {
        let arr = []
        let data, dataKey, dataValue
        configs.forEach(item => {
            item.rebateData = []
            state.rebateSettingList.push({ value: item.inCoin })
            dataKey = Object.keys(item.rates)
            dataValue = Object.values(item.rates)
            dataKey.forEach((m, index) => {
                data = m.split('-')
                item.rebateData.push({
                    vendor: data[0],
                    type: data[1],
                    value: dataValue[index]
                })
            })
            arr.push(item)
        })
        arr.forEach(item => {
            let vendorListCopy = deepClone(props.merchantVendorList)
            item.playVendors = vendorListCopy.map(its => {
                its.award = undefined
                let vendorData = item.rebateData.filter(m => +its.value === +m.type)
                if (vendorData.length) {
                    its.vendorData = its.vendorList.map((vendor, index) => {
                        let sameObj = vendorData.find(i => vendor === i.vendor)
                        if (sameObj) {
                            return {
                                type: its.value,
                                vendor: sameObj.vendor,
                                name: its.vendorName[index],
                                value: sameObj.value
                            }
                        } else {
                            return {
                                type: its.value,
                                vendor,
                                name: its.vendorName[index],
                                value: undefined
                            }
                        }
                    })
                    if (userData.getTemplateType() === 4) its.award = its.vendorData.filter(item => item.value)[0]?.value || undefined
                } else {
                    its.vendorData = its.vendorList.map((vendor, index) => {
                        return {
                            type: its.value,
                            vendor,
                            name: its.vendorName[index],
                            value: undefined
                        }
                    })
                }
                return its
            })
        })
        state.playVendorList = arr
    }
})

const handleAdd = () => {
    if (!state.inputValue) return ElMessage.warning($t('请输入返水设定值再进行增加操作！'))
    if (state.rebateSettingList.some(item => !item.value)) return ElMessage.warning($t('存在返水设定值为空的项，请先设置完再增加！'))
    if (state.rebateSettingList.some(item => item.value * 100 === state.inputValue * 100)) return ElMessage.warning($t('已存在相同的返水设定值！'))
    let vendorListCopy = deepClone(props.merchantVendorList)
    let playVendors = vendorListCopy.map(item => {
        item.vendorData = item.vendorList.map((vendor, index) => {
            return {
                type: item.value,
                vendor,
                name: item.vendorName[index],
                value: undefined
            }
        })
        return item
    })
    state.playVendorList.push({
        inCoin: state.inputValue,
        playVendors
    })
    state.rebateSettingList.push({ value: state.inputValue })
    state.currentIndex = state.rebateSettingList.length - 1
    state.inputValue = undefined
}

const inputBlur = (row) => {
    if (typeof row.award === 'number') {
        row.vendorData.forEach(item => {
            item.value = row.award
        })
    }
}

const handleDel = (index) => {
    if (state.rebateSettingList.length - 1 === state.currentIndex) state.currentIndex--
    state.playVendorList.splice(index, 1)
    state.rebateSettingList.splice(index, 1)
};

const handleSubmit = () => {
    if (!state.playVendorList.length) return ElMessage.warning($t('请至少配置一条返水设定再进行提交！'))
    if (state.rebateSettingList.some(item => !item.value)) return ElMessage.warning($t('返水设定值不能为空，请先设置再进行提交！'))
    let arr = []
    if (state.playVendorList.length) {
        state.playVendorList.forEach((item, index) => {
            item.inCoin = state.rebateSettingList[index].value
            let rates = {}
            item.playVendors.forEach(its => {
                its.vendorData.forEach(m => {
                    if (m.value !== undefined && m.value !== null) {
                        rates[m.vendor + '-' + m.type] = m.value
                    }
                })
            })
            if (Object.keys(rates).length) {
                arr.push({
                    inCoin: item.inCoin,
                    rates
                })
            }
        })
    }
    if (!arr.length) return ElMessage.warning($t('请至少配置一个厂家再进行提交！'))
    let { id, level } = props.itemData
    dialog.value.showLoading()
    postRebateActivityData({
        id,
        level,
        configs: JSON.stringify(arr)
    }).then(() => {
        // ElMessage.success($t('提交成功！'))
        cancel()
        emits('fetchData')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss" scoped>
.rebate-deploy {
    .tips {
        width: 100%;
        font-size: 16px;
        text-align: center;
    }
    .rebate-main {
        width: 100%;
        min-height: 50px;
        margin-top: 10px;
        display: flex;
        justify-content: space-between;

        &-tab {
            flex-shrink: 0;
            width: 200px;
        }

        &-table {
            flex-shrink: 0;
            // flex: 1;
            display: flex;
            justify-content: flex-end;
            width: calc(100% - 230px);
        }
        .head {
            padding: 0 10px !important;
            background-color: #cfcfcf;
            height: 40px;
            justify-content: center !important;
        }
        .rebate-box {
            display: flex;
            overflow-x: auto;
            height: fit-content;
            .rebate-col {
                flex-shrink: 0;
                border: 1px solid #ddd;

                .small-box {
                    height: 50px;
                    padding: 0 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 1px solid #ddd;

                    &--special {
                        border-bottom: 0;
                    }
                }
            }
            .rebate-col + .rebate-col {
                border-left: 0;
            }
        }
        .rebate-box-beyond {
            // margin-left: 30px;
            border: 1px solid #ddd;
            .rebate-col {
                border: 0;
            }
            .rebate-col + .rebate-col {
                border-left: 1px solid #ddd;
            }
        }
        .tab-box {
            border: 1px solid #ddd;
            .tab-small {
                height: 50px;
                padding-right: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                &--active {
                    background-color: #e9e9eb;
                }
            }
            .tab-small + .tab-small {
                border-top: 1px solid #ddd;
            }
        }
    }
}
</style>
