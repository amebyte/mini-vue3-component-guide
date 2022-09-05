import { proxyRefs, effect } from '../node_modules/@vue/reactivity/dist/reactivity.esm-browser.js'
import { createVNode } from './vnode.js'

export let currentInstance = null
export let currentRenderingInstance = null

function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        insert: hostInsert,
    } = options

    function render(vnode, container) {
        patch(null, vnode, container, null, null)
    }

    function patch(n1, n2, container) {
        const { type } = n2
        if(typeof type === 'string') {
            // 作为普通元素进行处理
            if (!n1) {
                // 创建节点
                mountElement(n2, container)
            } else {
                // 更新节点
            }
        } else if(typeof type === 'object') {
            // 如果是 type 是对象，那么就作为组件进行处理
            if(!n1) {
                // 挂载组件
                mountComponent(n2, container)
            } else {
                // 更新组件
            }
        }
    }

    function mountComponent(vnode, container) {
        // 定义组件实例，一个组件实例本质上就是一个对象，它包含与组件有关的状态信息
        const instance = {
            vnode,
            type: vnode.type,
            setupState: null, // 组件自身的状态数据，即 setup 的返回值
            isMounted: false, // 用来表示组件是否已经被挂载，初始值为 false
            subTree: null, // 组件所渲染的内容，即子树 (subTree)
            update: null, // 更新函数
            render: null, // 组件渲染函数
            proxy: null, // 组件代理对象
        }
        vnode.component = instance
        const { setup, render } = instance.type

        setCurrentInstance(instance)
        const setupResult = setup()
        setCurrentInstance(instance)

        if(typeof setupResult === 'object') {
            instance.setupState = proxyRefs(setupResult)
        }
        instance.proxy = new Proxy({ _:instance }, {
            get({ _: instance}, key) {
                if(key in instance.setupState) {
                    return instance.setupState[key]
                }
            }
        })
        instance.render = render

        instance.update = effect(() => {
            // 如果 isMounted 为 false 则是组件挂载阶段
            if(!instance.isMounted) {
                const subTree = (instance.subTree = renderComponentRoot(instance))
                patch(null, subTree, container)
                instance.vnode.el = subTree.el
                instance.isMounted = true
            } else {
                // 组件更新阶段
            }
        })

    }

    function mountElement(vnode, container) {
        const el = (vnode.el = hostCreateElement(vnode.type))
        const { children } = vnode
        if(typeof children === 'string') {
            el.textContent = children
        } else if(Array.isArray(children)) {
            mountChildren(children, container)
        }
        
        hostInsert(el, container)
    }

    function mountChildren(children, container) {
        children.forEach((v) => {
          patch(null, v, container)
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}

function setCurrentInstance(instance) {
    currentInstance = instance
}

function renderComponentRoot(
    instance
  ) {
    const { proxy, render } = instance
    let result
    // 返回上一个实例对象
    const prev = setCurrentRenderingInstance(instance)
    result = render.call(proxy)
    // 再设置当前的渲染对象上一个，具体场景是嵌套循环渲染的时候，渲染完子组件，再去渲染父组件
    setCurrentRenderingInstance(prev)
    return result
}

function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance
    currentRenderingInstance = instance
    return prev
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        const context = createAppContext()
        const installedPlugins = new Set()
        const app = (context.app = {
            use(plugin, ...options) {
                if (installedPlugins.has(plugin)) {
                  console.warn(`Plugin has already been applied to target app.`)
                } else if (plugin && isFunction(plugin.install)) {
                  installedPlugins.add(plugin)
                  plugin.install(app, ...options)
                } else if (isFunction(plugin)) {
                  installedPlugins.add(plugin)
                  plugin(app, ...options)
                }
                return app
            },
            component(name, component) {
                if (!component) {
                  return context.components[name]
                }
                context.components[name] = component
                return app
            },
            mount(rootContainer) {
                const vnode = createVNode(rootComponent)
                vnode.appContext = context
                render(vnode, rootContainer)
            }
        })
        return app
    }
}

function createAppContext() {
    return {
        app: null,
        config: {},
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
      }
}

function createElement(type) {
    return document.createElement(type)
}

function insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null)
}

const renderer = createRenderer({
    createElement,
    insert,
})

export function createApp(...args) {
    return renderer.createApp(...args)
}