import { createVNode } from './vnode.js'
export const App = {
    name: 'App',
    setup() {
        
    },
    // 一般在 SFC 的模式组件下我们是不用写 render 选项的，render 选项是由 template 进行编译生成的
    render() {
        return createVNode('div', { class: 'red' }, 'Hi Vue3 Component')
    }
}