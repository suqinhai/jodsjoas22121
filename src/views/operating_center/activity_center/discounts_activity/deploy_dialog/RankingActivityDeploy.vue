<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-排行榜活动 -->
    <div>
        <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
            class="activity-deploy ranking-activity" :label-width="$locale == 'zh' ? '125px' : 'auto'">
            <el-form-item :label="$t('活动名称:')" prop="name">
                <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
            </el-form-item>
            <el-row>
                <el-col :span="15">
                    <el-form-item :label="$t('活动排序:')">
                        <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                            :placeholder="$t('填0或者不填默认排最前面')" />
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item :label-width="$locale == 'zh' ? '125px' : '190px'" :label="$t('稽核倍数:')" prop="auditMultiple">
                        <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false"
                            :placeholder="$t('请输入稽核倍数')" />
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
            <el-form-item :label="$t('排行时长:')">
                <el-radio-group :disabled="isDisabled" v-model="state.formData.rules_.duration"
                    @change="state.formData.rules_.minAmountDuration = ''">
                    <el-radio v-for="(item, index) in provideData.metaData.rankingDuration" :key="index" :label="+item.value">{{item.label}}
                    </el-radio>
                </el-radio-group>
                <div>{{$t('注：根据活动时间，选择天则是次日0点开始，选择周则在下周一开始，选择月则在每月1号开始')}}</div>
            </el-form-item>
            <el-form-item :label="$t('排行榜类型:')">
                <el-radio-group :disabled="isDisabled" v-model="state.formData.rules_.type">
                    <el-radio v-for="(item, index) in provideData.metaData.rankingType" :key="index" :label="+item.value">{{item.label}}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <template v-if="state.formData.rules_.type !== 2">
                <el-form-item :label="$t('游戏类型(可多选)') + ':'">
                    <div :class="{'game-select': state.playGameConfig.gameTypeData.length}">
                        <div>
                            {{$t('已选择数量:')}}
                            <span class="special"
                                style="margin: 0 30px 0 5px">{{isNotConfig ? $t('全部') : state.playGameConfig.gameTypeData.length}}</span>
                            <el-button v-throttle type="primary" @click="handleSelect('gameType')">{{$t('选择')}}</el-button>
                        </div>
                        <div class="game-box" style="margin-bottom: 10px;padding-top: 10px;" v-if="state.playGameConfig.gameTypeData.length">
                            <span style="margin-right: 5px">{{$t('已选游戏类型:')}}</span>
                            <span class="game-box-small pr" v-for="(item,index) in state.playGameConfig.gameTypeData" :key="index">{{item.name}}
                                <span v-if="!item.isDisabled" class="game-box-icon pointer pa" @click="deleteGameType(item.type,index)">
                                    <el-icon :size="18">
                                        <CircleCloseFilled />
                                    </el-icon>
                                </span>
                            </span>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('游戏厂家(可多选)') + ':'">
                    <div :class="{'game-select': state.playGameConfig.vendorData.length}">
                        <div>
                            {{$t('已选择数量:')}}
                            <span class="special"
                                style="margin: 0 30px 0 5px">{{isNotConfig ? $t('全部') : state.playGameConfig.vendorData.length}}</span>
                            <el-button v-throttle type="primary" @click="handleSelect('vendor')">{{$t('选择')}}</el-button>
                        </div>
                        <div class="game-box" style="margin-bottom: 10px;" v-if="state.playGameConfig.vendorData.length">
                            <span style="margin-right: 5px">{{$t('已选游戏厂家:')}}</span>
                            <span class="game-box-small pr" v-for="(item,index) in state.playGameConfig.vendorData"
                                :key="index">{{getVendorName(item.type)}}
                                <span v-if="!item.isDisabled" class="game-box-icon pointer pa" @click="deleteGameVendor(item.type,index)">
                                    <el-icon :size="18">
                                        <CircleCloseFilled />
                                    </el-icon>
                                </span>
                            </span>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('指定游戏(可多选)') + ':'">
                    <div :class="{'game-select': state.playGameConfig.gameData.length}">
                        <div>
                            {{$t('已选择数量:')}}
                            <span class="special"
                                style="margin: 0 30px 0 5px">{{isNotConfig ? $t('全部') : state.playGameConfig.gameData.length}}</span>
                            <el-button v-throttle type="primary" @click="handleSelect('game')">{{$t('选择')}}</el-button>
                        </div>
                        <div class="game-box" style="margin-bottom: 10px;" v-if="state.playGameConfig.gameData.length">
                            <span style="margin-right: 5px">{{$t('已选游戏:')}}</span>
                            <span class="game-box-small special pr" v-for="(item,index) in state.playGameConfig.gameData"
                                :key="index">[{{item.vendorName + item.typeName}}]
                                <span>{{item.name}}</span>
                                <span v-if="!item.isDisabled" class="game-box-icon pointer pa" @click="deleteGame(index)">
                                    <el-icon :size="18">
                                        <CircleCloseFilled />
                                    </el-icon>
                                </span>
                            </span>
                        </div>
                    </div>
                </el-form-item>
                <el-row>
                    <el-col :span="15">
                        <el-form-item :label="$t('最低存款时长:')">
                            <el-radio-group :disabled="isDisabled" v-model="state.formData.rules_.minAmountDuration">
                                <el-radio :disabled="![state.formData.rules_.duration,3].includes(+item.value)"
                                    v-for="(item, index) in provideData.metaData.minAmountDuration" :key="index" :label="+item.value">
                                    {{item.label}}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="9">
                        <el-form-item :label-width="$locale == 'zh' ? '125px' : '190px'" :label="$t('限制最低存款:')">
                            <el-input-number :disabled="isDisabled" style="width: 200px" v-model="state.formData.rules_.minAmount" :min="0"
                                :max="999999999999999" :precision="2" :controls="false" :placeholder="$t('请输入限制最低存款')" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>
            <el-form-item :label="$t('机器人排名:')" prop="rules_.robotRanks">
                <el-input :disabled="!state.formData.type" @input="(val) => state.formData.rules_.robotRanks = val.replace('，','')"
                    style="width: 100%" type="textarea" :rows="4" :placeholder="$t('多个需英文逗号隔开，排名超过排行榜上限不会生效')"
                    v-model="state.formData.rules_.robotRanks" />
            </el-form-item>
            <el-form-item :label="$t('排行榜奖励:')" class="gLevels-box">
                <div v-for="(item, index) in state.formData.rules_.rankConfigs" :key="index" class="gLevels-small">
                    <div class="gLevels-small-deploy"
                        :class="{'gLevels-small-deploy-special':  $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh'}">
                        <span>{{$t('排名类型')}}</span>
                        <el-select style="width: 90px;margin: 0 5px" :disabled="isDisabled" v-model="item.type" :placeholder="$t('排名类型')">
                            <el-option :label="$t('固定')" :value="1"></el-option>
                            <el-option :label="$t('范围')" :value="2"></el-option>
                        </el-select>
                        <span>{{$t('，排名')}}</span>
                        <el-form-item :prop="'rules_.rankConfigs.' + index + '.min'"
                            :rules="[{ required: true, message: $t('请输入排名值！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :disabled="isDisabled" style="width: 80px;" v-model="item.min" :controls="false" :precision="0" :min="1"
                                :max="1000" :placeholder="$t('排名值')" @blur="inputBlur(item)" />
                        </el-form-item>
                        <span v-if="item.type === 2">~</span>
                        <el-form-item v-if="item.type === 2" :prop="'rules_.rankConfigs.' + index + '.max'"
                            :rules="[{ required: true, message: $t('请输入排名值！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :disabled="isDisabled" style="width: 80px;" v-model="item.max" :controls="false" :precision="0" :min="2"
                                :max="1000" :placeholder="$t('排名值')" @blur="inputBlur(item)" />
                        </el-form-item>
                        <span>{{$t('，奖励金额')}}</span>
                        <el-input-number :disabled="isDisabled" v-model="item.reward" :controls="false" :precision="2" :min="0.01"
                            :max="999999999999999" :placeholder="$t('奖励金额')" />
                        <div class="gLevels-small-deploy-ticket">
                            <span class="label">{{ $locale !== 'zh' ? $t('奖励票券') : $t('，奖励票券')}}</span>
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
                        <el-button v-throttle
                            v-if="state.formData.rules_.rankConfigs.length < 101 && state.formData.rules_.rankConfigs.length === index + 1"
                            type="primary" @click="handleAdd(index)" :icon="Plus">
                        </el-button>
                        <el-button v-throttle v-if="state.formData.rules_.rankConfigs.length > 1" type="danger" @click="handleDel(index)"
                            :icon="Minus">
                        </el-button>
                    </div>
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
                <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '820px'">
                </Tinymce>
            </el-form-item>
            <el-form-item :label="$t('会员层级:')" prop="fixLayerList" v-if="provideData.isShowFixLayers">
                <div style="width: 100%">
                    <el-checkbox :disabled="isDisabled" v-model="state.formData.isCheckedAllLayer"
                        :indeterminate="state.formData.isIndeterminateLayer" @change="(val) => checkChange(val,'fixLayerList',1)">{{$t('全部层级')}}
                    </el-checkbox>
                </div>
                <el-checkbox-group v-model="state.formData.fixLayerList" @change="(val) => checkChange(val,'isCheckedAllLayer',0)">
                    <el-checkbox :disabled="isDisabled && state.initMemberLevel && state.initMemberLevel.includes(item.id)"
                        v-for="item in provideData.metaData.memberLevel" :key="item.id" :label="item.id">{{ item.name }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="state.formData.rules_.type !== 2" :label="$t('稽核平台:')" prop="auditVendor">
                <el-radio-group :disabled="isDisabled" v-model="state.formData.auditVendor">
                    <el-radio :label="1">{{$t('全部平台')}}</el-radio>
                    <el-radio :label="2">{{$t('指定平台')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item class="gameVendor_row" label=" " v-if="state.formData.rules_.type !== 2 && state.formData.auditVendor == 2">
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

        <RankingGameCheck v-if="state.showGameCheck" :itemData="state.itemData" @close="state.showGameCheck = false" @setGameData="setGameData">
        </RankingGameCheck>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, inject, defineAsyncComponent, computed } from "vue"
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { deepClone } from "@/common/util/index"
import { getGameVendorList } from '@/api/common'
import { merchantVendorListApi, merchantValidListApi } from '@/api/merchant_center'
const RankingGameCheck = defineAsyncComponent(() => import("./RankingGameCheck.vue"))
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
    formData: {
        rules_: {
            rankConfigs: [{ min: 1, max: undefined, reward: undefined, type: 1, ticketType: 0, ticketId: '' }],
            duration: 0,
            type: 0,
            minAmountDuration: 0,
            robotRanks: '',
        },
        attachConfig: {
            tags: [],
        }
    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        auditMultiple: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: 'change' }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: 'change' }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: 'change' }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: 'change' }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: 'change' }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        fixLayerList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'rules_.robotRanks': {
            pattern: /^\d[0-9,]*$/,
            message: $t('请输入正确的排名，多个需要用英文逗号隔开！'),
            trigger: 'change',
        }
    },
    playGameConfig: {
        gameTypeData: [],
        vendorData: [],
        gameData: [],
    },
    showGameCheck: false,
    currentType: '',
    itemData: {},
    initMemberLevel: []
})
const formRef = ref(null)
const provideData = inject('provideData')

