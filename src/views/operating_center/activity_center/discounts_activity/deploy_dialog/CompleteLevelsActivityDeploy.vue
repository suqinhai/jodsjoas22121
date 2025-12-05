<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-闯关活动 -->
    <div>
        <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
            class="activity-deploy complete-levels" :label-width="$locale == 'zh' ? '105px' : 'auto'">
            <el-form-item :label="$t('活动名称:')" prop="name">
                <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
            </el-form-item>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('活动排序:')">
                        <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                            :placeholder="$t('填0或者不填默认排最前面')" />
                    </el-form-item>
                </el-col>
                <el-col :span="10">
                    <el-form-item :label="$t('首页弹框:')">
                        <el-select v-model="state.formData.attachConfig.homePop" :placeholder="$t('请选择弹框方式')" style="width: 200px">
                            <el-option :label="$t('不弹窗')" :value="0" />
                            <el-option :label="$t('每次都弹')" :value="1" />
                            <el-option :label="$t('只弹一次')" :value="2" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('活动时间:')" class="time-box">
                <el-form-item prop="beginTime" label-width="0">
                    <el-date-picker :disabled="isDisabled" v-model="state.formData.beginTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                    </el-date-picker>
                </el-form-item>
                <span class="stance">{{$t('至')}}</span>
                <el-form-item prop="endTime" label-width="0">
                    <el-date-picker v-model="state.formData.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')" :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                    </el-date-picker>
                </el-form-item>
            </el-form-item>
            <el-form-item :label="$t('展示时间:')" class="time-box">
                <el-form-item prop="showBeginTime" label-width="0">
                    <el-date-picker v-model="state.formData.showBeginTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                    </el-date-picker>
                </el-form-item>
                <span class="stance">{{$t('至')}}</span>
                <el-form-item prop="showEndTime" label-width="0">
                    <el-date-picker v-model="state.formData.showEndTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')" :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                    </el-date-picker>
                </el-form-item>
            </el-form-item>
            <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
                <el-checkbox-group v-model="state.formData.attachConfig.tags">
                    <el-checkbox v-for="item in provideData.tagList()" :key="item" :value="item.value" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('闯关配置:')" class="gLevels-box">
                <div v-for="(item, index) in state.formData.rules_" :key="index" class="gLevels-small">
                    <div class="gLevels-small-deploy gLevels-small-deploy-special gLevels-small-deploy-other"
                        :style="{'width': $locale !== 'zh' ? '950px' : '800px'}">
                        <span>{{$t('邀请人数')}}</span>
                        <el-form-item :prop="'rules_.' + index + '.invitedNum'"
                            :rules="[{ required: true, message: $t('请输入邀请人数！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :disabled="isDisabled" v-model="item.invitedNum" :controls="false" :precision="0" :min="1"
                                :placeholder="$t('邀请人数')" />
                        </el-form-item>
                        <span>{{$t('，邀请奖励金额')}}</span>
                        <el-form-item :prop="'rules_.' + index + '.rewardInvited'"
                            :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number v-model="item.rewardInvited" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                :placeholder="$t('奖励金额')" />
                        </el-form-item>
                        <span>{{$t('，闯关总打码')}}</span>
                        <el-form-item :prop="'rules_.' + index + '.reachPlay'" :rules="[{ required: true, message: $t('请输入打码金额！'), trigger: 'blur' }]"
                            label-width="0">
                            <el-input-number v-model="item.reachPlay" :controls="false" :precision="0" :min="0" :max="999999999999999"
                                :placeholder="$t('打码金额')" />
                        </el-form-item>
                        <span>{{$t('，闯关额外奖金')}}</span>
                        <el-form-item :prop="'rules_.' + index + '.rewardPlay'"
                            :rules="[{ required: true, message: $t('请输入额外奖金！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :style="$locale === 'vi' ? 'margin-top: 10px;' : ''" v-model="item.rewardPlay" :controls="false"
                                :precision="2" :min="0" :max="999999999999999" :placeholder="$t('额外奖金')" />
                        </el-form-item>
                        <div class="gLevels-small-deploy-ticket">
                            <span class="label">{{ $t('奖励票券') }}</span>
                            <el-select style="width: 120px" v-model="item.ticketType" :placeholder="$t('票券类型')" @change="item.ticketId = ''">
                                <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                            </el-select>
                            <el-select style="width: 180px" filterable clearable v-model="item.ticketId" :placeholder="$t('请选择票券')">
                                <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(item)" :key="ims.id" :label="ims.name"
                                    :value="ims.id">
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                    <div class="operate" v-if="!isDisabled">
                        <el-button v-throttle v-if="state.formData.rules_.length < 101" type="primary" @click="handleAdd(index)" :icon="Plus">
                        </el-button>
                        <el-button v-throttle v-if="state.formData.rules_.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                        </el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item :label="$t('游戏平台:')">{{$t('游戏已选择')}}
                <span class="special" style="margin: 0 5px">{{state.playGameList.length}}</span>{{$t('个（根据选择先后排序）')}}
                <div class="game-box" style="margin-bottom: 10px;" v-if="state.playGameList.length">
                    <span class="game-box-small special pr" v-for="(item,index) in state.playGameList" :key="index">[{{item.vendor_ + item.type_}}]
                        <span>{{item.gameName}}</span>
                        <span v-if="deployData.operationType !== 2 && !item.played" class="game-box-icon pointer pa" @click="deleteGame(item,index)">
                            <el-icon :size="18">
                                <CircleCloseFilled />
                            </el-icon>
                        </span>
                    </span>
                </div>
                <div class="gameVendor_row">
                    <el-tabs type="border-card" v-model="state.tabItem">
                        <el-tab-pane v-for="(item,index) in state.formData.playGameConfig" :key="item.type" :name="item.type"
                            :label="getCheckGameNum(item)">
                            <el-table border :data="item.games">
                                <el-table-column :label="$t('厂家')" min-width="100" align="center">
                                    <template #default="{ row,$index }">
                                        {{row.vendor_}}<el-button :disabled="deployData.operationType === 2" style="margin-left: 10px;" v-throttle
                                            type="primary" text @click="handleCheckGame(row,$index,index)">{{$t('选择游戏')}}</el-button>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="$t('已选择游戏')" min-width="400" align="left">
                                    <template #default="{ row }">
                                        <div class="game-box">
                                            <span class="game-box-small" v-for="(its,ims) in row.checkedGameData" :key="ims">{{ its.gameName }}</span>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-form-item>
            <el-form-item :label="$t('更新时间:')">{{$t('0点（达到时间后将更换下一个游戏）')}}</el-form-item>
            <el-form-item :label="$t('邀请人数限制:')">
                <el-checkbox-group v-model="state.formData.limitType">
                    <el-checkbox :label="1">{{$t('同IP人数不可计入统计')}}</el-checkbox>
                    <el-checkbox :label="2">{{$t('绑定手机号码')}}</el-checkbox>
                </el-checkbox-group>
                <div class="item-row">
                    <span>{{$t('达到充值金额')}}</span>
                    <el-input-number style="width: 120px;margin: 0 3px" v-model="state.formData.limitRgAmount" :min="0" :max="999999999999999"
                        :precision="0" :controls="false" :placeholder="$t('充值金额')" />
                    <span>{{$t('，达到打码金额')}}</span>
                    <el-input-number style="width: 120px;margin: 0 3px" v-model="state.formData.limitBetAmount" :min="0" :max="999999999999999"
                        :precision="0" :controls="false" :placeholder="$t('打码金额')" />
                </div>
            </el-form-item>
            <el-form-item :label="$t('奖励稽核限制:')">
                <div class="item-row">
                    <span>{{$t('邀请奖励稽核倍数')}}</span>
                    <el-input-number v-model="state.formData.invitedAuditMultiple" :controls="false" :precision="0" :min="0" :max="100"
                        :placeholder="$t('稽核倍数')" />
                    <span>{{$t('，闯关奖励稽核倍数')}}</span>
                    <el-input-number v-model="state.formData.successAuditMultiple" :controls="false" :precision="0" :min="0" :max="100"
                        :placeholder="$t('稽核倍数')" />
                </div>
            </el-form-item>
            <!-- <el-form-item :label="$t('宣传图:')" prop="image">
                <UploadImage v-model="state.formData.image" :size="2048" :width="710" :height="320" :disabled="deployData.operationType === 2"
                    :tip="$t('请上传710*320或等比例，PNG/JPG/GIF格式小于2048KB的图片')">
                </UploadImage>
            </el-form-item> -->
            <el-form-item :label="$t('宣传图:')" prop="image">
            <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                    :size="state.limit.size"
                    :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
        </el-form-item>
            <el-form-item :label="$t('规则说明:')" prop="remark">
                <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '1000px'">
                </Tinymce>
            </el-form-item>
            <el-form-item :label="$t('会员等级:')" prop="levelList" v-if="provideData.isShowLevels">
                <el-checkbox v-model="state.formData.isCheckedAllLevel" :indeterminate="state.formData.isIndeterminateLevel"
                    @change="(val) => checkChange(val,'levelList',1)">{{$t('全部等级')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.levelList" @change="(val) => checkChange(val,'isCheckedAllLevel',0)">
                    <el-checkbox v-for="item in provideData.metaData.userLevel" :key="item" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('稽核平台:')">
                <el-radio-group :disabled="isDisabled" v-model="state.formData.auditVendor">
                    <el-radio :label="1">{{$t('全部平台')}}</el-radio>
                    <el-radio :label="2">{{$t('指定平台')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item class="gameVendor_row" label=" " v-if="state.formData.auditVendor == 2">
                <el-tabs type="border-card">
                    <el-tab-pane v-for="item in state.formData.auditVendorList" :key="item.type"
                        :label="item.label+`(${item.playVendors.length}/${item.vendorList.length})`">
                        <div style="width: 100%">
                            <el-checkbox :disabled="isDisabled" v-model="item.checkAll" :indeterminate="item.isIndeterminate"
                                @change="provideData.checkAllVendor(item)">{{$t('全平台')}}</el-checkbox>
                        </div>
                        <el-checkbox-group :disabled="isDisabled" v-model="item.playVendors" @change="provideData.handleCheckVendor(item)">
                            <el-checkbox v-for="(its,ims) in item.vendorName" :key="ims" :label="item.vendorList[ims]">
                                {{ its }}</el-checkbox>
                        </el-checkbox-group>
                    </el-tab-pane>
                </el-tabs>
            </el-form-item>
        </el-form>
        <GameCheckDialog v-if="state.showGameCheck" :itemData="state.itemData" @close="state.showGameCheck = false" @setGame="setGame">
        </GameCheckDialog>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, inject, defineAsyncComponent, computed } from "vue"
import { Plus, Minus, CircleCloseFilled } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { merchantVendorListApi, merchantValidListApi } from "@/api/merchant_center.js"
import { deepClone, mul, add } from "@/common/util/index"
const GameCheckDialog = defineAsyncComponent(() => import("./GameCheckDialog.vue"))
import userStore from '@/store/user'
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const userData = userStore()
const props = defineProps({
    deployData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
    disabledDate: {
        type: Function,
        default: () => { },
    },
})

const state = reactive({
    oldImage: [],
    limit: {
        width: 710,
        height: 320,
        size: 2048
    },
    tabItem: '',
    formData: {
        limitType: [],
        auditVendor: 1,
        attachConfig: {
            homePop: 0,
        },
        rules_: [
            { invitedNum: 1, rewardInvited: undefined, reachPlay: undefined, rewardPlay: undefined, ticketType: 0, ticketId: '' },
        ],
    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: 'change' }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: 'change' }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: 'change' }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: 'change' }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: 'change' }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
    },
    playGameList: [],
    showGameCheck: false,
    currentIndex: 0,
    tabIndex: 0,
    itemData: {},
})
const formRef = ref(null)
const provideData = inject('provideData')
const isPPTemplate = computed(() => {
    return userData.getTemplateType() === 5
})
onMounted(() => {
    if(isPPTemplate.value) {
        state.limit.width = 656
        state.limit.height = 176
    }
    state.formData = Object.assign(state.formData, deepClone(props.deployData))
    if (state.formData.id) {
        state.oldImage = props.deployData.image.split(',')
        if (isPPTemplate.value) {
            state.formData.image = state.oldImage[1]
        } else {
            state.formData.image = state.oldImage[0]
        }
        let { playGames_, attachConfig } = state.formData
        if (props.deployData.attachConfig) {
            state.formData.attachConfig = JSON.parse(attachConfig)
            if (state.formData.attachConfig.inviteCond[0]) state.formData.limitType.push(1)
            if (state.formData.attachConfig.inviteCond[1]) state.formData.limitType.push(2)
            state.formData.limitRgAmount = state.formData.attachConfig.inviteCond[2] || 0
            state.formData.limitBetAmount = state.formData.attachConfig.inviteCond[3] || 0
        } else {
            state.formData.attachConfig = {
                homePop: 0,
            }
        }
        if (playGames_) state.playGameList = deepClone(playGames_)
        state.formData.rules_.forEach(item => {
            if (!item.ticketId || !item.ticketName) {
                item.ticketType = 0
                item.ticketId = ''
            }
        })
    }
    if (!state.formData.attachConfig.tags && provideData.isCustomize()) state.formData.attachConfig.tags = []
    state.tabItem = state.formData.playGameConfig[0].type
})

