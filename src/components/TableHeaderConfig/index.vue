<template>
    <!-- 自定表格表头 -->
    <Dialog ref="dialog" width="500" :title="$t('自定义列')" top="10vh" :otherActions="[$t('重置')]" @confirm="handleSubmit(operateForm)" @cancel="cancel"
        @otherEvent="otherEvent">
        <div class="table-header-config">
            <div class="tips">{{$t('勾选需要展示的列，拖动列名进行排序')}}</div>
            <el-tree ref="treeRef" :data="state.dataList" draggable show-checkbox :default-checked-keys="state.defaultKeyData" node-key="value"
                :props="propsData" highlight-current :allow-drag="allowDrag" :allow-drop="allowDrop" @node-drop="handleDrop" />
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { postTableHeaderConfig } from '@/api/common'
import { deepClone } from '@/common/util'

const emits = defineEmits(['refreshConfig', 'close'])
const props = defineProps({
    menuId: {
        default: ''
    },
    type: {
        default: ''
    },
    tableConfigData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    tableHeaderTitle: {
        type: Array,
        default: () => {
            return []
        }
    },
    disabledCancelKey: {
        type: Array,
        default: () => {
            return []
        }
    },
    disabledSortKey: {
        type: Array,
        default: () => {
            return []
        }
    },
})
const dialog = ref(null)
const treeRef = ref(null)
const state = reactive({
    dataList: [],
    defaultKeyData: [],
})
const propsData = {
    disabled: 'disabled',
}

onMounted(() => {
    state.dataList = props.tableConfigData.all.map(item => {
        let obj = props.tableHeaderTitle.find(its => item === its.value)
        return {
            ...obj,
            disabled: props.disabledSortKey.includes(item) || props.disabledCancelKey.includes(item)
        }
    })
    state.defaultKeyData = deepClone(props.tableConfigData.checked)
})

const allowDrag = (e) => {
    return !props.disabledSortKey.includes(e.data.value)
}

const allowDrop = (e, dropNode, type) => {
    return type !== 'inner' && !props.disabledSortKey.includes(dropNode.data.value)
}

const handleDrop = (e) => {
    treeRef.value.setChecked(e.data.value, e.checked)
}

const otherEvent = () => {
    state.dataList = props.tableConfigData.all.map(item => {
        let obj = props.tableHeaderTitle.find(its => item === its.value)
        return {
            ...obj,
            disabled: props.disabledSortKey.includes(item) || props.disabledCancelKey.includes(item)
        }
    })
    treeRef.value.setCheckedKeys(props.tableConfigData.checked, true)
}

const handleSubmit = (el) => {
    let checkKeyData = treeRef.value.getCheckedNodes()
    let obj = {
        all: state.dataList.map(item => item.value),
        checked: checkKeyData.map(item => item.value)
    }
    dialog.value.showLoading()
    postTableHeaderConfig({ titles: JSON.stringify(obj), menuId: props.menuId, type: props.type }).then(res => {
        cancel()
        emits('refreshConfig')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
.table-header-config {
    .tips {
        color: #888;
        margin-bottom: 10px;
    }
}
</style>