const isNotConfig = computed(() => {
    return !state.playGameConfig.gameTypeData.length && !state.playGameConfig.vendorData.length && !state.playGameConfig.gameData.length
})
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
        let { playGameConfig, rules_, initMemberLevel } = state.formData
        if (rules_.type !== 2) {
            if (playGameConfig.gameTypes) state.playGameConfig.gameTypeData = playGameConfig.gameTypes.map(item => {
                item.isDisabled = props.isDisabled || props.deployData.operationType === 2
                return item
            })
            if (playGameConfig.playVendors) state.playGameConfig.vendorData = playGameConfig.playVendors.map(item => {
                return {
                    isDisabled: props.isDisabled || props.deployData.operationType === 2,
                    type: item,
                }
            })
            if (playGameConfig.playGames) state.playGameConfig.gameData = playGameConfig.playGames.map(item => {
                item.isDisabled = props.isDisabled || props.deployData.operationType === 2
                return item
            })
        }
        state.formData.rules_.rankConfigs.forEach(item => {
            item.type = item.max ? 2 : 1
            if (!item.ticketId || !item.ticketName) {
                item.ticketType = 0
                item.ticketId = ''
            }
        })
        if (Array.isArray(rules_.robotRanks)) state.formData.rules_.robotRanks = rules_.robotRanks.join(',')
        if (initMemberLevel) {
            state.initMemberLevel = [...initMemberLevel]
            delete state.formData.initMemberLevel
        }
        if (provideData.isCustomize() && props.deployData.attachConfig) {
            state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
        }
    }
})