const getCheckGameNum = (item) => {
    return item.type_ + $t('(已选') + state.playGameList.filter(its => its.type === item.type).length + $t('个)')
}

// 复选框勾选变化
const checkChange = (currentValue, targetKey, type) => {
    provideData.checkboxChange({
        currentValue,
        metaKey: 'userLevel',
        dependData: state.formData,
        targetKey,
        indeterminateKey: 'isIndeterminateLevel',
        type
    })
}

// 删除游戏
const deleteGame = ({ type, gId, alias }, index) => {
    state.playGameList.splice(index, 1)
    state.formData.playGameConfig.forEach(item => {
        if (item.type === type) {
            item.games.forEach(ims => {
                if (ims.alias === alias) {
                    ims.checkedGameData = ims.checkedGameData.filter(its => its.gId !== gId)
                }
            })
        }
    })
}

// 选择游戏
const handleCheckGame = async (row, index, tab) => {
    try {
        if (!row.gameList || !row.gameList.length) {
            provideData.showLoading()
            let { data = {} } = await merchantValidListApi({ type: state.tabItem, alias: row.alias, _page: 1, _size: 9999, site: 2 })
            row.gameList = data || []
            row.gameList.forEach(item => {
                item.played = state.playGameList.some(its => its.gId === item.gid && its.played)
            })
            provideData.hideLoading()
        }
        state.itemData = {
            ...row,
            type_: state.formData.playGameConfig[tab].type_
        }
        state.currentIndex = index
        state.tabIndex = tab
        state.showGameCheck = true
    } catch (error) {
        provideData.hideLoading()
    }
}

