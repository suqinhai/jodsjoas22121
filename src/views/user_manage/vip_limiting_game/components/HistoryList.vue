
<template>
  <!-- VIP等级额度上限操作记录列表 -->
  <div class="container History">
    <el-form class="filter-form" inline :model="state.formData">
      <el-form-item :label="$t('当前站点:')" v-if="commonData.merchantSiteList.length > 1">
          <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId" @change="fetchData('search')">
          </MerchantSiteSelect>
      </el-form-item>
      <el-form-item :label="$t('操作时间:')">
         <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('会员ID:')">
        <el-input 
          @input="(val) => state.formData.userId = val.replace(/\D/g, '')" 
          v-model="state.formData.userId" 
          :placeholder="$t('请输入会员ID')" 
        />
      </el-form-item>
      <el-form-item :label="$t('会员账号:')">
        <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
      </el-form-item>
      <el-form-item :label="$t('vip等级:')">
        <el-select class="select-box" v-model="state.formData.level" clearable :placeholder="$t('vip等级')">
          <el-option v-for="item in userLevel" :key="item.value" :label="item.label" :value="+item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('状态:')">
        <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('状态')">
          <el-option v-for="item in state.statusList" :key="item.value" :label="item.label" :value="+item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">{{$t('搜 索')}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle @click="handleReset">{{$t('重 置')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table class="table-box" :data="state.tableData" border ref="tableRef">
      <el-table-column prop="triggerTime" :label="$t('触发时间')" min-width="160" align="center">
        <template #default="{ row }">
          {{ row.triggerTime || '' }}
        </template> 
      </el-table-column>
      <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
      <el-table-column :label="$t('会员ID')" min-width="120" align="center">
        <template #default="{ row }">
          <span class="special pointer" @click="showMemberDetail(row.user?.id)">{{ row.user?.id || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('会员账号')" min-width="140" align="center">
        <template #default="{ row }">
          <span class="special pointer" @click="showMemberDetail(row.user?.id)">{{ row.user?.name || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('vip等级')" min-width="140" align="center">
        <template #default="{ row }">
          <span>{{ $t('VIP') }} {{ row.level || 0 }}</span>
        </template>
      </el-table-column> 
      <el-table-column prop="balance" :label="$t('当前余额')" min-width="120" align="center" />
      <el-table-column prop="status" :label="$t('状态')" min-width="160" align="center">
        <template #default="{ row }">
          <span>{{ getStatusText(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作人')" min-width="140" align="center">
        <template #default="{ row }">
          <span>{{ row.emp?.name || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="addTime" :label="$t('操作时间')" min-width="160" align="center">
        <template #default="{ row }">
          {{ row.addTime ? dateFormat(row.addTime) : '' }}
        </template> 
      </el-table-column>
    </el-table>
    <Pagination 
      v-show="state.total > 0" 
      :total="state.total" 
      v-model:page="state.listQuery._page" 
      v-model:limit="state.listQuery._size"
      @pagination="fetchData"
    />
  </div>
</template>

<script setup name="VipLimitingHistoryList">
import { reactive, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getLimitLogList } from '@/api/member';
import commonStore from '@/store/common'
import { dateFormat, getShortcuts, getTimeRange, deepClone, disabledCurrentDateAfter } from '@/common/util'

const props = defineProps({
  userLevel: {
    type: Array,
    default: () => [],
  },
});
let shortcuts = getShortcuts()
const tableRef = ref();
const commonData = commonStore()
const state = reactive({
  formData: {},
  tableData: [],
  total: 0,
  listQuery: {
    _page: 1,
    _size: 10,
  },
  statusList: [
    {
      label: $t('全部'),
      value: ''
    },
    {
      label: $t('正常'),
      value: 1
    },
    {
      label: $t('踢下线并禁止进入游戏'),
      value: 0
    }
  ],
});


const dateShortcuts = [
  { 
    text: $t('近7天'), 
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    } 
  },
  { 
    text: $t('近30天'), 
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    } 
  },
];

const getStatusText = (status) => {
  return status === 1 ? $t('正常') : $t('踢下线并禁止进入游戏');
};

const fetchData = async (resetPage = false) => {
  if (resetPage) {
    state.listQuery._page = 1;
  }
  
  try {
    globalVBus.$emit('globalLoading', true);
    const params = { ...state.formData, ...state.listQuery };
     let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    const res = await getLimitLogList(params);
    if (res.data && res.data.list) {
      // res.data.list.forEach((item)=>{
      //   item.merchantId = state.formData.merchantId
      // })
      state.tableData = res.data.list.map(item => ({
        ...item,
        triggerTime: item.triggerTime ? dateFormat(item.triggerTime) : '',
      }));
      state.total = res.data.total || 0;
    } else {
      state.tableData = [];
      state.total = 0;
    }
  } catch (error) {
    state.tableData = [];
    state.total = 0;
  } finally {
    globalVBus.$emit('globalLoading', false);
  }
};

const handleSearch = () => {
  fetchData(true);
};

const handleReset = () => {
  state.formData = {
    merchantId: 0
  };
  fetchData(true);
};

const showMemberDetail = (userId) => {
  if (!userId) {
    ElMessage.warning($t('会员ID无效'));
    return;
  }
  globalVBus.$emit('memberDetailDialog', userId);
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss">
.History {
  .operate {
    margin-left: 20px;
  }
  
  .item-row {
    display: flex;
    align-items: center;
    justify-self: start;
  }
  
  .tips-w {
    margin-bottom: 15px;
  }
  
  .all-page {
    position: relative;
    color: #909399;
    font-weight: 600;
    z-index: 100;
    
    .active-page {
      position: absolute;
      bottom: -30px;
      left: 40px;
      color: #909399;
      font-weight: 600;
    }
  }
}
</style>
