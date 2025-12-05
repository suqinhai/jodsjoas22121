<template>
    <!-- 模版仓库-节日风格模版 -->
    <div class="container festival-style">
        <div class="head">{{$t('节日风格模版')}}<div class="btn">
                <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
                <el-button v-throttle style="margin-left:15px" type="primary" v-if="!state.isDisabled" @click="handleSave">{{$t('保 存')}}</el-button>
                <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
            </div>
        </div>
        <div class="skin-box">
            <div class="skin-box-small" v-for="item in templateData" :key="item.id">
                <div class="skin-imgs">
                    <img :src="item.image" alt="">
                </div>
                <div class="skin-name">
                    <el-radio-group v-model="state.templateId" :disabled="state.isDisabled">
                        <el-radio :label="item.id" size="large">{{item.title}}</el-radio>
                    </el-radio-group>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup name="festivalStyle">
import { reactive, onMounted } from 'vue'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import skinInit from '@/assets/img/festival_style/skin_init.png'
import skinHallowmas from '@/assets/img/festival_style/skin_hallowmas.png'
import skinChristmas from '@/assets/img/festival_style/skin_christmas.png'
import skinSpring from '@/assets/img/festival_style/skin_spring.png'

const templateData = [
    { image: skinInit, id: 0, title: $t('默认模版') },
    { image: skinSpring, id: 1, title: $t('植树节模版') },

]
const state = reactive({
    templateId: 0,
    isDisabled: true
})

onMounted(() => {
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'festivalStyle' }).then(res => {
        if (res.data) {
            state.templateId = res.data
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 保存
const handleSave = () => {
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        alias: state.templateId,
        status: 1,
        part: 'festivalStyle'
    }).then((res) => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
.festival-style {
    min-width: 900px;
    .head {
        display: flex;
        align-items: center;
        line-height: 30px;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        .btn {
            display: flex;
            margin-left: 30px;
        }
    }
    .skin-box {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        overflow-y: auto;

        &-small {
            // width: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 30px;
            margin-bottom: 30px;

            .skin-imgs {
                display: flex;
                justify-content: center;
                align-items: center;
                img {
                    width: 250px;
                    height: 500px;
                }
            }
            .skin-name {
                margin-top: 10px;
                width: 100%;
                font-size: 16px;
                text-align: center;
                height: 32px;
                line-height: 32px;
				white-space: nowrap;
            }
        }
    }
}
</style>
