<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-推广活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy popularize-deploy" :label-width="$locale == 'zh' ? '120px' : '250px'">
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
            <el-col :span="12">
                <el-form-item :label-width="$locale == 'zh' ? '128px' : 'auto'" :label="$t('稽核倍数:')" prop="auditMultiple">
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
        <el-row>
            <el-col :span="10">
                <el-form-item :label="$t('活动方式:')" prop="rules_.type">
                    <el-select :disabled="isDisabled" v-model="state.formData.rules_.type" :placeholder="$t('请选择活动方式')" style="width: 200px"
                        @change="typeChange">
                        <el-option :label="$t('推广')" :value="0" />
                        <el-option :label="$t('推广注册')" :value="1" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="14">
                <el-form-item :label-width="$locale == 'zh' ? '180px' : 'auto'" v-if="state.formData.rules_.type === 1" :label="$t('每次奖励需达到人数:')"
                    prop="rules_.cashNumLimit">
                    <el-input-number style="width: 200px" v-model="state.formData.rules_.cashNumLimit" :min="1" :precision="0" :controls="false"
                        :placeholder="$t('每次奖励需达到人数')" />
                </el-form-item>
                <el-form-item :label-width="$locale == 'zh' ? '128px' : 'auto'" v-else :label="$t('下级会员限制:')" prop="rules_.limitType">
                    <el-select :disabled="isDisabled" v-model="state.formData.rules_.limitType" :placeholder="$t('请选择下级会员限制')" style="width: 200px">
                        <el-option v-for="item in provideData.metaData.agentLimitType" :key="item.value" :label="item.label"
                            :value="Number(item.value)" />
                    </el-select>
                </el-form-item>

            </el-col>
        </el-row>
        <el-row v-if="state.formData.rules_.type !== 1">
            <el-col :span="12">
                <el-form-item :label="$t('推广充值条件:')">
                    <el-input-number style="width: 200px" v-model="state.formData.rules_.condRecharge" :min="0.01" :max="999999999999999"
                        :precision="2" :controls="false" :placeholder="$t('充值金额')" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label-width="$locale == 'zh' ? '128px' : 'auto'" :label="$t('推广打码条件:')">
                    <el-input-number style="width: 200px" v-model="state.formData.rules_.condPlay" :min="0.01" :max="999999999999999" :precision="2"
                        :controls="false" :placeholder="$t('打码金额')" />
                </el-form-item>
            </el-col>
        </el-row>

        <el-row v-if="state.formData.rules_.type === 1">
            <el-col :span="12">
                <el-form-item :label="$t('登录后弹窗:')" prop="attachConfig.afterLoginPop">
                    <el-select v-model="state.formData.attachConfig.afterLoginPop" :placeholder="$t('请选择弹窗类型')" style="width: 200px">
                        <el-option v-for="item in provideData.metaData.popMode" :key="item.value" :label="item.label" :value="item.value * 1" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label-width="$locale == 'zh' ? '128px' : 'auto'" :label="$t('验证手机号:')">
                    <el-switch style="margin: 0 5px" :disabled="isDisabled" v-model="state.formData.rules_.phoneBind" :active-value="1"
                        :inactive-value="0" />
                    <span style="line-height: 20px;color: red">{{$t('(默认开启，开启后将需要手机验证)')}}</span>
                    <div style="color: red">{{$t('风险提示：关闭将可能出现刷子用户')}}</div>
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item style="margin-bottom:5px;">
            <div>{{$t('统计人数限制（表示同注册ip/设备，最高有效统计人数）')}}</div>
        </el-form-item>
        <el-row>
            <el-col :span="10">
                <el-form-item :label="$t('同注册ip上限：')" prop="rules_.sameIpLimit" required
                    :rules="[{ required: true, message: $t('必填项不能为空！'), trigger: 'blur' }]">
                    <el-input v-model.trim="state.formData.rules_.sameIpLimit" :disabled="isDisabled" style="width: 200px" :placeholder="$t('请输入，0表示不限制')">
                    </el-input>
                </el-form-item>
            </el-col>
            <el-col :span="14">
                <el-form-item :label="$t('同注册设备上限：')" prop="rules_.sameDeviceLimit" :label-width="$locale == 'zh' ? '140px' : 'auto'" required
                    :rules="[{ required: true, message: $t('必填项不能为空！'), trigger: 'blur' }]">
                    <el-input v-model.trim="state.formData.rules_.sameDeviceLimit" :disabled="isDisabled" style="width: 200px"
                        :placeholder="$t('请输入，0表示不限制')"></el-input>
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item v-if="state.formData.rules_.type !== 1" :label="$t('奖励类型:')" prop="bonusType">
            <el-radio-group v-model="state.formData.bonusType">
                <el-radio :label="1">{{$t('固定金额')}}</el-radio>
                <el-radio :label="2">{{$t('随机奖励')}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('奖励设置:')" class="gLevels-box">
            <template v-if="state.formData.rules_.type !== 1">
                <div v-for="(item, index) in state.formData.rules_.tiers" :key="item" class="gLevels-small">
                    <div class="gLevels-small-deploy"
                        :class="{'gLevels-small-deploy-special': $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh','gLevels-small-deploy-en': $locale !== 'zh'}">
                        <span>{{$t('推广人数')}}</span>
                        <el-form-item v-if="state.formData.rules_.type !== 1" :prop="'rules_.tiers.' + index + '.number'"
                            :rules="[{ required: true, message: $t('请输入推广人数！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :disabled="isDisabled" v-model="item.number" :controls="false" :precision="0" :min="1"
                                :placeholder="$t('推广人数')" />
                        </el-form-item>
                        <span>{{$t('人，奖励金额')}}</span>
                        <el-form-item v-if="state.formData.bonusType === 2" :prop="'rules_.tiers.' + index + '.min'"
                            :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number v-model="item.min" :controls="false" :precision="2" :min="0.01" :max="999999999999999"
                                :placeholder="$t('奖励金额')" @blur="inputBlur(index)" />
                        </el-form-item>
                        <span v-if="state.formData.bonusType === 2">~</span>
                        <el-form-item :prop="'rules_.tiers.' + index + '.max'" :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]"
                            label-width="0">
                            <el-input-number :disabled="isDisabled" v-model="item.max" :controls="false" :precision="2" :min="0.01"
                                :max="999999999999999" :placeholder="$t('奖励金额')" @blur="inputBlur(index)" />
                        </el-form-item>
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
                    <div class="operate">
                        <el-button v-if="state.formData.bonusType === 2" v-throttle type="primary" @click="handleProbabilityConfig(index)">
                            {{$t('概率配置')}}</el-button>
                        <el-button :disabled="isDisabled" v-throttle type="primary" @click="handleAdd(index)" :icon="Plus">
                        </el-button>
                        <el-button :disabled="isDisabled" v-throttle v-if="state.formData.rules_.tiers.length > 1" type="danger"
                            @click="handleDel(index)" :icon="Minus">
                        </el-button>
                    </div>
                </div>
            </template>
            <template v-if="state.formData.rules_.type === 1">
                <div v-for="(item, index) in state.formData.rules_.tiers" :key="index" class="gLevels-small">
                    <span>{{$t('有效推广人数，每1人，奖励金额')}}</span>
                    <el-form-item :prop="'rules_.tiers.' + index + '.max'" :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]"
                        label-width="0">
                        <el-input-number v-model="item.max" :controls="false" :precision="2" :min="0.01" :max="999999999999999"
                            :placeholder="$t('奖励金额')" />
                    </el-form-item>
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
                <div v-for="(item, index) in state.formData.rules_.bindTier.tiers" :key="index" class="gLevels-small">
                    <div class="gLevels-small-deploy"
                        :class="{'gLevels-small-deploy-special': $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh'}">
                        <span>{{$t('有效推广绑定手机人数')}}</span>
                        <el-switch style="margin: 0 5px" v-model="state.formData.rules_.bindTier.open" :active-value="1" :inactive-value="0" />
                        <span>{{$t('，每1人，奖励金额')}}</span>
                        <el-form-item :prop="'rules_.bindTier.tiers.' + index + '.max'"
                            :rules="[{ required: !!state.formData.rules_.bindTier.open, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number v-model="item.max" :controls="false" :precision="2" :min="0.01" :max="999999999999999"
                                :placeholder="$t('奖励金额')" />
                        </el-form-item>
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
                </div>
                <div v-for="(item, index) in state.formData.rules_.rechargeTier.tiers" :key="index" class="gLevels-small">
                    <div class="gLevels-small-deploy"
                        :class="{'gLevels-small-deploy-special': $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh'}">
                        <span>{{$t('有效推广人充值')}}</span>
                        <el-switch style="margin: 0 5px" v-model="state.formData.rules_.rechargeTier.open" :active-value="1" :inactive-value="0" />
                        <span>{{$t('，充值金额')}}</span>
                        <el-form-item :prop="'rules_.rechargeTier.tiers.' + index + '.number'"
                            :rules="[{ required: !!state.formData.rules_.rechargeTier.open, message: $t('请输入充值金额！'), trigger: 'blur' }]"
                            label-width="0">
                            <el-input-number :disabled="isDisabled" v-model="item.number" :controls="false" :precision="0" :min="1"
                                :max="999999999999999" :placeholder="$t('充值金额')" />
                        </el-form-item>
                        <span>{{$t('，奖励金额')}}</span>
                        <el-form-item :prop="'rules_.rechargeTier.tiers.' + index + '.max'"
                            :rules="[{ required: !!state.formData.rules_.rechargeTier.open, message: $t('请输入奖励金额！'), trigger: 'blur' }]"
                            label-width="0">
                            <el-input-number v-model="item.max" :controls="false" :precision="2" :min="0.01" :max="999999999999999"
                                :placeholder="$t('奖励金额')" />
                        </el-form-item>
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
                </div>
                <div v-for="(item, index) in state.formData.rules_.playTier.tiers" :key="index" class="gLevels-small">
                    <div class="gLevels-small-deploy"
                        :class="{'gLevels-small-deploy-special': $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh'}">
                        <span>{{$t('有效推广人打码')}}</span>
                        <el-switch style="margin: 0 5px" v-model="state.formData.rules_.playTier.open" :active-value="1" :inactive-value="0" />
                        <span>{{$t('，打码金额')}}</span>
                        <el-form-item :prop="'rules_.playTier.tiers.' + index + '.number'"
                            :rules="[{ required: !!state.formData.rules_.playTier.open, message: $t('请输入打码金额！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :disabled="isDisabled" v-model="item.number" :controls="false" :precision="0" :min="1"
                                :max="999999999999999" :placeholder="$t('打码金额')" />
                        </el-form-item>
                        <span>{{$t('，奖励金额')}}</span>
                        <el-form-item :prop="'rules_.playTier.tiers.' + index + '.max'"
                            :rules="[{ required: !!state.formData.rules_.playTier.open, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number v-model="item.max" :controls="false" :precision="2" :min="0.01" :max="999999999999999"
                                :placeholder="$t('奖励金额')" />
                        </el-form-item>
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
                </div>
            </template>
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
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2">
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
        <el-form-item :label="$t('游戏平台:')">
            <el-radio-group :disabled="isDisabled" v-model="state.formData.vendor">
                <el-radio :label="1">{{$t('全部平台')}}</el-radio>
                <el-radio :label="2">{{$t('指定平台')}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item class="gameVendor_row" label=" " v-if="state.formData.vendor == 2">
            <el-tabs type="border-card">
                <el-tab-pane v-for="item in state.formData.playVendorList" :key="item.type"
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
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, inject, computed } from "vue"
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { deepClone } from "@/common/util/index"
import userStore from '@/store/user'
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const userData = userStore()
let objKey = ['bindTier', 'rechargeTier', 'playTier']
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
        bonusType: 1,
        rules_: {
            type: 1,
            phoneBind: 1,
            tiers: [{ number: undefined, min: undefined, max: undefined, ticketType: 0, ticketId: '' }],
            bindTier: {
                open: 0,
                tiers: [{ number: 1, max: undefined, ticketType: 0, ticketId: '' }],
            },
            rechargeTier: {
                open: 0,
                tiers: [{ number: undefined, max: undefined, ticketType: 0, ticketId: '' }],
            },
            playTier: {
                open: 0,
                tiers: [{ number: undefined, max: undefined, ticketType: 0, ticketId: '' }],
            },
        },
        attachConfig: {
            afterLoginPop: 0,
        }
    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "change" }],
        auditMultiple: [{ required: true, message: $t('必选项不能为空！'), trigger: "change" }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: "change" }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: "change" }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: "change" }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: "change" }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: "change" }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "change" }],
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: "change" }],
        'rules_.type': [{ required: true, message: $t('请选择活动方式！'), trigger: "change" }],
        'rules_.limitType': [{ required: true, message: $t('请选择下级会员限制！'), trigger: "change" }],
        'rules_.cashNumLimit': [{ required: true, message: $t('必选项不能为空！'), trigger: "change" }],
        'attachConfig.afterLoginPop': [{ required: true, message: $t('必选项不能为空！'), trigger: "change" }],
        'rules_.sameIpLimit': [{ required: true, message: $t('必填项不能为空！'), trigger: "change" }],
        'rules_.sameDeviceLimit': [{ required: true, message: $t('必填项不能为空！'), trigger: "change" }]
    },
    currentIndex: ''
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
    if (props.deployData.id) {
        state.oldImage = props.deployData.image.split(',')
        if (isPPTemplate.value) {
            state.formData.image = state.oldImage[1]
        } else {
            state.formData.image = state.oldImage[0]
        }
        let { attachConfig, rules_ } = state.formData
        if (typeof rules_.type !== 'number') rules_.type = 0
        if (typeof rules_.phoneBind !== 'number') rules_.phoneBind = 1
        if (!attachConfig) {
            state.formData.attachConfig = {
                afterLoginPop: 0,
            }
        } else {
            state.formData.attachConfig = JSON.parse(attachConfig)
        }
        if (!rules_.type || !rules_.bindTier) {
            rules_.bindTier = {
                open: 0,
                tiers: [{ number: 1, max: undefined, ticketType: 0, ticketId: '' }],
            }
        }
        if (!rules_.type || !rules_.rechargeTier) {
            rules_.rechargeTier = {
                open: 0,
                tiers: [{ number: undefined, max: undefined, ticketType: 0, ticketId: '' }],
            }
        }
        if (!rules_.type || !rules_.playTier) {
            rules_.playTier = {
                open: 0,
                tiers: [{ number: undefined, max: undefined, ticketType: 0, ticketId: '' }],
            }
        }
        if (!rules_.sameIpLimit) rules_.sameIpLimit = 0
        if (!rules_.sameDeviceLimit) rules_.sameDeviceLimit = 0
        state.formData.rules_.tiers.forEach(item => {
            if (!item.ticketId || !item.ticketName) {
                item.ticketType = 0
                item.ticketId = ''
            }
        })
        objKey.forEach(item => {
            state.formData.rules_[item].tiers.forEach(its => {
                if (!its.ticketId || !item.ticketName) {
                    its.ticketType = 0
                    its.ticketId = ''
                }
            })
        })
    }
})