const inputBlur = (row) => {
    let { min, max } = row
    if (typeof min !== 'number' || typeof max !== 'number') return
    if (max <= min) {
        row.max = min + 1
    }
}

// 复选框勾选变化
const checkChange = (currentValue, targetKey, type) => {
    provideData.checkboxChange({
        currentValue,
        metaKey: 'memberLevel',
        dependData: state.formData,
        targetKey,
        indeterminateKey: 'isIndeterminateLayer',
        type,
        key: 'id'
    })
}

// 排行榜 类型/游戏/厂家
const handleSelect = async (type) => {
    if (isNotConfig.value && type !== 'gameType') return ElMessage.warning($t('请先配置游戏类型再配置游戏厂家和游戏！'))
    if (!state.playGameConfig.vendorData.length && type === 'game') return ElMessage.warning($t('请先配置游戏厂家再配置游戏！'))
    let res = {}
    try {
        provideData.showLoading()
        if (type === 'vendor') {
            res = await getGameVendorList({ types: state.playGameConfig.gameTypeData.map(item => item.type).join(',') })
        } else if (type === 'game') {
            res = await merchantValidListApi({
                types: state.playGameConfig.gameTypeData.map(item => item.type).join(','),
                aliasList: state.playGameConfig.vendorData.map(item => item.type).join(','),
                _page: 1,
                _size: 9999,
                site: 2,
                // bizType: 3,
                // onOff: 1
            })
        }
    } catch (error) {
        provideData.hideLoading()
    }
    provideData.hideLoading()
    state.currentType = type
    state.itemData = {
        type,
        dataList: state.playGameConfig[state.currentType + 'Data'],
        // tableData: type === 'gameType' ? [] : type === 'game' ? (res && res.data && res.data.list ? res.data.list : []) : res.data || [],
        tableData: type === 'gameType' ? [] : type === 'game' ? (res && res.data  ? res.data : []) : res.data || [],
    }
    if (type === 'game') {
        state.itemData.vendorList = state.playGameConfig.vendorData
        state.itemData.gameTypeList = state.playGameConfig.gameTypeData
    }
    state.showGameCheck = true
}

