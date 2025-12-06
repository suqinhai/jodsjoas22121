<template>
    <div class="tags" v-if="tags.show">
        <el-scrollbar class="tabScroll">
            <div class="scrollbar-flex-content">
                <div v-for="(item, index) in tags.list" :key="index" class="tags-li" :class="{ active: isActive(item.path, index) }" ref="tag">
                    <router-link :to="item.fullPath" class="tags-li-title">{{ item.title }}</router-link>
                    <el-icon @click="closeTags(index)">
                        <Close />
                    </el-icon>
                </div>
            </div>
        </el-scrollbar>
        <div class="tags-close-box">
            <el-dropdown @command="handleTags">
                <el-button v-throttle size="small" type="primary">{{$t('标签选项')}}<el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu size="small">
                        <el-dropdown-item command="other">{{$t('关闭其他')}}</el-dropdown-item>
                        <el-dropdown-item command="all">{{$t('关闭所有')}}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
import useTagsStore from '@/store/tags'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import userStore from '@/store/user'
import { findPathInList, findFirstMenuPage, apiRouteName } from '@/common/util'
import { EXTRA_PAGE_PATH } from '@/common/util/appConfig.js'

const route = useRoute()
const router = useRouter()
const userData = userStore()
const tags = useTagsStore()
const activeIndex = ref(null)
const tag = ref(null)
const first = ref(true)

const isActive = (path, index) => {
    activeIndex.value = index
    return path === route.path
}

watch(
    () => userData.menuList,
    (val) => {
        if (first.value) { //确保只执行一次
            first.value = false
            setTags(route)
        }
    },
    { deep: true },
)

watch(route, (newVal) => {
    let index = tags.list.findIndex(item => item.path === newVal.path)
    if (index === -1) return setTags(newVal)
    let tagsDom = document.querySelector('.tabScroll').querySelector('.el-scrollbar__wrap')
    let width = tagsDom.clientWidth - document.querySelectorAll('.tags-li')[index].clientWidth
    let currentLeft = tagsDom.scrollLeft
    let targetLeft = tag.value[index].offsetLeft - width / 2 > 0 ? tag.value[index].offsetLeft - width / 2 : 0
    if (targetLeft > currentLeft) {
        let timer = setInterval(() => {
            if (targetLeft > currentLeft) {
                currentLeft = currentLeft + 5
                tagsDom.scrollLeft = currentLeft
            } else {
                clearInterval(timer)
            }
        })
    } else {
        let timer = setInterval(() => {
            if (targetLeft < currentLeft) {
                currentLeft = currentLeft - 5
                tagsDom.scrollLeft = currentLeft
            } else {
                clearInterval(timer)
            }
        })
    }
})

// 关闭单个标签
const closeTags = (index) => {
    const delItem = tags.list[index]
    tags.delTagsItem(index)
    const item = tags.list[index] ? tags.list[index] : tags.list[index - 1]
    if (item) {
        delItem.path === route.path && router.push(item.fullPath)
    } else {
        let path = findFirstMenuPage(userData.menuList) || '/'
        if (path === delItem.path) {
            delItem.title = apiRouteName(delItem)
            tags.setTagsItem(delItem)
        } else {
            router.push(path)
        }
    }
}

// 设置标签
const setTags = (route) => {
    if (!findPathInList(userData.menuList, route.path) && !EXTRA_PAGE_PATH.includes(route.path)) return
    let isExist = false
    tags.list.forEach((item) => {
        if (item.path === route.path) {
            item.fullPath = route.fullPath
            isExist = true
        }
    })
    if (!isExist) {
        if (tags.list.length >= 8) tags.delTagsItem(0)
        tags.setTagsItem({
            name: route.name,
            title: apiRouteName(route),
            path: route.path,
            fullPath: route.fullPath,
        })
    }
}

onBeforeRouteUpdate(to => {
    setTags(to)
})

// 关闭全部标签
const closeAll = () => {
    tags.clearTags()
    let path = findFirstMenuPage(userData.menuList) || '/'
    router.push(path)
}

// 关闭其他标签
const closeOther = () => {
    const curItem = tags.list.filter(item => {
        return item.path === route.path
    })
    tags.closeTagsOther(curItem)
}

const handleTags = (command) => {
    command === 'other' ? closeOther() : closeAll()
}
</script>

<style lang='scss' scoped>
.tags {
    position: relative;
    height: 30px;
    overflow: hidden;
    background: var(--app-tags-bg, #ffffff);
    padding-right: 120px;
    box-shadow: 0 5px 10px rgba(245, 158, 11, 0.1);
    border-bottom: 1px solid var(--app-tags-border, #fde68a);

    .el-scrollbar {
        box-sizing: border-box;
        width: 100%;
        height: 100%;

        .scrollbar-flex-content {
            display: flex;

            .tags-li {
                flex: none;
                display: flex;
                align-items: center;
                float: left;
                margin: 3px 5px 2px 3px;
                border-radius: 3px;
                font-size: 12px;
                overflow: hidden;
                cursor: pointer;
                height: 23px;
                border: 1px solid var(--app-tags-border, #fde68a);
                background: var(--app-tags-item-bg, #ffffff);
                padding: 0 5px 0 12px;
                color: #666;

                &:not(.active):hover {
                    background: #fef3c7;
                    border-color: #fbbf24;
                }

                &.active {
                    color: var(--app-tags-item-active-text, #ffffff);
                    border: 1px solid var(--app-tags-item-active-bg, #f59e0b);
                    background-color: var(--app-tags-item-active-bg, #f59e0b);

                    .tags-li-title {
                        color: var(--app-tags-item-active-text, #ffffff);
                    }
                }

                &-title {
                    float: left;
                    max-width: 100px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    margin-right: 5px;
                    color: #666;
                }
            }
        }
    }

    &-close-box {
        position: absolute;
        right: 0;
        top: 0;
        box-sizing: border-box;
        padding-top: 1px;
        text-align: center;
        width: 110px;
        height: 30px;
        background: var(--app-tags-bg, #ffffff);
        box-shadow: -3px 0 15px 3px rgba(245, 158, 11, 0.1);
        z-index: 10;

        :deep(.el-button--primary) {
            background-color: var(--el-color-primary);
            border-color: var(--el-color-primary);
            color: #1a0f05;

            &:hover {
                background-color: var(--el-color-primary-dark-2);
                border-color: var(--el-color-primary-dark-2);
            }
        }
    }
}
</style>
