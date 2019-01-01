import { SYNC_RENDER, NO_RENDER, FORCE_RENDER } from '../core/constants';
import { enqueueRender } from '../core/render';
import { getNodeProps } from './index';
import { diff, mounts, diffLevel, flushMounts } from './diff';
import { Component } from '../core/component';


/**
 * 保留一组组件以便重复使用
 * @type {Component[]}
 * @private
 */
export const recyclerComponents = [];

/**
 * 创建一个组件。规范化PFC和有类组件之间的差异
 * 
 * @param {function} Ctor 要创建的组件的构造函数
 * @param {object} props 组件的初始props
 * @param {object} context 组件的初始上下文
 * @returns {Component}
 */
export function createComponent(Ctor, props, context) {
    let inst, i = recyclerComponents.length;

    if (Ctor.prototype && Ctor.prototype.render) {
        inst = new Ctor(props, context);

        Component.call(inst, props, context);
    } else {
        inst = new Component(props, context);
        inst.constructor = Ctor;
        inst.render = doRender;
    }

    while (i--) {
        if (recyclerComponents[i].constructor === Ctor) {
            inst.nextBase = recyclerComponents[i].nextBase;
            recyclerComponents.splice(i, 1);
            return inst;
        }
    }

    return inst;
}

/**
 * PFC支持实例的`.render()`方法
 * @param {*} props 
 * @param {*} state 
 * @param {*} context 
 */
function doRender(props, state, context) {
    return  this.constructor(props, context);
}


/**
 * 设置组件的`props`并可能重新渲染组件
 * 
 * @param {Comment} component 要设置`props`的组件
 * @param {object} props 新的`props`
 * @param {number} renderMode 指定如何重新渲染组件
 * @param {object} context 新的执行上下文
 * @param {boolean} mountAll 是否立即组装所有组件
 */
export function setComponentProps(component, props, renderMode, context, mountAll) {
    if (component._disable) return;
    component._disable = true;

    if (!component.base || mountAll) {
        if (component.componentWillMount) {
            component.componentWillMount();
        }
    } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(props, context);
    }
    component._disable = false;

    if (renderMode !== NO_RENDER) {
        if (renderMode === SYNC_RENDER || !component.base) {
            renderComponent(component, SYNC_RENDER, mountAll);
        } else {
            enqueueRender(component);
        }
    }

}

/**
 * 渲染组件，触发必要的生命周期事件并考虑高阶组件
 * 
 * @param {Comment} component 要渲染的组件
 * @param {number} renderMode 指定如何重新渲染组件
 * @param {boolean} mountAll 是否立即组装所有组件
 * @param {boolean} isChild 
 * @private
 */
export function renderComponent(component, renderMode, mountAll, isChild) {
    if (component._disable) return;

    let 
        // current
        props = component.props,
        state = component.state,
        context = component.context,
        // previous
        prevProps = component.prevProps || props,
        prevState = component.prevState || state,
        prevContext = component.prevContext || context,
        // hasBase
        isUpdate = component.base,
        nextBase = component.nextBase,
        initialBase = isUpdate || nextBase,
        initialChildComponent = component._component,
        // rendered
        skip = false,
        snapshot = prevContext,
        rendered,
        inst,
        cbase = null;

    // 更新组件
    if (isUpdate) {
        component.props = prevProps;
        component.state = prevState;
        component.context = prevContext;

        if (
            renderMode !== FORCE_RENDER && 
            component.shouldComponentUpdate &&
            component.shouldComponentUpdate(props, stata, context) === false
        ) {
            skip = true;
        } else if (component.componentWillUpdate) {
            component.componentWillUpdate(props, state, context);
        }

        component.props = props;
        component.state = state;
        component.context = context;
    }

    component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
    component._dirty = false;

    if (!skip) {
        rendered = component.render(props, state, context);

        let childComponent = rendered && rendered.nodeName,
            base;

        if (typeof childComponent === 'function') {
            let childProps = getNodeProps(rendered);
            inst = initialChildComponent;

            if (inst && inst.constructor === childComponent) {
                setComponentProps(inst, childProps, SYNC_RENDER, context, false);
            } else {
                component._component = inst = createComponent(childComponent, childProps, context);
                inst.nextBase = inst.nextBase || nextBase;
                inst._parentComponent = component;

                setComponentProps(inst, childProps, NO_RENDER, context, false);
                renderComponent(inst, SYNC_RENDER, mountAll, true);
            }

            base = inst.base;
        } else {
            cbase = initialBase;

            if (initialBase || renderMode === SYNC_RENDER) {
                base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
            }
        }

        component.base = base;

        if (base) {
            base._component = component;
            base._componentConstructor = component.constructor;
        }
    }

    if (!isUpdate || mountAll) {
        mounts.push(component);
    } else if (!skip) {
        // 确保在父组件中的componentDidUpdate()挂钩之前调用子组件的挂起componentDidMount()挂钩。
        if (component.componentDidUpdate) {
            component.componentDidUpdate(prevProps, prevState, snapshot);
        }
    }

    if (!diffLevel && !isChild) flushMounts();

}

/**
 * 将VNode引用的Component应用于DOM
 * 
 * @param {KreactElement} dom 要改变的DOM节点
 * @param {VNode} vnode 组件引用的VNode
 * @param {object} context 当前的执行上下文
 * @param {boolean} mountAll 是否立即组装所有组件
 * @returns {KreactElement} 创建好的/更新的元素
 * @private
 */
export function buildComponentFromVNode(dom, vnode, context, mountAll) {
    let c = dom && dom._component,
        originalComponent = c,
        oldDom = dom,
        isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
        isOwner = isDirectOwner,
        props = getNodeProps(vnode);

    while (c && !isOwner && (c = c._parentComponent)) {
        isOwner = c.constructor === vnode.nodeName;
    }

    if (c && isOwner && (!mountAll || c._component)) {

    } else {
        let c = createComponent(vnode.nodeName, props, context);
        
        if (dom && !c.nextBase) {
            c.nextBase = dom;
            // 传递dom/oldDom作为nextBase，如果它未使用到则将会回收它，因此绕过L229的回收
            oldDom = null;
        }

        setComponentProps(c, props, SYNC_RENDER, context, mountAll);
    
        dom = c.base;

        if (oldDom && dom !== oldDom) {
            oldDom._component = null;
            recollectNodeTree(oldDom, false);
        }
    }

    return dom;
}

/**
 * 从DOM中删除组件并回收它
 * 
 * @param {Component} component 要卸载的组件实例
 * @private
 */
export function unmountComponent(component) {
    console.log('unmountComponent!');
}