// 设置排行榜 类型/游戏/厂家
const setGameData = (data) => {
    state.playGameConfig[state.currentType + 'Data'] = deepClone(data)
    if (state.currentType === 'gameType' && state.playGameConfig.vendorData.length) {
        deleteGameType('')
    } else if (state.currentType === 'vendor' && state.playGameConfig.gameData.length) {
        deleteGameVendor('')
    }
}

// 删除游戏类型
const deleteGameType = async (val = '', index) => {
    if (!state.playGameConfig.vendorData.length && !!val) return state.playGameConfig.gameTypeData.splice(index, 1)
    let gameTypeData = !!val ? state.playGameConfig.gameTypeData.filter(item => val !== item.type) : state.playGameConfig.gameTypeData
    if (gameTypeData.length) {
        try {
            provideData.showLoading()
            let res = await getGameVendorList({ types: gameTypeData.map(item => item.type).join(',') })
            if (res.data && res.data.length) {
                let vendorData = state.playGameConfig.vendorData.filter(item => res.data.some(its => its.value === item.type))
                if (vendorData.length) {
                    let { data = {} } = await merchantVendorListApi({
                        types: gameTypeData.map(item => item.type).join(','),
                        aliasList: vendorData.map(item => item.type).join(','),
                        _page: 1,
                        _size: 9999,
                        site: 2,
                        // bizType: 3,
                        // onOff: 1
                    })
                    if (data && data.list && data.list.length) {
                        state.playGameConfig.gameData = state.playGameConfig.gameData.filter(item => data.list.some(its => its.id === item.id))
                    } else {
                        vendorData = []
                        state.playGameConfig.gameData = []
                    }
                } else {
                    state.playGameConfig.gameData = []
                }
            } else {
                vendorData = []
                state.playGameConfig.gameData = []
            }
            !!val && state.playGameConfig.gameTypeData.splice(index, 1)
            state.playGameConfig.vendorData = vendorData
            provideData.hideLoading()
        } catch (error) {
            provideData.hideLoading()
        }
    } else {
        !!val && state.playGameConfig.gameTypeData.splice(index, 1)
        state.playGameConfig.vendorData = []
        state.playGameConfig.gameData = []
    }
}

