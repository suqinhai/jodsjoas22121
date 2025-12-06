<template>
    <el-select :popper-append-to-body="false" v-model="state.selectValue" :placeholder="placeholder" :filterable="state.isFilterable"
        :clearable="clearable" :disabled="disabled" :multiple="multiple" :reserve-keyword="reserveKeyword" :collapse-tags="collapseTags"
        @change="selectChange" style="min-width:120px;">
        <template v-if="!isCanClassify || !isClassify">
            <el-option v-if="isShowAll" :label="$t('全部站点')" :value="allValue" />
            <el-option :disabled="isDisabled || item.disabled" v-for="item in showData" :key="item.id"
                :label="item.name + (isShowId ? `（ID：${item.id}）` : '')" :value="item.id" />
        </template>
        <template v-else>
            <el-option v-if="isShowAll" :label="$t('全部站点')" :value="allValue" />
            <el-option-group v-for="group in showData" :key="group.label" :label="group.label">
                <el-option :disabled="optionDisabled(group.options) || its.disabled" v-for="its in group.options" :key="its.id"
                    :label="its.name + (isShowId ? `（ID：${its.id}）` : '')" :value="its.id" />
            </el-option-group>
        </template>
    </el-select>
</template>
<script setup>
import { watch, reactive, nextTick, onMounted, computed } from 'vue'
import commonStore from '@/store/common'
import userStore from '@/store/user'
const userData = userStore()

const props = defineProps({
    modelValue: {
        default: ''
    },

    optionData: {
        default: () => []
    },

    // 填充提示文案
    placeholder: {
        type: String,
        default: $t('请选择站点')
    },

    // 是否展示所有
    isShowAll: {
        type: Boolean,
        default: false
    },

    // 展示所有选项的值
    allValue: {
        type: Number,
        default: 0
    },

    // 是否可删除
    clearable: {
        type: Boolean,
        default: true
    },

    // 是否可多选
    multiple: {
        type: Boolean,
        default: false
    },

    // 多选时是否将选中值按文字的形式展示
    collapseTags: {
        type: Boolean,
        default: false
    },

    // 多选、可搜索时，选中一个选项后是否保留当前的搜索关键词
    reserveKeyword: {
        type: Boolean,
        default: false
    },

    // 是否需要默认值
    isNeedDefault: {
        type: Boolean,
        default: false
    },

    // 是否展示ID
    isShowId: {
        type: Boolean,
        default: true
    },

    // 是否禁用
    disabled: {
        type: Boolean,
        default: false
    },

    // 是否分类
    isClassify: {
        type: Boolean,
        default: true
    },

    // 是否不能跨越皮肤模版类型多选
    noStraddleType: {
        type: Boolean,
        default: false
    },
})
const emits = defineEmits(['update:modelValue', 'change', 'getchange'])
const state = reactive({
    selectValue: '',
    isSelect: false,
    isFilterable: false
})
const commonData = commonStore()

const showData = computed(() => {
    return (props.optionData && props.optionData.length ? !props.isClassify || !isCanClassify.value ? props.optionData : [
        {
            label: $t('普通皮肤模版站点'),
            options: props.optionData.filter(item => !item.custom)
        },
        {
            label: $t('C版皮肤模版站点'),
            options: props.optionData.filter(item => item.custom)
        }
    ] : !isCanClassify.value ? commonData.merchantSiteList : [
        {
            label: $t('普通皮肤模版站点'),
            options: commonData.merchantSiteList.filter(item => !item.custom)
        },
        {
            label: $t('C版皮肤模版站点'),
            options: commonData.merchantSiteList.filter(item => item.custom)
        }
    ])
})
const isDisabled = computed(() => {
    if (props.multiple && state.selectValue.length && props.isShowAll) {
        return state.selectValue.includes(props.allValue)
    } else {
        return false
    }
})
const isCanClassify = computed(() => {
    if (props.optionData && props.optionData.length && props.isClassify) return props.optionData.some(item => item.custom) && props.optionData.some(item => !item.custom)
    if (!props.optionData || !props.optionData.length) return commonData.merchantSiteList.some(item => item.custom) && commonData.merchantSiteList.some(item => !item.custom)
    return false
})

watch(
    () => props.modelValue,
    (newValue) => {
        state.isSelect = false
        state.selectValue = newValue
        nextTick(() => {
            state.isSelect = true
        })
    },
    { immediate: true }
)

onMounted(() => {
    if ((props.multiple && !props.modelValue.length) || (!props.multiple && !props.modelValue)) {
        if (props.multiple) state.selectValue = []
        if (!props.modelValue && showData.value[0] && props.isNeedDefault) {
            if (props.isShowAll) {
                state.selectValue = props.multiple ? [props.allValue] : props.allValue
            } else {
                if (isCanClassify.value) {
                    state.selectValue = props.multiple ? [showData.value[0].options[0].id] : showData.value[0].options[0].id
                } else {
                    state.selectValue = props.multiple ? [showData.value[0].id] : showData.value[0].id
                }
            }
            emits('update:modelValue', state.selectValue)
        }
    }
    emits('getchange', findSelectedItem(state.selectValue))
    nextTick(() => {
        state.isFilterable = true
    })
})

const optionDisabled = (options) => {
    if (props.multiple && state.selectValue.length) {
        if (props.isShowAll) {
            return state.selectValue.includes(props.allValue)
        } else {
            return !options.some(item => state.selectValue.includes(item.id)) && props.noStraddleType
        }
    } else {
        return false
    }
}
const findSelectedItem = (val) => {
    if (props.multiple) {
    return val.map(id => {
        if (props.isShowAll && id === props.allValue) return { id, name: $t('全部站点') }
        if (!isCanClassify.value || !props.isClassify) {
            return showData.value.find(item => item.id === id)
        }
        for (const group of showData.value) {
            const item = group.options.find(opt => opt.id === id)
            if (item) return item
        }
        return null
    }).filter(Boolean)
    } else {
        if (props.isShowAll && val === props.allValue) return { id: val, name: $t('全部站点') }
        if (!isCanClassify.value || !props.isClassify) {
            return showData.value.find(item => item.id === val)
        }
        for (const group of showData.value) {
            const item = group.options.find(opt => opt.id === val)
            if (item) return item
        }
        return null
    }
}
const selectChange = (val) => {
    if (!state.isSelect) return
    if (props.multiple && props.isShowAll && val && val.length > 1 && val.includes(0)) {
        state.selectValue = [props.allValue]
    }
    emits('update:modelValue', state.selectValue)
    emits('change', state.selectValue)
    const selectedItems = findSelectedItem(state.selectValue)
    emits('getchange', selectedItems)
    userData.setTemporaryTemplate(selectedItems)
    
}
</script>
<style lang="scss">
</style>
