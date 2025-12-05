<template>
    <!-- 代理中心-三级掉绑配置-说明 -->
    <Dialog top="5vh" :title="$t('说明：')" width="820" :isShowBottomButton="false"
        @cancel="emits('close')">
        <div class="explain-box">
            <div class="small-box"
                v-for="(item,index) in explainData" :key="index">
                <span class="label">{{item.title}}</span>
                <span class="text">{{item.content}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(["close"])
let explainData = [
	{ title: '', content: $t('1.对代理账号进行新增掉绑配置，添加后将按此配置触发，不受初始配置影响；') },
	{ title: '', content: $t('2.删除该代理配置后，将从列表移除，且掉绑走初始配置；') },
	{ title: '', content: $t('3.邀请人数判断只计算链接注册的，修改代理绑定人数变化数据不影响；') },
	{ title: '', content: $t('4.修改掉绑后重新计算；') },
	{ title: $t('举例：'), content: '' },
	{ title: '', content: $t('邀请2人后开始掉绑，固定掉绑5，则在邀请第7个人掉绑，之后每第5人掉绑') },
	{ title: '', content: $t('邀请2人后开始掉绑，比例掉绑30%，则在邀请第3个人有30%概率掉绑，之后每邀请1个人都有30%概率掉绑') },
]
</script>

<style lang="scss">
	.explain-box{
		.small-box {
			font-size: 16px;
			line-height: 24px;
			.label {
				color: #666;
			}
			.text {
				color: #999;
			}
			&--active {
				margin-top: 10px;
			}
		}
	}
</style>
