
import { defineStore } from 'pinia'

const useTagsStore = defineStore('tags', {
    state: () => {
        return {
            list: !localStorage.getItem('tags_list')
                ? []
                : JSON.parse(localStorage.getItem('tags_list')),
        }
    },
    getters: {
        show: (state) => {
            return state.list.length > 0
        },
        nameList: (state) => {
            return state.list.map((item) => item.name)
        },
    },
    actions: {
        delTagsItem(index) {
            this.list.splice(index, 1)
            this.setLocalTag()
        },
        setTagsItem(data) {
            let index = this.list.findIndex((item) => item.name === data.name)
            if (index > -1) {
                this.list[index] = data
            } else {
                this.list.push(data)
            }
            this.setLocalTag()
        },
        clearTags() {
            this.list = []
            this.setLocalTag()
        },
        closeTagsOther(data) {
            this.list = data
            this.setLocalTag()
        },
        closeCurrentTag(data) {
            for (let i = 0, len = this.list.length; i < len; i++) {
                const item = this.list[i]
                if (item.path === data.$route.fullPath) {
                    if (i < len - 1) {
                        data.$router.push(this.list[i + 1].path)
                    } else if (i > 0) {
                        data.$router.push(this.list[i - 1].path)
                    } else {
                        data.$router.push('/')
                    }
                    this.list.splice(i, 1)
                    break
                }
            }
            this.setLocalTag()
        },
        setLocalTag() {
            localStorage.setItem('tags_list', JSON.stringify(this.list))
        },
        resetTags(val) {
            this.list.forEach((item) => {
                if (item.path !== val) {
                    item.fullPath = item.path
                }
            })
            this.setLocalTag()
        },
    },
})

export default useTagsStore
