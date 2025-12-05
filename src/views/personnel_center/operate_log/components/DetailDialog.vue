
<template>
    <!-- 操作日志-详情 -->
    <Dialog :title="$t('详情')" top="5vh" :isShowSubmit="false" @cancel="emit('close')" width="800">
        <!-- <div class="card-box"> -->
        <div class="card-box" style="width: 100%">
            <div class="card-box-row card-box-head">
                <div class="small-box small-box-left">{{$t('操作前')}}</div>
                <div class="small-box small-box-right">{{$t('操作后')}}</div>
            </div>

            <div class="card-box-row" v-for="(item,index) in itemData.oldData" :key="index">
                <div class="small-box small-box-left">{{item}}</div>
                <div class="small-box small-box-right">{{itemData.currentData[index]}}</div>
            </div>
            <!-- <template #header>{{$t('操作前')}}</template> -->

            <!-- <div v-for="(item,index) in itemData.currentData" :key="index">{{item}}</div> -->
        </div>
        <!-- <el-card style="width: 360px;color: green">
                <template #header>{{$t('操作后')}}</template>
                <div v-for="(item,index) in itemData.oldData" :key="index">{{item}}</div>
            </el-card> -->
        <!-- </div> -->
    </Dialog>
</template>

<script setup>
const props = defineProps({
    itemData: {
        type: Object,
        default: () => { },
    },
})
const emit = defineEmits(["close"])
</script>

<style lang="scss">
.card-box {
    width: 100%;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    &-head {
        font-size: 18px;
        .small-box {
            text-align: center !important;
        }
    }
    &-row {
        display: flex;
    }
    .small-box {
        padding: 10px 20px;
        flex: 1;
        text-align: left;
        &-left {
            color: red;
        }
        &-right {
            color: green;
            border-left: 1px solid #e4e7ed;
        }
    }
    .card-box-row + .card-box-row {
        // .small-box {
        //     padding-top: 10px;
        // }
        border-top: 1px solid #e4e7ed;
    }
    // .card-box-row:nth-of-type(2) {
    //     .small-box {
    //         padding-top: 20px;
    //     }
    // }
    // .card-box-row:nth-last-of-type(1) {
    //     .small-box {
    //         padding-bottom: 20px;
    //     }
    // }
}
</style>
