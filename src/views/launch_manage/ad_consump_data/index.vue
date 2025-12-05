<template>
    <!-- 投放管理-广告消耗数据列表 -->
    <div class="container">
		<el-tabs v-model="tabItem">
		    <el-tab-pane v-for="item in typeList" :key="item.value" :label="item.label" :name="item.value">
		    </el-tab-pane>
		</el-tabs>
		<AdConsumpData v-if="tabItem === 1"></AdConsumpData>
		<ChannelConsumpDetail v-if="tabItem === 2"></ChannelConsumpDetail>
    </div>
</template>

<script setup name="adConsumpData">
	import { ref, defineAsyncComponent } from "vue"
	const AdConsumpData = defineAsyncComponent(() => import("./components/AdConsumpData.vue"))
	const ChannelConsumpDetail = defineAsyncComponent(() => import("./components/ChannelConsumpDetail.vue"))
	const typeList = ref([{
		value: 1,
		label: $t('广告消耗数据')
	},{
		value: 2,
		label: $t('渠道消耗明细')
	}])
	const tabItem = ref(1)
</script>

<style lang="scss">
</style>