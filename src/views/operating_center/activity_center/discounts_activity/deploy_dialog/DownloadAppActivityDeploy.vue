<template>
  <!-- 运营中心-优惠活动列表-活动配置弹窗-下载APP活动 -->
  <el-form
    :model="state.formData"
    ref="formRef"
    :rules="state.rules"
    :disabled="deployData.operationType === 2"
    class="activity-deploy"
    :label-width="$locale == 'zh' ? '112px' : 'auto'"
  >
    <el-form-item :label="$t('活动名称:')" prop="name">
      <el-input
        style="width: 100%"
        v-model="state.formData.name"
        :placeholder="$t('请输入活动名称')"
      />
    </el-form-item>
    <el-form-item :label="$t('活动时间:')" >
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
            :default-time="new Date(2000, 0, 0, 23, 59, 59)"
          >
          </el-date-picker>
        </el-form-item>
      </div>
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
            :precision="0"
            :controls="false"
            :placeholder="$t('请输入稽核倍数')"
          />
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

    <el-form-item :label="$t('参与条件:')" prop="conditions">
      <el-checkbox-group v-model="state.formData.conditions" :disabled="isDisabled">
        <el-checkbox label="bindWithdrawalAccount">{{ $t("绑定任一出款账号") }}</el-checkbox>
        <el-checkbox label="bindRealName">{{ $t("真实姓名") }}</el-checkbox>
        <el-checkbox label="bindPhone">{{ $t("手机号码") }}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <div style="display: flex;">
      <el-form-item
        v-if="provideData.isCustomize()"
        :label-width="$locale == 'zh' ? '112px' : 'auto'"
        :label="$t('奖励过期时间:')"
        prop="expireTimeRadio"
      >
        <div style="width: 100%">
          <el-radio-group 
          v-model="state.formData.expireTimeRadio"
          @change="handleExpireTimeRadio">
            <el-radio :label="24"> {{ $t("24小时") }} </el-radio>
            <el-radio :label="48"> {{ $t("48小时") }} </el-radio>
            <el-radio :label="-1" style="margin-right: 5px">{{
              $t("自定义")
            }}</el-radio>
          </el-radio-group>
        </div>
        <!-- <div style="color: red">{{$t('注：可设置时间，需为活动结束时间内。')}}</div> -->
      </el-form-item>
      
      <el-form-item v-if="state.formData.expireTimeRadio === -1" label-width="0px" prop="rules_.expireTime">
        <el-input-number
          v-model="state.formData.rules_.expireTime"
          style="width: 100px; margin-right: 3px"
          :controls="false"
          :precision="0"
          :min="1"
          :max="1000"
          :placeholder="$t('过期时间')"
        />
        {{ $t("小时") }}
      </el-form-item>
    </div>

    <div class="reward">
      <div class="tips">{{ $t("注：满足发放条件后，可在奖励中心领取") }}</div>
      <div class="title" :style="{width: $locale == 'zh' ? '112px' : 'auto'}">{{ $t("奖励配置") }}</div>
      <div class="reward-box">
        <el-form-item :label="$t('金额:')" prop="rules_.reward">
          <el-input-number
            v-model="state.formData.rules_.reward"
            :controls="false"
            :precision="2"
            :min="0"
            :max="99999"
          />
        </el-form-item>
        <el-form-item :label="$t('票券:')" prop="rules_.ticketId">
          <el-select
            v-model="state.formData.rules_.ticketType"
            clearable
            :placeholder="$t('票券类型')"
            @change="state.formData.rules_.ticketId = ''"
          >
            <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
          </el-select>
          <el-select
            :disabled="!state.formData.rules_.ticketType && state.formData.rules_.ticketType !== 0"
            class="ml20"
            v-model="state.formData.rules_.ticketId"
            :placeholder="$t('请选择票券')"
          >
            <el-option 
              :disabled="ims.isDisabled" 
              v-for="ims in provideData.getOptionData(state.formData.rules_)" 
              :key="ims.id" 
              :label="ims.name"
              :value="ims.id" />
          </el-select>
        </el-form-item>
      </div>
    </div>

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
    <el-form-item :label="$t('宣传图:')" prop="image">
            <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                    :size="state.limit.size"
                    :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
        </el-form-item>
    <el-form-item :label="$t('规则说明:')" prop="remark">
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
import { deepClone } from "@/common/util/index";
import userStore from '@/store/user'
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const userData = userStore()