// 设置游戏
const setGame = (data) => {
    let { alias, vendor_ } = state.itemData
    if (data.length) {
        state.playGameList = state.playGameList.filter(item => item.type !== state.tabItem || item.alias !== alias ||
            (item.type === state.tabItem && item.alias === alias && data.some(its => its.gId === item.gId && !its.isNewAdd)))
        data.forEach(item => {
            if (item.isNewAdd) {
                state.playGameList.push({
                    alias,
                    vendor_,
                    type: state.tabItem,
                    type_: state.itemData.type_,
                    gId: item.gId,
                    gameName: item.gameName,
                })
                delete item.isNewAdd
            }
        })
    } else {
        state.playGameList = state.playGameList.filter(item => item.type !== state.tabItem || item.alias !== alias)
    }
    state.formData.playGameConfig[state.tabIndex].games[state.currentIndex].checkedGameData = deepClone(data)
}

//删除等级
const handleDel = (index) => {
    state.formData.rules_.splice(index, 1)
}

//添加一级
const handleAdd = (index) => {
    state.formData.rules_.splice(index + 1, 0, {
        invitedNum: undefined,
        rewardInvited: undefined,
        reachPlay: undefined,
        rewardPlay: undefined,
        ticketType: 0,
        ticketId: ''
    })
}

