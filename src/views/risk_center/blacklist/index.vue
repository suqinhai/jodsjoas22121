<template>
    <!-- 黑名单 -->
    <div class="tabs blacklist">
        <el-tabs v-model="type">
            <el-tab-pane :label="$t('会员黑名单')" :name="0">
                <MemberBlacklistTable></MemberBlacklistTable>
            </el-tab-pane>
            <el-tab-pane v-if="userData.isHasPermiss('admin.user-blacklist.listIP')" :label="$t('IP黑名单')" :name="1">
                <IpBlacklistTable></IpBlacklistTable>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name="blacklist">
import { ref } from 'vue'
import userStore from '@/store/user'
import MemberBlacklistTable from './components/MemberBlacklistTable.vue'
import IpBlacklistTable from './components/IpBlacklistTable.vue'

const type = ref(0)
const userData = userStore()
</script>

<style lang="scss">
.blacklist {
}
</style>
