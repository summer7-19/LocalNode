import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: { userName: '', email: '', password: '', currentTime: '', status: '' },
        userKnow: { knowName: '', parentId: '', description: '', createTime: '' },
        userNoteByKnow: { noteName: '', knowId: '', content: '', version: '', tag: '', createTime: '', updateTime: '' },
        tree: []
    }),
    getters: {},
    actions: {
        setUserMsg(data) {
            this.user = data
        },
        setUserKnow(know) {
            this.userKnow = know
        },
        setUserNote(note) {
            this.userNoteByKnow = note
        },
        setTree(tree) {
            this.tree = tree
        }
    }
})
