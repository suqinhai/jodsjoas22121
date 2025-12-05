<template>
  <!-- 运营中心-优惠活动列表-活动配置弹窗-里程碑活动 -->
  <el-form
    :model="state.formData"
    ref="formRef"
    :rules="state.rules"
    :disabled="deployData.operationType === 2"
    class="activity-deploy"
    :label-width="$locale == 'zh' ? '170px' : 'auto'"
  >
    <el-form-item :label="$t('活动名称:')" prop="name">
      <el-input
        style="width: 100%"
        v-model="state.formData.name"
        :placeholder="$t('请输入活动名称')"
      />
    </el-form-item>
    <el-form-item :label="$t('活动时间:')">
      <div class="time-box">
        <el-form-item prop="beginTime" label-width="0">
          <el-date-picker
            :disabled="isDisabled"
            v-model="state.formData.beginTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="(time) => disabledDate(time)"
            :placeholder="$t('开始时间')"
          >
          </el-date-picker>
        </el-form-item>
        <span class="stance">{{ $t("至") }}</span>
        <el-form-item prop="endTime" label-width="0">
          <el-date-picker
            v-model="state.formData.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="(time) => disabledDate(time)"
            :placeholder="$t('结束时间')"
            :disabled="isDisabled"
            :default-time="new Date(2000, 0, 0, 23, 59, 59)"
          >
          </el-date-picker>
        </el-form-item>
      </div>
      <div>{{ $t('配置周期范围不可大于30天') }}</div>
    </el-form-item>
    <el-row>
      <el-col :span="12">
        <el-form-item :label="$t('活动排序:')">
          <el-input-number
            v-model="state.formData.sort"
            style="width: 200px"
            :controls="false"
            :precision="0"
            :min="0"
            :placeholder="$t('填0或者不填默认排最前面')"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
          <el-input-number 
          style="width: 200px" 
          v-model="state.formData.auditMultiple" 
          :min="0" 
          :precision="2" 
          :controls="false"
          :placeholder="$t('请输入稽核倍数')" />
      </el-form-item>
      </el-col>
    </el-row>
    <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
      <el-checkbox-group v-model="state.formData.attachConfig.tags">
        <el-checkbox
          v-for="item in provideData.tagList()"
          :key="item"
          :value="item.value"
          :label="item.value"
          >{{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item :label="$t('会员等级:')" prop="levelList" v-if="provideData.isShowLevels">
      <el-checkbox
        v-model="state.formData.isCheckedAllLevel"
        :indeterminate="state.formData.isIndeterminateLevel"
        :disabled="isDisabled"
        @change="(val) => checkChange(val, 'levelList', 1)"
        >{{ $t("全部等级") }}</el-checkbox
      >
      <el-checkbox-group
        v-model="state.formData.levelList"
        @change="(val) => checkChange(val, 'isCheckedAllLevel', 0)"
      >
        <el-checkbox
          v-for="item in provideData.metaData.userLevel"
          :key="item"
          :label="item.value"
          :disabled="isDisabled"
          >{{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item :label="$t('派奖方式:')" prop="dispatchMode">
      <el-radio-group v-model="state.formData.dispatchMode" :disabled="isDisabled" @change="onChangeDispatchMode">
        <el-radio :label="1">{{ $t("手动领取") }}</el-radio>
        <el-radio :label="2">{{ $t("自动发放（奖金增加到当前余额）") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <div style="display: flex;" v-if="state.formData.dispatchMode === 1">
      <el-form-item
        v-if="provideData.isCustomize()"
        :label-width="$locale == 'zh' ? '170px' : 'auto'"
        :label="$t('奖励过期时间:')"
        prop="expireTimeRadio"
      >
        <div style="width: 100%">
          <el-radio-group 
          v-model="state.formData.expireTimeRadio"
          :disabled="isDisabled"
          @change="handleExpireTimeRadio">
            <el-radio :label="24"> {{ $t("24小时") }} </el-radio>
            <el-radio :label="48"> {{ $t("48小时") }} </el-radio>
            <el-radio :label="-1" style="margin-right: 5px">{{
              $t("自定义")
            }}</el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
      
      <el-form-item v-if="state.formData.expireTimeRadio === -1" label-width="0px" prop="attachConfig.expireTime">
        <el-input-number
          v-model="state.formData.attachConfig.expireTime"
          style="width: 100px; margin-right: 3px"
          :controls="false"
          :precision="0"
          :min="1"
          :max="1000"
          :disabled="isDisabled"
          :placeholder="$t('过期时间')"
        />
        {{ $t("小时") }}
      </el-form-item>
    </div>
    <el-form-item :label="$t('任务开始时间:')" prop="rules_.taskBeginTime">
      <el-date-picker
        v-model="state.formData.rules_.taskBeginTime"
        type="datetime"
        value-format="YYYY-MM-DD HH:mm:ss"
        :disabled="isDisabled"
        :placeholder="$t('请选择')"
        :disabled-date="(time) => disabledDate(time)"
      />{{ $t("设置时间需在活动时间范围内") }}
    </el-form-item>
    <el-form-item :label="$t('每个任务时长（小时）:')" prop="rules_.duration" label-width="180px">
        <el-input-number
          v-model="state.formData.rules_.duration"
          style="width: 100px;"
          :controls="false"
          :precision="0"
          :min="2"
          :max="720"
          :disabled="isDisabled"
          :placeholder="$t('请输入')"
        /> 
        {{  $t("可填写2-720小时（30天）整数，设置范围需在活动结束周期以内") }}
    </el-form-item>
    <el-form-item :label="$t('任务时间间隔（分钟）:')" prop="rules_.interval" label-width="180px">
        <el-input-number
          v-model="state.formData.rules_.interval"
          style="width: 100px;"
          :controls="false"
          :precision="0"
          :min="0"
          :max="60"
          :disabled="isDisabled"
          :placeholder="$t('请输入')"
        /> 
        {{ $t("可填写0-60整数") }}
    </el-form-item>
    <div style="display: flex;padding-left: 10px;">
      <el-form-item :label="$t('游戏类型:')" prop="rules_.gameType">
          <el-select style="width: 150px" v-model="state.formData.rules_.gameType" :disabled="isDisabled" :placeholder="$t('请选择游戏类型')" clearable @change="onGameTypeChange">
              <el-option v-for="item in provideData.metaData.gameType" :key="item.type" :label="item.label" :value="+item.value" />
          </el-select>
      </el-form-item>
      <el-form-item :label="$t('游戏厂家:')" prop="rules_.vendor">
          <el-select 
          v-model="state.formData.rules_.vendor" 
          style="width: 150px" 
          clearable 
          :disabled="!state.formData.rules_.gameType || loading || isDisabled"
          :placeholder="$t('请选择游戏厂家')" 
          @change="onVendorChange">
              <el-option v-for="item in state.vendorList" :key="item.label" :label="item.label" :value="item.value" />
          </el-select>
      </el-form-item>
      <el-form-item :label="$t('游戏名称:')" prop="rules_.gIds">
          <el-select 
          v-model="state.formData.rules_.gIds" 
          style="width: 300px" 
          clearable 
          multiple
          collapse-tags
          collapse-tags-tooltip
          :disabled="!state.formData.rules_.vendor || loading || isDisabled"
          :placeholder="$t('请选择游戏厂家')" 
          >
              <el-option v-for="item in state.gameList" :key="item.id" :label="item.name" :value="item.gid" />
          </el-select>
      </el-form-item>
    </div>
    <el-card class="ticket-box" shadow="never" :header="$t('里程碑（最大配置30个）')">
      <el-table :data="state.formData.rules_.rules" border>
        <el-table-column prop="name" :label="$t('名称')">
          <template #default="{ row, $index }"> 
            <span>{{ $t('里程碑') }}{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="validCoin" :label="$t('有效投注')">
          <template #header="{ column }"> 
            <span style="color: red;">*</span>
            <span>{{ column.label }}</span>
          </template>
          <template #default="{ row, $index }"> 
            <el-form-item 
            label-width="0"
            :prop="`rules_.rules.${$index}.validCoin`"
            :rules="[{ required: true, message: $t('必填项不能为空！'), trigger: 'blur' }]"
            >
              <el-input-number
                v-model="row.validCoin"
                style="width: 100px;"
                :controls="false"
                :disabled="isDisabled"
                :precision="2"
                :min="0.01"
                :max="999999999999999"
                :placeholder="$t('有效投注金额')"
              /> 
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="minAmount" :label="$t('最低存款（周期）')">
          <template #default="{ row, $index }"> 
            <el-form-item 
            label-width="0"
            :prop="`rules_.rules.${$index}.minAmount`"
            >
              <el-input-number
                v-model="row.minAmount"
                style="width: 100px;"
                :controls="false"
                :disabled="isDisabled"
                :precision="2"
                :min="0"
                :max="999999"
                :placeholder="$t('最低存款（周期）')"
              /> 
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="rewardAmount" :label="$t('奖金')">
          <template #header="{ column }"> 
            <span style="color: red;">*</span>
            <span>{{ column.label }}</span>
          </template>
          <template #default="{ row, $index }"> 
            <el-form-item 
            label-width="0"
            :prop="`rules_.rules.${$index}.rewardAmount`"
            :rules="[{ required: true, message: $t('必填项不能为空！'), trigger: 'blur' }]"
            >
              <el-input-number
                v-model="row.rewardAmount"
                style="width: 100px;"
                :controls="false"
                :disabled="isDisabled"
                :precision="2"
                :min="0"
                :max="999999"
                :placeholder="$t('奖金')"
              /> 
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="ticketType" :label="$t('票券类型')">
          <template #default="{ row, $index }">
            <el-form-item 
            :prop="`rules_.rules.${$index}.ticketType`" 
            label-width="0">
              <el-select
                v-model="row.ticketType"
                clearable
                style="width: 120px;"
                :disabled="isDisabled"
                :placeholder="$t('票券类型')"
                @change="row.ticketId = ''"
              > 
                <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="ticketId" :label="$t('票券名称')">
          <template #default="{ row, $index }">
            <el-form-item 
            :prop="`rules_.rules.${$index}.ticketId`" 
            label-width="0">
              <el-select
              style="width: 120px;"
              :disabled="!row.ticketType && row.ticketType !== 0 || isDisabled"
              v-model="row.ticketId"
              :placeholder="$t('请选择票券')"
              >
                <el-option 
                  :disabled="ims.isDisabled" 
                  v-for="ims in provideData.getOptionData(row)" 
                  :key="ims.id" 
                  :label="ims.name"
                  :value="ims.id" />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$t('操作')">
          <template #default="{ row, $index }">
            <el-button style="width: 40px;" :disabled="isDisabled" v-throttle type="primary" @click="handleAdd($index)" :icon="Plus"></el-button>
            <el-button style="width: 40px;" :disabled="isDisabled" v-throttle v-if="state.formData.rules_.rules.length > 1" type="danger" @click="handleDel($index)" :icon="Minus"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-form-item :label="$t('前端规则说明:')" prop="attachConfig.desc">
      <el-input 
      type="textarea" 
      v-model="state.formData.attachConfig.desc" 
      :placeholder="$t('请输入规则说明')" 
      show-word-limit 
      rows="6"
      maxlength="5000"></el-input>
    </el-form-item>
    <!-- <el-form-item :label="$t('宣传图:')" prop="image">
      <UploadImage
        v-model="state.formData.image"
        :size="2048"
        :width="710"
        :height="320"
        :disabled="deployData.operationType === 2"
        :tip="$t('请上传710*320或等比例，PNG/JPG/GIF格式小于2048KB的图片')"
      >
      </UploadImage>
    </el-form-item> -->
    <!-- <el-form-item :label="$t('宣传图:')" prop="image">
        <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                :size="state.limit.size"
                :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
    </el-form-item> -->
     <el-form-item :label="$t('宣传图:')" prop="image">
          <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                  :size="state.limit.size"
                  :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
      </el-form-item>
    <el-form-item :label="$t('活动内容:')" prop="remark">
      <Tinymce
        v-model="state.formData.remark"
        v-model:isUploading="isUploading"
        :disabled="deployData.operationType === 2"
        :width="$locale == 'zh' ? 'auto' : '750px'"
      >
      </Tinymce>
    </el-form-item>
    <el-form-item :label="$t('稽核平台:')">
      <el-radio-group
        :disabled="isDisabled"
        v-model="state.formData.auditVendor"
      >
        <el-radio :label="1">{{ $t("全部平台") }}</el-radio>
        <el-radio :label="2">{{ $t("指定平台") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      class="gameVendor_row"
      label=" "
      v-if="state.formData.auditVendor == 2"
    >
      <el-tabs type="border-card">
        <el-tab-pane
          v-for="item in state.formData.auditVendorList"
          :key="item.type"
          :label="
            item.label +
            `(${item.playVendors.length}/${item.vendorList.length})`
          "
        >
          <div style="width: 100%">
            <el-checkbox
              :disabled="isDisabled"
              v-model="item.checkAll"
              :indeterminate="item.isIndeterminate"
              @change="provideData.checkAllVendor(item)"
              >{{ $t("全平台") }}</el-checkbox
            >
          </div>
          <el-checkbox-group
            :disabled="isDisabled"
            v-model="item.playVendors"
            @change="provideData.handleCheckVendor(item)"
          >
            <el-checkbox
              v-for="(its, ims) in item.vendorName"
              :key="ims"
              :label="item.vendorList[ims]"
            >
              {{ its }}</el-checkbox
            >
          </el-checkbox-group>
        </el-tab-pane>
      </el-tabs>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, inject, computed } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Minus } from "@element-plus/icons-vue"
import { deepClone } from "@/common/util/index";
import { getGameVendorList } from '@/api/common'
import { merchantVendorListApi } from '@/api/merchant_center'
import { dateFormat } from "@/common/util/index";
import userStore from '@/store/user'
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const userData = userStore()

const activityTimeValidator = (rule, value, callback) => {
  // 开始时间不能大于结束时间
  if (new Date(state.formData.beginTime) > new Date(state.formData.endTime)) {
    callback(new Error($t("开始时间不能大于结束时间")));
  } else if (new Date(state.formData.endTime) - new Date(state.formData.beginTime) > 30 * 24 * 60 * 60 * 1000) {
    callback(new Error($t("配置周期范围不可大于30天")));
  } else {
    callback();
    // 清除活动开始时间和结束时间错误信息
    formRef.value.clearValidate('formData.beginTime')
    formRef.value.clearValidate('formData.endTime')
  }
}

const taskTimeValidator = (rule, value, callback) => { 
  const valid = new Date(state.formData.rules_.taskBeginTime) >=  new Date(state.formData.beginTime) && new Date(state.formData.rules_.taskBeginTime) < new Date(state.formData.endTime)
  if (valid) {
    if (checkImageUploading(isUploading.value)) return
    callback()
  } else {
    callback(new Error($t("任务开始时间必须在活动周期内")))
  }
}

const props = defineProps({
  deployData: {
    type: Object,
    default: () => {
      return {};
    },
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  disabledDate: {
    type: Function,
    default: () => {},
  },
});

const loading = ref(false);

const state = reactive({
  oldImage: [],
  limit: {
      width: 710,
      height: 320,
      size: 2048
  },
  vendorList: [],
  formData: {
    auditVendor: 1,
    bonusType: 1,
    auditMode: 1,
    expireTimeRadio: undefined,
    rules_: {
      taskBeginTime: undefined,
      duration: undefined,
      interval: undefined,
      gameType: undefined,
      vendor: undefined,
      gIds: [],
      rules: [
        {
          validCoin: undefined,
          minAmount: undefined,
          rewardAmount: undefined,
          ticketId: undefined,
        },
      ]
    },
    attachConfig: {
      expireTime: undefined,
      desc: '',
      tags: [],
    },
  },
  rules: {
    name: { required: true, message: $t("必填项不能为空！"), trigger: "blur" },
    auditMultiple: {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change",
    },
    beginTime: [
      {
        required: true,
        message: $t("请选择活动开始时间！"),
        trigger: "change",
      },
      {
        validator: activityTimeValidator,
        trigger: "change",
      }
    ],
    endTime: [
      {
        required: true,
        message: $t("请选择活动结束时间！"),
        trigger: "change",
      },
      {
        validator: activityTimeValidator,
        trigger: "change",
      }
    ],
    image: {
      required: true,
      message: $t("宣传图不能为空！"),
      trigger: "change",
    },
    remark: {
      required: true,
      message: $t("必填项不能为空！"),
      trigger: "blur",
    },
    levelList: {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change",
    },
    expireTimeRadio: {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change",
    },
    dispatchMode: {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change",
    },
    'attachConfig.expireTime': {
      required: true,
      message: $t("必填项不能为空！"),
      trigger: "change",
    },
    'rules_.taskBeginTime': [
      {
        required: true,
        message: $t("必选项不能为空！"),
        trigger: "change",
      },
      {
        validator: taskTimeValidator,
        trigger: "change",
      }
    ],
    'rules_.duration': {
      required: true,
      message: $t("必填项不能为空！"),
      trigger: "change",
    },
    'rules_.interval': {
      required: true,
      message: $t("必填项不能为空！"),
      trigger: "change",
    },
    'rules_.gameType': {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change",
    },
  },
});
const formRef = ref(null);
const provideData = inject("provideData");

const isPPTemplate = computed(() => {
    return userData.getTemplateType() === 5
})
onMounted(() => {
  if(isPPTemplate.value) {
      state.limit.width = 656
      state.limit.height = 176
  }
  state.formData = Object.assign(state.formData, deepClone(props.deployData));
  if (props.deployData.id) {
    state.oldImage = props.deployData.image.split(',')
    if (isPPTemplate.value) {
        state.formData.image = state.oldImage[1]
    } else {
        state.formData.image = state.oldImage[0]
    }
    processState()
  }
});

const processState = () => {
  const { taskBeginTime, gameType, vendor, GIds } = state.formData.rules_
  if (taskBeginTime) {
    state.formData.rules_.taskBeginTime = dateFormat(taskBeginTime)
  }

  if (gameType) {
    getGameVendorListHandler({types: gameType})
  }

  if (vendor) {
    getGameListHandler()
  }

  if (GIds) {
    try {
      state.formData.rules_.gIds = GIds.split(',').map(item => +item)
    } catch (e) {
      state.formData.rules_.gIds = []
    }
    delete state.formData.rules_.GIds
  } else {
    state.formData.rules_.gIds = []
  }

  if (props.deployData.attachConfig) {
    try {
      state.formData.attachConfig = JSON.parse(props.deployData.attachConfig);
    } catch (e) {
      state.formData.attachConfig = {
        expireTime: undefined,
        desc: '',
        tags: [],
      }
    }
  }

  const { expireTime } = state.formData.attachConfig
  if ([24, 48].includes(expireTime) || expireTime === undefined) {
    state.formData.expireTimeRadio = expireTime;
  } else {
    state.formData.expireTimeRadio = -1;
  }
};

const onChangeDispatchMode = (val) => { 
  if (val === 2) {
    state.formData.expireTimeRadio = undefined
    state.formData.attachConfig.expireTime = undefined
  }
}

const onGameTypeChange = (val) => {
  state.formData.rules_.vendor = ''
  state.formData.rules_.gIds = []
  if (val) {
    getGameVendorListHandler({types: val})
  } else {
    state.vendorList = []
  }
};

const onVendorChange = (val) => {
  state.formData.rules_.gIds = []
  if (val) {
    getGameListHandler()
  } else {
    state.gameList = []
  }
};


const getGameVendorListHandler = (data) => { 
  loading.value = true
  getGameVendorList(data).then(res => {
    state.vendorList = res.data
  }).finally(() => {
    loading.value = false
  })
};

const getGameListHandler = () => {
  const { gameType, vendor } = state.formData.rules_
  const data = {
    types: gameType,
    aliasList: vendor,
    _page: 1,
    _size: 9999,
    site: 2,
  }
  loading.value = true
  merchantVendorListApi(data).then(res => {
    state.gameList = res.data?.list || []
  }).finally(() => {
    loading.value = false
  })
};

// 复选框勾选变化
const checkChange = (currentValue, targetKey, type) => {
  provideData.checkboxChange({
    currentValue,
    metaKey: "userLevel",
    dependData: state.formData,
    targetKey,
    indeterminateKey: "isIndeterminateLevel",
    type,
  });
};

//删除
const handleDel = (index) => {
  state.formData.rules_.rules.splice(index, 1);
};

//添加一级
const handleAdd = (index) => {
  if (state.formData.rules_.rules.length >= 30) {
    ElMessage.warning($t("最大配置30个"));
    return;
  }
  state.formData.rules_.rules.splice(index + 1, 0, {
    ticketType: 0,
    ticketId: "",
    number: undefined,
  });
};


const handleExpireTimeRadio = (val) => {
  if (val !== -1) {
    state.formData.attachConfig.expireTime = val;
  } else {
    state.formData.attachConfig.expireTime = undefined;
  }
}

const checkRules = () => {
  // 校验rules中的validCoin为升序
  let pass = true;
  for (let i = 0; i < state.formData.rules_.rules.length - 1; i++) {
    if (state.formData.rules_.rules[i].validCoin > state.formData.rules_.rules[i + 1].validCoin) {
      pass = false;
    }
  }
  return pass;
};

// 表单校验
const formValidate = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (!checkRules()) {
        ElMessage.warning($t("请按照升序填写有效投注！"));
        return
      }
      let params = deepClone(state.formData);
      processParams(params);
      const imageArry = isPPTemplate.value 
                ? [state.oldImage[0], params.image]
                : [params.image, state.oldImage[1]];
            params.image = imageArry.join(',');
      provideData.submit(params);
    } else {
      ElMessage.warning($t("请完善表单内容再进行提交！"));
    }
  });
};

const processParams = (params) => {
  params.showBeginTime = params.beginTime
  params.showEndTime = params.endTime
  const gameNames = state.gameList.filter(item => params.rules_.gIds.includes(item.gid)).map(item => item.name).join(',')
  if (gameNames.length > 500) {
    params.rules_.gameNames = gameNames.slice(0, 500) + '...'
  }else {
    params.rules_.gameNames = gameNames
  }
  params.rules_.gIds = params.rules_.gIds.join(",");
  delete params.expireTimeRadio
}

defineExpose({ valid: formValidate });
</script>

<style lang="scss" scoped>
@import "../styles/index.scss";
.activity-deploy {
  .time-box {
    display: flex;
    .stance {
      margin: 0 10px;
    }
  }
  .tips {
    color: #999;
    padding-left: 240px;
  }
  .ticket-box {
    margin-bottom: 20px;
  }
}
</style>
