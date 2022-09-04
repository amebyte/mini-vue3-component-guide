import { createVNode } from './vnode.js'
function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    function render(vnode, container) {
        patch(null, vnode, container, null, null)
    }

    function patch(n1, n2, container, parentComponent, anchor) {
        const { type } = n2
        console.log('type', type)
        if(typeof type === 'string') {
            // 作为普通元素进行处理
        } else if(typeof type === 'object') {
            // 如果是 type 是对象，那么就作为组件进行处理
            if(!n1) {
                // 挂载组件
                mountComponent(n2, container, anchor)
            } else {
                // 更新组件
            }
        }
    }

    function mountComponent(vnode, container, anchor) {
        // 定义组件实例，一个组件实例本质上就是一个对象，它包含与组件有关的状态信息
        const instance = {
            vnode,
            setupState: null, // 组件自身的状态数据，即 setup 的返回值
            isMounted: false, // 用来表示组件是否已经被挂载，初始值为 false
            subTree: null // 组件所渲染的内容，即子树 (subTree)
        }
        vnode.component = instance
    }

    return {
        createApp: createAppAPI(render)
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent)
                render(vnode, rootContainer)
            }
        }
    }
}

function createElement(type) {
    return document.createElement(type)
}

function insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null)
}

function remove(child) {
    const parent = child.parentNode 
    if(parent) {
        parent.removeChild(child)
    }
}

function setElementText(el, text) {
    el.textContent = text
}

const renderer = createRenderer({
    createElement,
    insert,
    remove,
    setElementText
})

export function createApp(...args) {
    return renderer.createApp(...args)
}