const inputBlur = (index) => {
    if (state.formData.bonusType !== 2) return
    let { rules_ } = state.formData
    let { min, max } = rules_.tiers[index]
    if (typeof min !== 'number' || typeof max !== 'number') return
    if (max < min) {
        state.formData.rules_.tiers[index].max = min
    }
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

//  删除等级
const handleDel = (index) => {
    state.formData.rules_.tiers.splice(index, 1)
}

//  添加一级
const handleAdd = (index) => {
    state.formData.rules_.tiers.splice(index + 1, 0, {
        number: undefined,
        min: undefined,
        max: undefined,
        ticketType: 0,
        ticketId: '',
    })
}

// 活动方式切换
const typeChange = (val) => {
    if (val === 1) {
        state.formData.bonusType = 1
        if (state.formData.rules_.tiers.length > 1) {
            state.formData.rules_.tiers.splice(1)
            delete state.formData.rules_.tiers[0].limitOdds
        }
    }
}

// 打开概率设置弹窗
const handleProbabilityConfig = (index) => {
    let { min, max, limitOdds = [] } = state.formData.rules_.tiers[index]
    if (typeof min !== 'number' || typeof max !== 'number') return ElMessage.warning($t('请配置完奖励金额再进行操作！'))
    if (max <= 0.01) return ElMessage.warning($t('奖励金额必须大于0.01才能配置概率！'))
    state.currentIndex = index
    provideData.probabilityDeployShow({
        rewardMinAmount: min,
        rewardMaxAmount: max,
        limitOdds,
    })
}

// 设置奖励概率数据
const setProbability = (val) => {
    if (!val.length) return delete state.formData.rules_.tiers[state.currentIndex].limitOdds
    state.formData.rules_.tiers[state.currentIndex].limitOdds = val
}

const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { rules_, bonusType } = params
            if (rules_.type !== 1) {
                let failType = 0
                let failIndex
                for (let index = 0; index < rules_.tiers.length; index++) {
                    let obj = { ...rules_.tiers[index] }
                    if (bonusType === 2 && obj.limitOdds && obj.limitOdds.length) {
                        if (obj.limitOdds.some(its => its.limit < obj.min || its.limit > obj.max)) {
                            failType = 1
                            failIndex = index
                            break
                        }
                        rules_.tiers[index].limitOdds[obj.limitOdds.length - 1].limit = rules_.tiers[index].max
                    }
                    if (bonusType !== 2 || (obj.limitOdds && !obj.limitOdds.length)) {
                        delete rules_.tiers[index].limitOdds
                    }
                }
                if (failType) return ElMessage.warning(`${$t('奖励配置第')}${failIndex + 1}${$t('行奖励金额改变，请重新配置相关概率！')}`)
                params.attachConfig = {
                    afterLoginPop: 0,
                }
                delete rules_.cashNumLimit
                delete rules_.bindTier
                delete rules_.rechargeTier
                delete rules_.playTier
                delete rules_.phoneBind
            } else {
                delete rules_.limitType
                delete rules_.condRecharge
                delete rules_.condPlay
                // params.auditMultiple = 0
                rules_.tiers[0].number = 1
                objKey.forEach(item => {
                    rules_[item].tiers.forEach(its => {
                        if (!its.ticketId) {
                            delete its.ticketType
                            delete its.ticketId
                            delete its.ticketName
                        }
                    })
                })
            }
            rules_.tiers.forEach(item => {
                if (!item.ticketId) {
                    delete item.ticketType
                    delete item.ticketId
                    delete item.ticketName
                }
            })
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

defineExpose({ setProbability, valid: formValidate })
</script>

<style lang="scss">
@import '../styles/index.scss';
.popularize-deploy {
    .gLevels-box {
        .el-input-number {
            width: 100px !important;
        }

        .gLevels-small-deploy-en {
            width: 640px;
        }
    }
}
</style>
