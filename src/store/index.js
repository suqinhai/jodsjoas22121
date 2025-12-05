/*
 * @Date: 2023-09-08 10:06:56
 * @LastEditors: Sai
 * @LastEditTime: 2023-09-19 10:27:08
 */
import sidebarStore from './sidebar'
import tagsStore from './tags'
import userStore from './user'

export default function store() {
    return {
        sidebarStore: sidebarStore(),
        tagsStore: tagsStore(),
        userStore: userStore(),
    }
}
