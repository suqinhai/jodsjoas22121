<template>
    <div class="tinymce-container">
        <Editor v-model="state.contentValue" :init="state.init" :disabled="disabled" />
        <p v-if="isUploading" style="color: #f56c6c; font-size: 12px;">{{$t('图片上传中...')}}</p>
    </div>
</template>

<script setup>
import { ref,reactive, watch, onMounted, defineProps, defineEmits } from 'vue'
import commonStore from '@/store/common'
import { ElMessage } from 'element-plus'
import { getUploadUrl } from '@/api/common'
import axios from 'axios'

import Editor from '@tinymce/tinymce-vue' // 引入tinymce编辑器
import tinymce from 'tinymce/tinymce' // tinymce默认hidden，不引入则不显示编辑器
import 'tinymce/models/dom'; // 引入dom模块。从 Tinymce6，开始必须有此模块导入
import 'tinymce/skins/ui/oxide/skin.css'// 样式
import 'tinymce/themes/silver'; // 默认主题
import 'tinymce/icons/default'; // 引入编辑器图标icon，不引入则不显示对应图标

// 引入编辑器插件（基本免费插件都在这儿了）
import 'tinymce/plugins/lists'// 列表插件
import 'tinymce/plugins/code' // 源代码插件
import 'tinymce/plugins/pagebreak' // 分页符插件
import 'tinymce/plugins/charmap' // 特殊符号插件
// import 'tinymce/plugins/emoticons' // 表情插件
import 'tinymce/plugins/save' // 保存插件
import 'tinymce/plugins/preview' // 预览插件
import 'tinymce/plugins/image'// 上传图片插件
import 'tinymce/plugins/media'// 视频插件
import 'tinymce/plugins/link' // 链接插件
import 'tinymce/plugins/anchor' // 锚点插件
import 'tinymce/plugins/codesample' // 代码插件
import 'tinymce/plugins/table'// 表格插件
import 'tinymce/plugins/searchreplace' // 查找、替换插件
import 'tinymce/plugins/insertdatetime' // 时间日期插件
import 'tinymce/plugins/wordcount'// 字数统计插件
import 'tinymce/plugins/fullscreen' // 全屏插件

