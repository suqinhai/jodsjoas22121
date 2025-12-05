import XEUtils from 'xe-utils'
import { Decimal } from 'decimal.js'
import { ElMessage } from 'element-plus'
import { getMerchantVendorData } from '@/api/common'

/**
 * 获取当前商户时区
 * @returns
 * @example
 */
export function getMerchantTimeZone() {
    let merchantInfo = localStorage.getItem('merchant_info')
        ? JSON.parse(localStorage.getItem('merchant_info'))
        : {}
    let userInfo = localStorage.getItem('user_info')
        ? JSON.parse(localStorage.getItem('user_info'))
        : {}
    return userInfo.timeZone || merchantInfo.timeZone || getTimezone()
}

/**
 * 格式化日期
 * @param date
 * @param formatStr
 * @returns
 * @example yyyy-mm-dd HH:ii:ss' w W
 */
export function dateFormat(
    date,
    formatStr = 'yyyy-MM-DD hh:ii:ss',
    timeZone = '',
    isCurrentTimeZone = false,
) {
    if (!date) return ''
    if (typeof date === 'string') {
        date = date.replace(/-/g, '/')
    }
    if (type(date) !== 'date') {
        if (/^\d+$/.test(date?.toString())) {
            date = new Date(+date)
        } else {
            // 兼容Safari日期带有 / 导致的格式化异常问题
            date =
                (date && new Date(date.toString().replace(/\//g, '-'))) ||
                new Date()
        }
    }
    const addZero = (v, size) => {
        for (let i = 0, len = size - (v + '').length; i < len; i++) v = '0' + v
        return v + ''
    }
    let len = date.getTime()
    //本地时间与GMT时间的时间偏移差
    let offset = date.getTimezoneOffset() * 60000
    timeZone = isCurrentTimeZone ? getTimezone() : getMerchantTimeZone()
    let arr = timeZone.split(':')
    let offsetMs =
        Number(arr[0]) * 60 +
        (Number(arr[0]) < 0 ? Number(arr[1]) * -1 : Number(arr[1]))
    date = new Date(len + offset + 60000 * offsetMs)
    const D = date
    const arrWeek = [
        $t('日'),
        $t('一'),
        $t('二'),
        $t('三'),
        $t('四'),
        $t('五'),
        $t('六'),
    ]
    return formatStr
        .replace(/yyyy|YYYY/, D.getFullYear() + '')
        .replace(/yy|YY/, addZero(D.getFullYear() % 100, 2))
        .replace(/mm|MM/, addZero(D.getMonth() + 1, 2))
        .replace(/m|M/g, D.getMonth() + 1 + '')
        .replace(/dd|DD/, addZero(D.getDate(), 2))
        .replace(/d|D/g, D.getDate() + '')
        .replace(/hh|HH/, addZero(D.getHours(), 2))
        .replace(/h|H/g, D.getHours() + '')
        .replace(/ii|II/, addZero(D.getMinutes(), 2))
        .replace(/i|I/g, D.getMinutes() + '')
        .replace(/ss|SS/, addZero(D.getSeconds(), 2))
        .replace(/s|S/g, D.getSeconds() + '')
        .replace(/w/g, D.getDay() + '')
        .replace(/W/g, arrWeek[D.getDay()])
}

/**
 * 当前时区与商户时区时间的偏移量（ms）
 * @returns
 * @example
 */
export function getTimeZoneOffset() {
    let date = new Date()
    //本地时间与GMT时间的时间偏移差
    let offset = date.getTimezoneOffset() * 60000
    let arr = getMerchantTimeZone().split(':')
    let offsetMs =
        Number(arr[0]) * 60 +
        (Number(arr[0]) < 0 ? Number(arr[1]) * -1 : Number(arr[1]))
    return offset + 60000 * offsetMs
}

/**
 * 时间选择器禁止选择商户时区当前时间之后的时间
 * @returns
 * @example
 */
export const disabledCurrentDateAfter = (time) => {
    let timeZoneOffset = XEUtils.cookie('timeZoneOffset')
        ? +XEUtils.cookie('timeZoneOffset')
        : 0
    if (!timeZoneOffset) {
        let date = new Date()
        //本地时间与GMT时间的时间偏移差
        let offset = date.getTimezoneOffset() * 60000
        let arr = getMerchantTimeZone().split(':')
        let offsetMs =
            Number(arr[0]) * 60 +
            (Number(arr[0]) < 0 ? Number(arr[1]) * -1 : Number(arr[1]))
        timeZoneOffset = offset + 60000 * offsetMs
        XEUtils.cookie('timeZoneOffset', timeZoneOffset, {
            expires: new Date(Date.now() + 10 * 60 * 1000),
        })
    }
    return time.getTime() > Date.now() + timeZoneOffset
}

/**
 * 获取对象类型
 * @param target
 * @returns
 */
export function type(target) {
    return Object.prototype.toString
        .call(target)
        .replace(/.*\s|\]/g, '')
        .toLowerCase()
}

/**
 * 解析地址的search参数
 * @param
 */
export function getQueryStringArgs(path) {
    return XEUtils.parseUrl(path || location.href).searchQuery
}

/**
 * 格式化数字，保留小数点decimal位
 * @param
 * @num 数值
 * @decimal 截取位数
 */
export function toDecimal(num, decimal = 2) {
    return new Decimal(num).toFixed(decimal, Decimal.ROUND_DOWN)
}

/**
 * 截取指定小数点位数
 * @param
 * @total 金额
 * @num 位数
 */
export function toolPoint(total, num = 4) {
    if (!total.toString()) {
        return total
    }
    total = total.toString()
    if (total.indexOf('.') != -1) {
        let point = total.split('.')
        if (point[1].length >= num) {
            total = point[0] + '.' + point[1].substring(0, num)
            return total * 1
        } else {
            return total * 1
        }
    } else {
        return total * 1
    }
}

/**
 * 格式化数据，逗号分开
 * @param num
 * @returns
 */
export function formatNum(num) {
    if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(num.toString())) {
        return num.toString()
    }
    const a = RegExp.$1
    let b = RegExp.$2
    const c = RegExp.$3
    const re = new RegExp('(\\d)(\\d{3})(,|$)')
    while (re.test(b)) b = b.replace(re, '$1,$2$3')
    return `${a}${b}${c}`
}

/**
 * 加法
 */
export function add(...args) {
    let result = new Decimal(args[0])
    for (let i = 1; i < args.length; i++) {
        result = result.add(new Decimal(args[i]))
    }
    return result.toNumber()
}

/**
 * 减法
 */
export function sub(...args) {
    let result = new Decimal(args[0])
    for (let i = 1; i < args.length; i++) {
        result = result.sub(new Decimal(args[i]))
    }
    return result.toNumber()
}

/**
 * 乘法
 */
export function mul(...args) {
    let result = new Decimal(args[0])
    for (let i = 1; i < args.length; i++) {
        result = result.mul(new Decimal(args[i]))
    }
    return result.toNumber()
}

/**
 * 除法
 */
export function div(...args) {
    let result = new Decimal(args[0])
    for (let i = 1; i < args.length; i++) {
        result = result.div(new Decimal(args[i]))
    }
    return result.toNumber()
}

/**
 * token
 * @returns
 */
export function token(auth) {
    const tk = 'token'
    if (auth) {
        localStorage.setItem(tk, JSON.stringify(auth))
    } else if (auth === null) {
        localStorage.removeItem(tk)
    } else {
        try {
            const parse = JSON.parse(localStorage.getItem(tk))
            return parse
        } catch (e) {
            /** */
        }
    }
    return null
}

/**
 * 获取当前商户站点ID
 * @returns
 */
export function getMerchantId() {
    let merchantId = ''
    if (
        localStorage.getItem('current_merchant_site') ||
        localStorage.getItem('mid')
    ) {
        merchantId = localStorage.getItem('current_merchant_site')
            ? JSON.parse(localStorage.getItem('current_merchant_site')).id
            : localStorage.getItem('mid')
    }
    return merchantId
}

/**
 * 深度拷贝
 * @param
 */
export function deepClone(values) {
    let copy

    // Handle the 3 simple types, and null or undefined
    if (values == null || typeof values !== 'object') return values

    // Handle Date
    if (values instanceof Date) {
        copy = new Date()
        copy.setTime(values.getTime())
        return copy
    }

    // Handle Array
    if (values instanceof Array) {
        copy = []
        for (let i = 0, len = values.length; i < len; i++) {
            copy[i] = deepClone(values[i])
        }
        return copy
    }

    // Handle Object
    if (values instanceof Object) {
        copy = {}
        for (const attr in values) {
            if (values.hasOwnProperty(attr))
                copy[attr] = deepClone(values[attr])
        }
        return copy
    }

    throw new Error("Unable to copy values! Its type isn't supported.")
}

/**
 * 获取浏览器可视窗口宽高
 * @returns
 */
export function viewPort() {
    return {
        width:
            document.documentElement.clientWidth || document.body.clientWidth,
        height:
            document.documentElement.clientHeight || document.body.clientHeight,
    }
}

/**
 * 获取浏览器可视窗口宽高
 * @returns
 * @value 要复制的文本
 */
export function copyText(value = '') {
    if (!value) return
    // 创建一个隐藏的文本框
    const hiddenInput = document.createElement('input')
    hiddenInput.value = value
    // hiddenInput.style.display = 'none'
    hiddenInput.style.position = 'fixed'
    hiddenInput.style.opacity = 0

    // 将文本框添加到页面中
    document.body.appendChild(hiddenInput)

    // 选择文本框中的文本
    hiddenInput.select()

    // 复制文本到剪贴板
    document.execCommand('copy')

    // 从页面中移除文本框
    document.body.removeChild(hiddenInput)
    ElMessage.success($t('复制成功！'))
}

/**
 * 时长格式化
 * @param time ms
 */
export function durationFormat(time) {
    const text = []
    // const y = parseInt(time / (24 * 60 * 60 * 365 * 1000) + '', 10)
    // if (y) {
    //   time -= y * 24 * 60 * 60 * 365 * 1000
    //   text.push(y + i18n.t('年'))
    // }
    // const m = parseInt(time / (24 * 60 * 60 * 30 * 1000) + '', 10)
    // if (m) {
    //   time -= m * 24 * 60 * 60 * 30 * 1000
    //   text.push(m + i18n.t('月'))
    // }
    const d = parseInt(time / (24 * 60 * 60 * 1000) + '', 10)
    if (d) {
        time -= d * 24 * 60 * 60 * 1000
        text.push(d + $t('天'))
    }
    const h = parseInt(time / (60 * 60 * 1000) + '', 10)
    if (h) {
        time -= h * 60 * 60 * 1000
        text.push(h + $t('时'))
    }
    const mm = parseInt(time / (60 * 1000) + '', 10)
    if (mm) {
        time -= mm * 60 * 1000
        text.push(mm + $t('分'))
    }
    const s = parseInt(time / 1000 + '', 10)
    if (s || +s === 0) {
        text.push(s + $t('秒'))
    }
    return text.join('')
}

/**
 * 判断目标对象是不是未定义undefined
 * @param target
 * @returns
 */
export function isUndefined(target) {
    return typeof target === 'undefined'
}

/**
 * 将数据整理成树形结构
 * @param target 目标对象，数组或者对象
 * @param childId 后代和父节点对应的key
 * @param parentId 父代和字节的对应的key
 * @param root 根的判断条件，当parentId与该参数全等时，判定为根节点
 * @param ck 存放子代的的名字，默认children
 * @param condition 判定条件
 * @returns 返回target的引用
 */
export function fetchTree(target, childId, pId) {
    if (!Array.isArray(target) || !pId || !childId) return target
    const isChildKeys = []
    for (const i in target) {
        const v = target[i]
        const pv = v[pId]
        if (isUndefined(pv) || null === pv || pv === '') continue
        // eslint-disable-next-line eqeqeq
        const find = target.find((el) => el[childId] == v[pId])
        if (find) {
            isChildKeys.push(v[childId])
            find.children = find.children || []
            find.children.push(v)
        }
    }
    return target.filter((el) => !isChildKeys.includes(el[childId]))
}

/**
 * 设置路由路径
 * @param data 目标数组
 * @returns
 */
export function setPath(data) {
    data.forEach((item) => {
        // if (MENU_PATH[item.path]) {
        //     item.path = MENU_PATH[item.path];
        // }
        if (item.path === '#') {
            item.path = item.id.toString()
        }
        // if (!item.parentId) {
        //     item.icon = FIRST_MENU_ICON[item.name];
        // }
        // if (item.name === $t('首页')) {
        //     item.path = "/dashboard";
        // }
        if (item.children) {
            setPath(item.children)
        }
    })
}

/**
 * 获取商家支持的厂家与游戏类型
 * @param
 * filterKey 过滤厂家名
 * @returns
 */
export function getGameVendorData() {
    return new Promise((resolve, reject) => {
        getMerchantVendorData()
            .then(({ data }) => {
                if (data) {
                    let arr = Object.values(data)
                    let backData = []
                    arr.forEach((item) => {
                        let data = []
                        item.forEach(its => {
                            if (data.every(ins => ins.name !== its.name)) {
                                data.push(its)
                            }
                        })
                        if (data.length) {
                            backData.push({
                                label: data[0].type_,
                                value: data[0].type,
                                vendorList: data.map((its) => its.alias),
                                vendorName: data.map((its) => its.name),
                            })
                        }
                    })
                    resolve(backData)
                } else {
                    resolve([])
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

function addZero(number) {
    return number < 10 ? +number : number
}

//获取本机时区
export function getTimezone() {
    var offsetInMinutes = new Date().getTimezoneOffset()
    var offsetInHours = Math.abs(offsetInMinutes / 60)
    var sign = offsetInMinutes > 0 ? '-' : ''
    var timezone = sign + addZero(offsetInHours)
    return timezone + ':00'
}

// 导出excel
export function excelFileExport(res) {
    const bom = '\uFEFF'
    const blob = new Blob([bom+res.data])
    // const url = window.URL.createObjectURL(blob)
    const fileName = decodeURI(
        res.headers['content-disposition']
            .split('filename="')[1]
            .split('";')[0],
    )
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    // 完成下载后释放 URL 对象
    window.URL.revokeObjectURL(url)
}

// 日期选择快捷方式
export function getShortcuts(type = 'day,yesterday,week,month') {
    const date = new Date()
    let arr = [
        {
            text: $t('本日'),
            key: 'day',
            value: () => {
                const start = date.setTime(
                    XEUtils.getWhatDay(new Date(), 0, 'first').getTime(),
                )
                const end = date.setTime(
                    XEUtils.getWhatDay(new Date(), 0, 'last').getTime(),
                )
                return [start, end]
            },
        },
        {
            text: $t('本周'),
            key: 'week',
            value: () => {
                const start = date.setTime(
                    XEUtils.getWhatWeek(
                        XEUtils.getWhatDay(new Date(), 0, 'first'),
                        0,
                        1,
                    ).getTime(),
                )
                const end = date.setTime(
                    XEUtils.getWhatWeek(
                        XEUtils.getWhatDay(new Date(), 0, 'last'),
                        0,
                        7,
                    ).getTime(),
                )
                return [start, end]
            },
        },
        {
            text: $t('本月'),
            key: 'month',
            value: () => {
                const start = date.setTime(
                    XEUtils.getWhatMonth(
                        XEUtils.getWhatDay(new Date(), 0, 'first'),
                        0,
                        'first',
                    ).getTime(),
                )
                const end = date.setTime(
                    XEUtils.getWhatMonth(
                        XEUtils.getWhatDay(new Date(), 0, 'first'),
                        0,
                        'last',
                    ).getTime(),
                )
                return [start, end]
            },
        },
        {
            text: $t('昨日'),
            key: 'yesterday',
            value: () => {
                const now = new Date();
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1); // 设置为昨天

                // 获取昨天的开始时间 (00:00:00)
                const start = new Date(yesterday);
                start.setHours(0, 0, 0, 0);

                // 获取昨天的结束时间 (23:59:59)
                const end = new Date(yesterday);
                end.setHours(23, 59, 59, 999);

                return [start.getTime(), end.getTime()];
            },
        },
    ]
    let typeArr = type.split(',')
    return arr.filter((item) => typeArr.some((its) => its === item.key))
}

/**
 * 处理请求头时区
 */
export function getHeaderTimeZone() {
    let timeZone = 0 - new Date().getTimezoneOffset()
    let hour = Math.ceil(timeZone / 60)
    if (hour >= 0) {
        if (hour < 10) {
            hour = '+0' + hour
        } else {
            hour = '+' + hour
        }
    } else {
        if (hour > -10) {
            hour = '-0' + Math.abs(hour)
        }
    }
    let minute = timeZone % 60
    if (minute == 0) {
        return hour
    } else {
        minute =
            Math.abs(minute) > 10 ? Math.abs(minute) : '0' + Math.abs(minute)
        return hour + ':' + minute
    }
}

/**
 * 获取时间选择器默认时间
 */
export function getDefaultTime() {
    return [new Date(2000, 0, 0, 0, 0, 0), new Date(2000, 0, 0, 23, 59, 59)]
}

/**
 * 获取当周时间（YYYY-MM-DD格式）
 */
export function getCurrentWeekTime(isCurrentTimeZone = false) {
    let arr = getShortcuts('week')[0].value()
    return [
        dateFormat(arr[0], 'YYYY-MM-DD', '', isCurrentTimeZone),
        dateFormat(arr[1], 'YYYY-MM-DD', '', isCurrentTimeZone),
    ]
}

/**
 * 获取当周时间（YYYY-MM-DD格式）
 */
export function getYesterdayTime(isCurrentTimeZone = false) {
    let arr = getShortcuts('yesterday')[0].value()
    return [
        dateFormat(arr[0], 'YYYY-MM-DD', '', isCurrentTimeZone),
        dateFormat(arr[1], 'YYYY-MM-DD', '', isCurrentTimeZone),
    ]
}

/**
 * 获取当月时间（YYYY-MM-DD格式）
 */
export function getCurrentMonthTime(isCurrentTimeZone = false) {
    let arr = getShortcuts('month')[0].value()
    return [
        dateFormat(arr[0], 'YYYY-MM-DD', '', isCurrentTimeZone),
        dateFormat(arr[1], 'YYYY-MM-DD', '', isCurrentTimeZone),
    ]
}

/**
 * 获取今天以前的特定范围时间（YYYY-MM-DD格式）商户时区
 * @param
 * @start 开始时间距离今天几天
 * @end 结束始时间距离今天几天
 * start 必须大于 end
 */
export function getTimeRange(start = 0, end = 0, formatStr = 'YYYY-MM-DD') {
    let nowTime = Date.now()
    return [
        dateFormat(nowTime - start * 24 * 60 * 60 * 1000, formatStr),
        dateFormat(nowTime - end * 24 * 60 * 60 * 1000, formatStr),
    ]
}

/**
 * 数字输入只能输入小数点后两位
 * @param
 * @val 输入的内容
 * @n 小数点截至位数，默认截至两位
 * @allFloat 是否不限制小数点截至位数
 */
export function numberInput(val, allFloat = false, n = 2) {
    let checkPlan = '' + val
    checkPlan = checkPlan
        .replace(/[^\d.]/g, '') // 清除“数字”和“.”以外的字符
        .replace(/\.{2,}/g, '.') // 只保留第一个. 清除多余的
        .replace(/^\./g, '') // 保证第一个为数字而不是.
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.')
    if (checkPlan.indexOf('.') < 0 && checkPlan !== '') {
        // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
        checkPlan = parseFloat(checkPlan) + ''
    } else if (checkPlan.indexOf('.') >= 0) {
        if (!allFloat) {
            // 限制小数点截至 n 位
            let floatString = ''
            for (var i = 0; i < n; i++) {
                floatString += '\\d'
            }
            let reg = new RegExp('^()*(\\d+)\\.(' + floatString + ').*$')
            checkPlan = checkPlan.replace(reg, '$1$2.$3')
            // checkPlan = checkPlan.replace(/^()*(\d+)\.(\d\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
        }
    }
    return checkPlan
}

/**
 * 检查目标路由是否在菜单列表中
 * @param
 * @list 菜单列表
 * @currentPath 当前路由路径
 */
export function findPathInList(list, currentPath) {
    let pathInList = false
    let stop = false
    list.forEach((item) => {
        if (stop) return
        if (item.path === currentPath) {
            pathInList = true
            stop = true
        } else if (item.children && item.children.length) {
            if (findPathInList(item.children, currentPath)) {
                pathInList = true
                stop = true
            }
        }
    })
    return pathInList
}

/**
 * 查找菜单第一个路由路径
 * @param
 * @list 菜单列表
 */
export function findFirstMenuPage(list) {
    let path
    let stop = false
    list.forEach((item) => {
        if (stop) return
        if (item.path.indexOf('/') > -1) {
            path = item.path
            stop = true
        } else if (item.children && item.children.length) {
            if (findFirstMenuPage(item.children)) {
                path = findFirstMenuPage(item.children)
                stop = true
            }
        }
    })
    return path || null
}

/**
 * 将Blob转换成Json
 * @param
 * @blob Blob对象
 */
export function blobToJson(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        // 当文件加载完成时调用 onload 事件处理函数
        reader.onloadend = function () {
            try {
                resolve(JSON.parse(reader.result))
            } catch (error) {
                reject($t('无法解析 Blob 对象'))
            }
        }

        // 开始读取文件内容
        reader.readAsText(blob)
    })
}

/**
 * 提现订单提示语音
 */
export function playOrderReminder(first) {
    const audio = new Audio('/audio/order_reminder.mp3')
    if (first) {
        audio.volume = 0
    }
    audio.play()
    if (first) {
        audio.remove()
    }
}

/**
 * 下载文件
 * @param
 * @url 文件路径
 * @list 文件名称
 */
export function downloadFile(url, filename) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * 生成随机字符串
 * @param
 * @len 长度
 */
export function generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz_0123456789'
    let result = ''
    const charactersLength = chars.length
    let firstCharIndex = Math.floor(Math.random() * 26) // 确保首字符是字母
    // 初始化为字母或下划线
    result += chars[firstCharIndex < 26 ? firstCharIndex : charactersLength - 1]
    for (let i = 1; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

/**
 * 获取接口数据菜单标题
 * @param
 * @route 当前路由信息
 */
export function apiRouteName(route) {
    if (route.meta.permiss == 1) return route.meta.title
    let obj = {}
    let menuList = !localStorage.getItem('menu_list')
        ? []
        : JSON.parse(localStorage.getItem('menu_list'))
    menuList.forEach((item) => {
        if (item.path === route.path) {
            obj = item
        }
        item.children?.forEach((its) => {
            if (its.path === route.path) {
                obj = its
            }
            its.children?.forEach((ims) => {
                if (ims.path === route.path) {
                    obj = ims
                }
            })
        })
    })
    return obj.name || route.meta.title
}

/**
 * 创建双向映射对象（键-值 与 值-键 互相映射）
 * @param {Object} map - 源对象，包含需要建立双向映射的键值对
 * @returns {Object} 包含两个属性的对象：
 *   - forward: 原始键值对映射（key -> value）
 *   - reverse: 反向值键对映射（value -> key）
 */
export function createBiMap(map) {
  const forward = {};
  const reverse = {};
  for (const [key, value] of Object.entries(map)) {
    forward[key] = value;
    reverse[value] = key;
  }
  return { forward, reverse };
}

/**
 * 检查富文本图片是否正在上传中
 */
export function checkImageUploading(isUploading) {
    if (isUploading) {
        ElMessage.error($t('规则说明包含图片上传中，请在上传成功后再次提交！'))
        return true
    }
    return false
}
