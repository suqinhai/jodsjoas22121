<template>
  <!-- 运营中心-优惠活动列表-活动配置弹窗-登录活动 -->
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
            :default-time="new Date(2000, 0, 0, 23, 59, 59)"
          >
          </el-date-picker>
        </el-form-item>
      </div>
    </el-form-item>
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
          >{{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <div style="display: flex;">
      <el-form-item :label-width="$locale == 'zh' ? '240px' : 'auto'" :label="$t('单一玩家奖励次数上限:')"  prop="rewardsLimitOption">
        <el-select
          v-model="state.formData.rewardsLimitOption"
          :placeholder="$t('请选择')"
          @change="$event => handleLimitChange($event, 'rewardsLimit')"
        >
          <el-option :label="$t('无限制')" :value="0" />
          <el-option :label="$t('自定义')" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="state.formData.rewardsLimitOption === 1" label-width="0px" prop="rules_.rewardsLimit">
        <el-input-number
          v-model="state.formData.rules_.rewardsLimit"
          :controls="false"
          :precision="0"
          :min="1"
          :max="100"
          style="width: 100px; margin-left: 10px"
        />
        {{ $t("次") }}
      </el-form-item>  
    </div>
    <div style="display: flex;">
      <el-form-item
      :label-width="$locale == 'zh' ? '240px' : 'auto'"
      :label="$t('单一玩家领取间隔限制（小时）:')"
      prop="timeIntervalOption"
      >
        <el-select
          v-model="state.formData.timeIntervalOption"
          :placeholder="$t('请选择')"
          @change="$event => handleLimitChange($event, 'timeInterval')"
        >
          <el-option :label="$t('无限制')" :value="0" />
          <el-option :label="$t('自定义')" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="state.formData.timeIntervalOption === 1" label-width="0" prop="rules_.timeInterval">
        <el-input-number
          v-model="state.formData.rules_.timeInterval"
          :controls="false"
          :precision="0"
          :min="1"
          :max="24"
          style="width: 100px; margin-left: 10px"
        />
        {{ $t("小时") }}
      </el-form-item>
    </div>
    <div class="tips">
      {{ $t('领取限制:※玩家须完成票券任务与领取票券奖励后,同时符合次数上限、间隔时数,方能于登入时领取新一轮的奖励内容') }}
    </div>
    <div class="ticket-box">
      <el-form-item :label="$t('奖励票券（触发票券最大上限10张）:')" :label-width="$locale == 'zh' ? '250px' : 'auto'" />
      <div
        v-for="(item, index) in state.formData.rules_.tiers"
        :key="item"
        class="row-box"
      >
        <div class="ticket-item">
          <el-form-item 
          label-width="20px" 
          :prop="`rules_.tiers.${index}.ticketType`"
          :rules="[{ required: true, message: $t('请选择！'), trigger: 'change' }]"
          >
            <el-select
              style="width: 120px"
              :disabled="isDisabled"
              v-model="item.ticketType"
              :placeholder="$t('票券类型')"
              @change="item.ticketId = ''"
            >
              <el-option
                v-for="ims in provideData.metaData.ticketType"
                :key="ims.value"
                :label="ims.label"
                :value="+ims.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item 
          label-width="20px" 
          :prop="`rules_.tiers.${index}.ticketId`"
          :rules="[{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }]">
            <el-select
              style="width: 180px"
              :disabled="isDisabled"
              filterable
              clearable
              v-model="item.ticketId"
              :placeholder="$t('请选择票券')"
            >
              <el-option
                :disabled="ims.isDisabled"
                v-for="ims in provideData.getOptionData(item)"
                :key="ims.id"
                :label="ims.name"
                :value="ims.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label-width="20px"
            :prop="`rules_.tiers.${index}.number`"
            :rules="[{ required: true, message: $t('必填项不能为空！'), trigger: 'blur' }]">
            <el-input-number
              :disabled="isDisabled"
              v-model="item.number"
              :controls="false"
              :precision="0"
              :min="1"
              :max="10"
              style="width: 60px"
            />
            <span class="ml8">{{ $t('张每人') }}</span>
          </el-form-item>
        </div>
        <div class="operate">
          <el-button
            :disabled="isDisabled"
            v-throttle
            type="primary"
            @click="handleAdd(index)"
            :icon="Plus"
          >
          </el-button>
          <el-button
            :disabled="isDisabled"
            v-throttle
            v-if="state.formData.rules_.tiers.length > 1"
            type="danger"
            @click="handleDel(index)"
            :icon="Minus"
          >
          </el-button>
        </div>
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
  </el-form>
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, inject, computed } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Minus } from "@element-plus/icons-vue"
import { deepClone } from "@/common/util/index";
import userStore from '@/store/user'
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const userData = userStore()

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
    rules_: {
      rewardsLimit: undefined,
      timeInterval: undefined,
      tiers: [ // 票券列表
        {
          "number": undefined, // 票券数量
          "ticketId": undefined // 票券ID
        }
      ]
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
    levelList: {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change",
    },
    rewardsLimitOption: {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change"
    },
    timeIntervalOption: {
      required: true,
      message: $t("必选项不能为空！"),
      trigger: "change"
    },
    'rules_.rewardsLimit': {
      required: true,
      message: $t("必填项不能为空！"),
      trigger: "blur",
    },
    'rules_.timeInterval': {
      required: true,
      message: $t("必填项不能为空！"),
      trigger: "blur",
    }
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
  state.formData.rules_?.tiers.forEach((item) => {
    if (!item.ticketId) {
      item.ticketType = 0;
      item.ticketId = "";
    }
  });
  if (props.deployData.attachConfig) {
    try {
      state.formData.attachConfig = JSON.parse(props.deployData.attachConfig);
    } catch (e) {
      state.formData.attachConfig = { tags: [] };
    }
  }

  if (props.deployData.rules_.rewardsLimit > 0) {
    state.formData.rewardsLimitOption = 1;
  } else {
    state.formData.rewardsLimitOption = 0;
  }

  if (props.deployData.rules_.timeInterval > 0) {
    state.formData.timeIntervalOption = 1;
  } else {
    state.formData.timeIntervalOption = 0;
  }
};