const conditionMap = {
  1: 'bindWithdrawalAccount',
  2: 'bindRealName',
  3: 'bindPhone',
  bindWithdrawalAccount: 1,
  bindRealName: 2,
  bindPhone: 3,
};

const conditionKeys = ['bindWithdrawalAccount', 'bindRealName', 'bindPhone'];

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

const state = reactive({
  oldImage: [],
  limit: {
      width: 710,
      height: 320,
      size: 2048
  },
  formData: {
    auditVendor: 1,
    conditions: [],
    expireTimeRadio: undefined,
    rules_: {
      expireTime: undefined,
      reward: undefined,
      ticketType: 0,
      ticketId: "",
    },
    attachConfig: {
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
    beginTime: {
      required: true,
      message: $t("请选择活动开始时间！"),
      trigger: "change",
    },
    endTime: {
      required: true,
      message: $t("请选择活动结束时间！"),
      trigger: "change",
    },
    showBeginTime: {
      required: true,
      message: $t("请选择开始展示时间！"),
      trigger: "change",
    },
    showEndTime: {
      required: true,
      message: $t("请选择结束展示时间！"),
      trigger: "change",
    },
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
    "expireTimeRadio": {
      required: true,
      message: $t("必选项不能为空"),
      trigger: "change",
    },
    'rules_.reward': {
      required: true,
      message: $t("必填项不能为空！"),
      trigger: "change",
    },
    'rules_.expireTime': {
      required: true,
      message: $t("必填项不能为空！"),
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
  const { 
    expireTime,
    ticketId, 
    ticketName,
  } = state.formData.rules_;

  if ([24, 48].includes(expireTime)) {
    state.formData.expireTimeRadio = expireTime;
  } else {
    state.formData.expireTimeRadio = -1;
  }
  if (!ticketId || !ticketName) {
    state.formData.rules_.ticketType = 0
    state.formData.rules_.ticketId = ''
  }

  conditionKeys.forEach((key) => {
    if (state.formData.rules_[key]) {
      state.formData.conditions.push(key);
    }
  });
  if (props.deployData.attachConfig) {
    try {
      state.formData.attachConfig = JSON.parse(props.deployData.attachConfig);
    } catch (e) {
      state.formData.attachConfig = { tags: [] };
    }
  }
};

const handleExpireTimeRadio = (val) => {
  if (val !== -1) {
    state.formData.rules_.expireTime = val;
  } else {
    state.formData.rules_.expireTime = undefined;
  }
};

// 表单校验
const formValidate = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (checkImageUploading(isUploading.value)) return
      let params = deepClone(state.formData);
      processParams(params)
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
  if (!params.rules_.ticketId) {
    delete params.rules_.ticketType;
    delete params.rules_.ticketId;
    delete params.rules_.ticketName;
  }

  conditionKeys.forEach((key) => {
    if (params.conditions.includes(key)) {
      params.rules_[key] = true;
    } else {
      params.rules_[key] = false;
    }
  });
  delete params.expireTimeRadio;
  delete params.conditions;
};

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
  .reward {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
    .tips {
      font-size: 14px;
      color: #606266;
      font-weight: 700;
      margin-bottom: 8px;
      padding-left: 56px;
      margin-bottom: 30px;
    }
    .title {
      text-align: right;
      font-size: 14px;
      color: #606266;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .reward-box {
      display: flex;
    }
    .ml20 {
      margin-left: 20px;
    }
  }
}
</style>