const emits = defineEmits(['update:modelValue', 'update:isUploading'])
const props = defineProps({
    isUploading: {
        type: Boolean,
        default: false
    },
    modelValue: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: '500px'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    toolbar: {
        type: String,
        default: 'undo redo ' +
            'fontfamily fontsize forecolor backcolor ' +
            ' bold italic underline strikethrough ' +
            'alignleft aligncenter alignright alignjustify ' +
            'outdent indent numlist bullist insertdatetime ' +
            'table removeformat ' +
            'hr searchreplace pagebreak charmap ' +
            'fullscreen preview ' +
            'image media link codesample code'
    },
})
const langConfig = {
    'zh': {
        key: 'zh_CN',
        url: '/tinymce/langs/zh_CN.js'
    },
    'vi': {
        key: 'vi',
        url: '/tinymce/langs/vi.js'
    }
}
const isUploading = ref(false);
const state = reactive({
    init: {
        language_url: langConfig[$locale]?.url || '',  // 引入语言包文件
        language: langConfig[$locale]?.key || '',  // 语言类型
        skin: 'default', // 使用默认皮肤
        skin_url: '/tinymce/skins/ui/oxide',  // 皮肤：浅色
        // menubar: 'insert view format table', // 菜单栏配置
        menubar: false,  // 菜单栏配置，设为false则隐藏，不配置则默认显示全部菜单，也可自定义配置
        plugins: 'lists code pagebreak charmap save preview image media link anchor codesample table wordcount fullscreen searchreplace insertdatetime',  //插件配置
        toolbar: props.toolbar,  // 工具栏配置，设为false则隐藏
        font_size_formats: '10px 12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 48px 56px 72px',  // 字体大小
        // font_family_formats: $t('微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;'),  //字体样式
        font_family_formats: '微软雅黑(Microsoft YaHei)=Microsoft YaHei,Helvetica Neue,PingFang SC;宋体(SimSun)=simsun;黑体(SimHei)=SimHei;仿宋(FangSong)=FangSong;楷体(KaiTi)=KaiTi;隶书(LiSu)=LiSu;幼圆(YouYuan)=YouYuan;Arial=arial,helvetica;Times New Roman=times new roman,times;',  //字体样式
        //自带默认字体：'Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats'
        lineheight_formats: "0.5 0.8 1 1.2 1.5 1.75 2 2.5 3 4 5",  // 行高配置，也可配置成"12px 14px 16px 20px"这种形式
        width: props.width || '100%',  // 注：引入autoresize插件时，此属性失效
        height: props.height || '500px',  // 注：引入autoresize插件时，此属性失效
        insertdatetime_formats: ['%H点%M分', '%Y年%m月%d日', '%Y年%m月%d日 %H点%M分', '%Y-%m-%d %H:%M'],  // 时间日期格式
        placeholder: props.placeholder,
        resize: false,  // 编辑器宽高是否可变，false-否,true-高可变，'both'-宽高均可，注意引号
        statusbar: false,  // 最下方的元素路径和字数统计那一栏是否显示
        // elementpath: false,  // 元素路径是否显示
        content_style: 'body{font-family:Verdana;} img{max-width:100%;}',  // 直接自定义可编辑区域的css样式
        // content_css: '',  // 以css文件方式自定义可编辑区域的css样式，css文件需自己创建并引入
        paste_data_images: true,  // 图片是否可粘贴
        file_picker_types: 'file image media', // 可上传文件类型
        images_file_types: 'png,jpg,jpeg,gif', // 图片类型
        images_upload_handler: (blobInfo) => new Promise((resolve, reject) => {
            isUploading.value = true;
            emits('update:isUploading', isUploading.value);
            fileUpload('image', blobInfo.blob(), (url) => {
                isUploading.value = false;
                emits('update:isUploading', isUploading.value);
                resolve(url);
            }, () => {
                isUploading.value = false;
                emits('update:isUploading', isUploading.value);
                reject();
            });
        }),
        file_picker_callback: (callback, value, meta) => {
            let input = document.createElement("input");
            input.setAttribute("type", "file");
            input.onchange = function () {
                let bizType = 'image'
                let file = this.files[0]
                if (meta.filetype == 'media') {
                    if (file.type.indexOf('mp4') >= 0) {
                        bizType = 'video'
                    } else if (file.type.indexOf('mpeg') >= 0) {
                        bizType = 'audio'
                    } else {
                        return ElMessage.error($t('媒体上传只支持MP3/MP4格式的文件！'))
                    }
                }
                fileUpload(bizType, file, callback)
            }
            input.click()
        },
        setup: function (editor) {
            editor.on('init', function (e) {
                if (!editor.getContent()) editor.setContent("<p style='font-family:Verdana;'></p>") // 设置默认内容
                this.getBody().style.fontFamily = 'Verdana'
            })
            editor.on('SetContent', function (e) {
                // 获取所有图片元素
                var imgs = editor.dom.select('img')
                imgs.forEach(function (img) {
                    // 添加或修改样式
                    editor.dom.setStyles(img, {
                        'max-width': '100%',
                        'height': 'fit-content',
                        'object-fit': 'cover',
                    })
                })

                // 获取所有video元素
                var videos = editor.dom.select('video')
                videos.forEach(function (video) {
                    // 添加或修改样式
                    editor.dom.setStyles(video, {
                        'max-width': '100%',
                        'height': 'fit-content',
                        'object-fit': 'cover',
                    })
                })
            })
            // editor.on('nodechange', function (e) {
            //     // 获取当前选区
            //     const selection = editor.selection;
            //     const node = selection.getNode();

            //     // 如果选择的是文本节点或没有样式的元素
            //     if (node.nodeType === 3 || !node.style.fontSize) {
            //         const parent = editor.dom.getParent(node, function (n) {
            //             return n.nodeType === 1; // 元素节点
            //         });

            //         // 应用默认样式
            //         editor.dom.setStyles(parent, {
            //             'font-size': '16px',
            //             'color': '#333333'
            //         });
            //     }
            // });
        },
        // init_instance_callback: function (editor) {
        //     editor.setContent("<p style='font-family:Verdana;'></p>"); // 设置默认内容
        // }
    },
    contentValue: "<p style='font-family:Verdana;'></p>",
})
const commonData = commonStore()

watch(
    () => props.modelValue,
    (newValue) => {
        state.contentValue = newValue
    },
    { immediate: true }
)
watch(
    () => state.contentValue,
    (newValue) => {
        emits('update:modelValue', newValue)
    }
)

onMounted(() => {
    tinymce.init({})
})

const fileUpload = async (bizType, file, callback, reject) => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { singleFileMax = '', fileTypes = '' } = commonData.fileType[bizType]
        if (!verifyFile(file, singleFileMax, fileTypes, bizType === 'image')) {
            globalVBus.$emit('globalLoading', false)
            // reject()
        } else {
            let { data } = await getUploadUrl({
                fileName: file.name.replace(/[\[\]]/g, ''),
                fileSize: file.size,
                bizType,
            })
            await axios.put(data.upload, file, {
                headers: {
                    "Content-Type": file.type
                }
            })
            callback(data.url)
        }
        globalVBus.$emit('globalLoading', false)
    } catch (error) {
        !!reject && reject()
        ElMessage.error($t('文件上传失败！'))
        globalVBus.$emit('globalLoading', false)
    }
}

const verifyFile = (file, singleFileMax, fileTypes, isImage) => {
    let valid = true
    let type = ''
    if (isImage) {
        type = file.type.split('/')[1]
    } else {
        type = file.name.substring(file.name.length - 3)
    }
    if (!fileTypes.some((item) => type === item)) {
        valid = false
        ElMessage.error(`${$t('请上传')}${fileTypes.join('/')}${$t('格式的文件')}`)
    }
    if (singleFileMax && singleFileMax < file.size) {
        valid = false
        ElMessage.error(`${$t('文件大小不能超过')}${parseInt(singleFileMax / 1024 / 1024)}M`)
    }
    return valid
}

const onClick = (e) => {
    // emits('onClick', e, tinymce)
}

//清空内容
const clear = () => {
    state.contentValue = ''
}
</script>

<style lang="scss">
.tox-promotion {
    display: none;
}
.tox-tinymce-aux {
    z-index: 9999 !important;
}
</style>