// 删除游戏厂家
const deleteGameVendor = async (val = '', index) => {
    if (!state.playGameConfig.gameData.length && !!val) return state.playGameConfig.vendorData.splice(index, 1)
    let vendorData = !!val ? state.playGameConfig.vendorData.filter(item => val !== item.type) : state.playGameConfig.vendorData
    if (vendorData.length) {
        try {
            provideData.showLoading()
            let { data = {} } = await merchantVendorListApi({
                types: state.playGameConfig.gameTypeData.map(item => item.type).join(','),
                aliasList: vendorData.map(item => item.type).join(','),
                _page: 1,
                _size: 9999,
                site: 2,
                // bizType: 3,
                // onOff: 1
            })

            if (data && data.list && data.list.length) {
                state.playGameConfig.gameData = state.playGameConfig.gameData.filter(item => data.list.some(its => its.id === item.id))
            } else {
                state.playGameConfig.gameData = []
            }
            !!val && state.playGameConfig.vendorData.splice(index, 1)
            provideData.hideLoading()
        } catch (error) {
            provideData.hideLoading()
        }
    } else {
        !!val && state.playGameConfig.vendorData.splice(index, 1)
        state.playGameConfig.gameData = []
    }
}

// 获取厂家名称
const getVendorName = (val) => {
    return provideData.metaData.gameVendor.find(item => item.value === val)?.label || ''
}

// 删除游戏
const deleteGame = (index) => {
    state.playGameConfig.gameData.splice(index, 1)
}

//删除等级
const handleDel = (index) => {
    state.formData.rules_.rankConfigs.splice(index, 1)
}

//添加一级
const handleAdd = (index) => {
    state.formData.rules_.rankConfigs.splice(index + 1, 0, {
        min: state.formData.rules_.rankConfigs[index].type === 1 ? (state.formData.rules_.rankConfigs[index].min ? state.formData.rules_.rankConfigs[index].min + 1 : undefined) :
            (state.formData.rules_.rankConfigs[index].max ? state.formData.rules_.rankConfigs[index].max + 1 : undefined),
        max: undefined,
        reward: undefined,
        type: 1,
        ticketType: 0,
        ticketId: ''
    })
}

// 表单校验
const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { rules_, fixLayerList } = params
            let isPass = true
            for (let index = 0; index < rules_.rankConfigs.length; index++) {
                let { type, min, max } = rules_.rankConfigs[index]
                rules_.rankConfigs.forEach((ims, ins) => {
                    if (ins > index) {
                        if ((type === 1 && min >= ims.min) || (type === 2 && max >= ims.min)) {
                            isPass = false
                        }
                    }
                })
                if (!isPass) {
                    ElMessage.warning($t('排行榜奖励配置，设置排名需递增！'))
                    break
                }
            }
            if (!isPass) return
            rules_.rankConfigs.forEach(item => {
                item.type === 1 && delete item.max
                if (!item.ticketId) {
                    delete item.ticketType
                    delete item.ticketId
                    delete item.ticketName
                }
            })
            params.fixLayers = fixLayerList && fixLayerList.length ? fixLayerList.join(",") : ''
            if (rules_.type !== 2) {
                let { gameTypeData, vendorData, gameData } = deepClone(state.playGameConfig)
                gameTypeData.forEach(item => { delete item.isDisabled })
                gameData.forEach(item => { delete item.isDisabled })
                params.gameTypes = JSON.stringify(gameTypeData)
                params.vendorConfigs = JSON.stringify(vendorData.map(item => item.type))
                params.playGames = JSON.stringify(gameData)
            }
            if (!provideData.isCustomize()) {
                delete params.attachConfig
            }
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
.ranking-activity {
    .gLevels-small-deploy-special {
        width: 700px;
    }
    .game-select {
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 5px 10px;
        &:hover {
            border-color: #409eff;
        }
    }
    .game-box {
        margin-top: 5px;
        width: 100%;
        max-height: 300px;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        padding-top: 10px;
        &-small {
            margin-right: 25px;
            white-space: nowrap;
            span {
                color: #666;
            }
        }
        &-icon {
            right: -15px;
            top: -10px;
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
