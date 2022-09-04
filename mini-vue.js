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
        switch (type) {

        }
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

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
        el: null
    }
    return
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