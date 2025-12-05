<template>
    <!-- 网站前台配置引导 -->
    <div class="container web-config-guide">
        <el-table :data="tableData" style="width: 800px" border>
            <el-table-column prop="id" :label="$t('示例位置')" width="90" align="center" />
            <el-table-column prop="name" :label="$t('功能')" width="120" align="center" />
            <el-table-column prop="pathTitle" :label="$t('路径')" min-width="100" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="200">
                <template #default="{ row }">
                    <el-button v-throttle style="padding: 8px 15px" type="primary" @click="router.push(row.path)">{{$t('前往配置')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <img class="guide" src="../../../assets/img/guide/guide_icon.png" alt="">
    </div>
</template>

<script setup name="webConfigGuide">
import { useRouter } from 'vue-router'

const router = useRouter()

const tableData = [
    { id: 1, name: $t('下载app'), pathTitle: $t('站点配置 - APP管理配置 - 顶部下载条设置'), path: '/site-config/app-manage?tab=2' },
    { id: 2, name: 'logo', pathTitle: $t('站点配置 - 首页模块 - 首页设置'), path: '/site-config/home-module?type=decorators' },
    { id: 3, name: $t('左侧展开'), pathTitle: $t('站点配置 - 首页模块 - 首页设置'), path: '/site-config/home-module?type=decorators' },
    { id: 4, name: $t('轮播图'), pathTitle: $t('运营中心 - 宣传管理'), path: '/operating-center/publicity-manage' },
    { id: 5, name: $t('跑马灯公告'), pathTitle: $t('运营中心 - 消息推送'), path: '/operating-center/notification-push' },
    { id: 6, name: $t('游戏类型'), pathTitle: $t('游戏中心 - 游戏类型设置'), path: '/game-center/game-type-setting' },
    { id: 7, name: $t('游戏'), pathTitle: $t('游戏中心 - 游戏平台列表'), path: '/game-center/game-platform-list' },
    { id: 8, name: $t('站点类型相关'), pathTitle: $t('站点配置 - 品牌设置 - 页脚配置'), path: '/site-config/brand-setting?tab=2' },
    { id: 9, name: $t('活动图标'), pathTitle: $t('运营中心 - 宣传管理'), path: '/operating-center/publicity-manage' },
    { id: 10, name: $t('底部五大类'), pathTitle: $t('站点配置 - 模块管理'), path: '/site-config/modules-manage' },
]
</script>

<style lang="scss" scoped>
.web-config-guide {
    flex-direction: row;
    .guide {
        width: 450px;
        height: 974px;
        margin-left: 20px;
    }
}
</style>
