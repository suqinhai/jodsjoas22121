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
	{ title: $t('代理层级：'), content: '' },
	{ title: '', content: $t('自己：其中充值，提现，充提差，游戏输赢，统计仅自己产生的数据，且可进行升序排序；注册人数、充值人数、首充人数、首充金额、复充人数、复充金额，均统计为整个链路（无限极）数据；') },
	{ title: '', content: $t('总计：将1,2,3级代理对应数据相加；') },
	{ title: '', content: $t('各级代理数据：只统计该级的数据，如a代理发展的b（通过a的推广链接注册）为一级，，b充值100则记录100') },
	{ title: $t('三级分润比例：'), content: $t('根据比例配置对应显示，初始根据三级代理配置比例，若在该表操作-邀请奖金设置，则取最新配置；') },
	{ title: $t('复充人数：'), content: $t('充值次数为2次时则算复充；复充金额：根据会员总充值减去首次充值计算；') },
	{ title: '', content: $t('注：每日明细需记录当日是否有首充过的会员，进行再次充值则算复充；') },
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