// 表单校验
const formValidate = () => {
    if (!state.playGameList || !state.playGameList.length) return ElMessage.warning($t('请至少配置一个闯关游戏再进行提交！'))
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { limitType, limitRgAmount, limitBetAmount, successAuditMultiple, invitedAuditMultiple, attachConfig } = params
            let inviteCond = [0, 0, limitRgAmount || 0, limitBetAmount || 0]
            if (limitType.length) {
                inviteCond[0] = limitType.includes(1) ? 1 : 0
                inviteCond[1] = limitType.includes(2) ? 1 : 0
            }
            attachConfig.inviteCond = inviteCond
            params.auditMultiple = add(mul(invitedAuditMultiple || 0, 100000), successAuditMultiple || 0)
            params.playGames = JSON.stringify(deepClone(state.playGameList).map(item => {
                delete item.vendor_
                delete item.type_
                delete item.gameName
                return item
            }))
            params.rules_.forEach(item => {
                if (!item.ticketId) {
                    delete item.ticketType
                    delete item.ticketId
                    delete item.ticketName
                }
            })
            params.cycleMode = 2
            delete params.limitType
            delete params.limitRgAmount
            delete params.limitBetAmount
            delete params.successAuditMultiple
            delete params.invitedAuditMultiple
            delete params.playGames_
            delete params.playGameConfig
            const imageArry = isPPTemplate.value 
                ? [state.oldImage[0], params.image]
                : [params.image, state.oldImage[1]];
            params.image = imageArry.join(',');
            provideData.submit(params)
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

defineExpose({ valid: formValidate })
</script>

<style lang="scss">
@import '../styles/index.scss';
.complete-levels {
    .gLevels-box {
        .el-input-number {
            width: 100px !important;
        }
    }
    .game-box {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        &-small {
            margin-right: 25px;
            span {
                color: #666;
            }
        }
        &-icon {
            right: -15px;
            top: -4px;
        }
    }
    .item-row {
        display: flex;
        align-items: center;
        .el-input-number {
            width: 120px;
            margin: 0 5px;
        }
    }
}
</style>