const handleLimitChange = (val, type) => {
  if (val === 1) {
    state.formData.rules_[type] = undefined;
  } else {
    state.formData.rules_[type] = 0;
  }
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
  state.formData.rules_.tiers.splice(index, 1);
};

//添加一级
const handleAdd = (index) => {
  if (!checkTicketNum()) {
    return;
  }
  state.formData.rules_.tiers.splice(index + 1, 0, {
    ticketType: 0,
    ticketId: "",
    number: undefined,
  });
};

const checkTicketNum = () => {
  const ticketNum = state.formData.rules_.tiers.reduce((total, item) => {
    return total + (item.number || 0);
  }, 0)
  if (ticketNum > 10) {
    ElMessage.warning($t("最多添加10张票券"));
    return false;
  }
  if (ticketNum === 0) {
    ElMessage.warning($t("请添加票券"));
    return false;
  }
  return true;
}

// 表单校验
const formValidate = () => {
  formRef.value.validate((valid) => {
    if (!checkTicketNum()) return
    if (valid) {
      if (checkImageUploading(isUploading.value)) return
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
  params.rules_.tiers = params.rules_.tiers.filter((item) => {
    return item.ticketId;
  });
  params.showBeginTime = params.beginTime
  params.showEndTime = params.endTime
  delete params.rewardsLimitOption
  delete params.timeIntervalOption
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
    .row-box {
      display: flex;
      margin-left: 93px;
      .ticket-item {
        display: flex;
        .ml8 {
          margin-left: 8px;
        }
      }
      .operate {
        display: flex;
        margin-left: 20px;
        button {
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
