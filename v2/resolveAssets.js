import { currentInstance, currentRenderingInstance } from './mini-vue.js'

const COMPONENTS = 'components'

export function resolveComponent(name) {
    return resolveAsset(COMPONENTS, name) || name
}

function resolveAsset(type, name) {
    const instance = currentRenderingInstance || currentInstance
    if (instance) {
      const Component = instance.type
      if (type === COMPONENTS) {
        const selfName = Component.name
        // 如果组件名称是组件本身的名称，则返回组件本身，也就是递归组件
        if(selfName === name) {
           return Component
        }
      }
      console.log('instance.appContext', instance.appContext)
      const res =
      // 局部注册
      resolve(Component[type], name) ||
      // 全局注册
      resolve(instance.appContext[type], name)
      return res
    }
}

function resolve(registry, name) {
    return (
      registry &&
      registry[name]
    )
}