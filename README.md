<!--
 * @Date: 2023-08-25 16:33:49
 * @LastEditors: yilaisai
 * @LastEditTime: 2024-08-26 11:57:07
-->
# merchant-manage-system

商户后台管理系统

基于 Vue3 + pinia + Element Plus

## 组件使用说明与演示

### vue-schart

vue.js 封装 sChart.js 的图表组件。访问地址：[vue-schart](https://github.com/lin-xin/vue-schart#/) 

<p><a href="https://www.npmjs.com/package/vue-schart"><img src="https://img.shields.io/npm/dm/vue-schart.svg" alt="Downloads"></a></p>

```html
<template>
    <div>
        <schart class="wrapper" canvasId="myCanvas" :options="options"></schart>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Schart from "vue-schart"; // 导入Schart组件
const options = ref({
    type: "bar",
    title: {
        text: "最近一周各品类销售图",
    },
    labels: ["周一", "周二", "周三", "周四", "周五"],
    datasets: [
        {
            label: "家电",
            data: [234, 278, 270, 190, 230],
        },
        {
            label: "百货",
            data: [164, 178, 190, 135, 160],
        },
        {
            label: "食品",
            data: [144, 198, 150, 235, 120],
        },
    ],
})
</script>
<style>
    .wrapper {
        width: 7rem;
        height: 5rem;
    }
</style>
```
