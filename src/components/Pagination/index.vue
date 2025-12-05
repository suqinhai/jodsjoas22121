<template>
    <div class="pagination-wrapper">
        <div class="check-box">
            <!-- <el-checkbox v-model="checkCurrent" :label="$t('全选当前页')" size="large" @change="checkCurrentChange" /> -->
            <el-checkbox v-if="isShowChecked && isShowCheckAll" v-model="checkedAll" :label="$t('全选所有结果')" size="large" />
            <div v-if="isShowChecked" class="selected-count">{{$t('已选择')}}
                <span class="special" style="margin: 0 2px">{{ isShowCheckAll && checkedAll ? total : selectedNum }}</span>
                {{$t('条数据')}}</div>
        </div>
        <el-pagination :background="background" v-model:current-page="currentPage" v-model:page-size="pageSize" :layout="layout" :small="small"
            :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
    isShowChecked: {
        type: Boolean,
        default: false,
    },
    checkAll: {
        type: Boolean,
        default: false,
    },
    isShowCheckAll: {
        type: Boolean,
        default: false,
    },
    selectedNum: {
        type: Number,
        default: 0,
    },
    total: {
        required: true,
        type: Number,
    },
    page: {
        type: Number,
        default: 1,
    },
    limit: {
        type: Number,
        default: 10,
    },
    pageSizes: {
        type: Array,
        default() {
            return [5, 10, 20, 50, 100]
        },
    },
    layout: {
        type: String,
        default: 'total, prev, pager, next, sizes, jumper',
    },
    background: {
        type: Boolean,
        default: true,
    },
    small: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits([
    'pagination',
    'update:limit',
    'update:page',
    'update:checkAll',
])
const currentPage = computed({
    get() {
        return props.page
    },
    set(val) {
        emit('update:page', val)
    },
})
const pageSize = computed({
    get() {
        return props.limit
    },
    set(val) {
        emit('update:limit', val)
    },
})
const checkedAll = computed({
    get() {
        return props.checkAll
    },
    set(val) {
        emit('update:checkAll', val)
    },
})

const handleSizeChange = (val) => {
    if (
        (props.total > val && pageSize.value >= props.total) ||
        (props.total <= val && pageSize.value < props.total) ||
        (props.total > val && pageSize.value < props.total)
    ) {
        emit('update:page', 1)
        emit('pagination')
    }
}

const handleCurrentChange = (val) => {
    emit('pagination')
}
</script>
<style lang="scss" scoped>
.pagination-wrapper {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;

    ::v-deep(.el-pagination__sizes) {
        margin-left: 10px;
        margin-right: -6px;
    }

    .check-box {
        display: flex;

        .selected-count {
            width: fit-content;
            flex-shrink: 1;
            padding: 0 20px;
            color: #606266;
            line-height: 39px;
        }
    }
}
</style>
