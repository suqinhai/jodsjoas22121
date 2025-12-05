<template>
    <!-- 经销商模式配置-常规内容编辑-前端预览 -->
    <Dialog top="5vh" :title="$t('前端预览')" width="680" :isShowBottomButton="false" @cancel="emits('close')">
        <div class="explain-box">
            <div class="explain-title">{{itemData.name}}</div>
            <div class="explain-contact">
                <div class="explain-contact-box">
                    <div class="explain-contact-small over1line" v-for="(item,index) in itemData.contactList" :key="index">
                        {{contactText(item)}}
                    </div>
                </div>
                <div>
                    <div class="copy-but" v-for="(item,index) in itemData.contactList" :key="index">
                        {{$t('复制')}}
                    </div>
                </div>
            </div>
            <!-- <div class="explain-contact" v-for="(item,index) in itemData.contactList" :key="index">
                <span class="text">{{contactText(item)}}</span>
                <span class="copy-but">{{$t('复制')}}</span>
            </div> -->
            <div class="explain-content" v-if="itemData.content">
                <div class="explain-content-main" v-html="itemData.content"></div>
            </div>
            <div class="explain-but">{{$t('申请经销商')}}</div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(["close"])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    imType: {
        type: Array,
        default: () => []
    },
})

const contactText = ({ k, v }) => {
    let imName = props.imType.find(ims => +ims.value === k)?.label || ''
    return imName + ': ' + (v || '')
}
</script>

<style lang="scss">
.explain-box {
    width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #151d29;
    padding: 41px 56px 69px 58px;
    .explain-title {
        font-family: Microsoft YaHei;
        font-weight: 400;
        font-size: 20px;
        color: #ffffff;
        text-align: center;
    }
    .explain-contact {
        margin-top: 43px;
        margin-bottom: 27px;
        display: flex;
        justify-content: center;
        &-box {
            margin-right: 26px;
            flex-shrink: 0;
        }
        &-small {
            max-width: 380px;
            height: 28px;
            line-height: 28px;
            font-family: Microsoft YaHei;
            font-weight: 400;
            font-size: 18px;
            color: #fff;
            & + .explain-contact-small {
                margin-top: 13px;
            }
        }
        .copy-but {
            height: 28px;
            padding: 0 18px;
            display: flex;
            align-items: center;
            border: 1px solid #005dfe;
            border-radius: 10px;
            font-size: 15px;
            color: #005dfe;
            & + .copy-but {
                margin-top: 13px;
            }
        }
    }
    .explain-content {
        width: 100%;
        max-height: 60vh;
        border: 1px dotted #55657e;
        padding: 30px;

        &-main {
            width: 100%;
            max-height: 50vh;
            overflow-y: auto;
            scrollbar-width: none;
            &::-webkit-scrollbar {
                display: none;
            }
        }
    }
    .explain-but {
        margin-top: 38px;
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Microsoft YaHei;
        font-weight: 400;
        font-size: 18px;
        letter-spacing: 3px;
        color: #ffffff;
        border-radius: 10px;
        background: #005dfe;
    }
}
</style>