import { ATTR_KEY } from '../core/constants';
import { isSameNodeType, isNamedNode } from './index';
import { buildComponentFromVNode, unmountComponent } from './component';
import { createNode, removeNode, setAccessor } from '../dom/index';


/**
 * 已挂载且正在等待componentDidMount的组件的队列
 * @type {Array<Component>}
 */
export const mounts = [];

/**
 * Diff递归计数，用于跟踪diff周期的结束
 */
export let diffLevel = 0;

/**
 * 调用排队的componentDidMount生命周期方法
 */
export function flushMounts() {
    let c;
    
    while ((c = mounts.shift())) {
        if (c.componentDidMount) c.componentDidMount();
    }
}


/**
 * 将给定vnode（以及它的深度子节点）中的差异应用到真正的DOM节点
 * 
 * @param {KreactElement} dom 一个DOM节点，可以变成`vnode`的形状
 * @param {VNode} vnode 表示所需DOM结构的VNode（具有形成树的后代）
 * @param {object} context 当前执行上下文
 * @param {boolean} mountAll 是否立即装载所有组件
 * @param {Element} parent 
 * @param {boolean} componentRoot 
 * @returns {KreactElement} 创建/变更后的元素
 * @private
 */
export function diff(dom, vnode, context, mountAll, parent, componentRoot) {
    // diff深度
    diffLevel++;

    let ret = idiff(dom, vnode, context, mountAll, componentRoot);

    // 如果parent是一个新的父级元素，则追加 创建好的子元素ret
    if (parent && ret.parentNode !== parent) {
        parent.appendChild(ret);
    }

    // diffLevel减少到0，表示我们正在退出diff
    if (!--diffLevel) {
        // 调用队列中的componentDidMount生命周期方法
        if (!componentRoot) flushMounts();
    }

    return ret;
}

/**
 * `diff`的内部结构，分开以允许绕过`diffLevel`/`mount`刷新
 * 
 * @param {KreactElement} dom DOM节点
 * @param {VNode} vnode VNode
 * @param {object} context 当前执行上下文
 * @param {boolean} mountAll 是否立即装载所有组件
 * @param {boolean} [componentRoot]
 * @private
 */
function idiff(dom, vnode, context, mountAll, componentRoot) {
    let out = dom;

    // 如果VNode表示组件
    let vnodeName = vnode.nodeName;
    if (typeof vnodeName === 'function') {
        return buildComponentFromVNode(dom, vnode, context, mountAll);
    }


    // 字符串或数字节点
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        // 生成新的Text节点并回收旧元素
        out = document.createTextNode(vnode);
        
        if (dom) {
            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
            recollectNodeTree(dom, true);
        }

        out[ATTR_KEY] = true;

        return out;
    }


    // DOM元素，如果没有现有元素或类型不一致，则创建一个新元素：
    vnodeName = String(vnodeName);
    if (!dom || !isNamedNode(dom, vnodeName)) {
        out = createNode(vnodeName);

        if (dom) {
            // 将子节点移动到替换节点中
            while (dom.firstChild) out.appendChild(dom.firstChild);

            // 如果先前的元素已组装到DOM中，则将其替换为内联
            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

            // 回收旧元素（跳过非元素节点类型）
            recollectNodeTree(dom, true);
        }
    }

    let fc = out.firstChild,
        props = out[ATTR_KEY],
        vchildren = vnode.children;

    if (props == null) {
        props = out[ATTR_KEY] = {};

        // 收集元素上的props
        for (let a = out.attributes, i = a.length; i--; ) {
            props[a[i].name] = a[i].value;
        }
    }

    // 如果有现有的或新的子节点，区别它们：
    if (vchildren && vchildren.length || fc != null) {
        innerDiffNode(out, vchildren, context, mountAll);
    }

    // 将属性从VNode应用到DOM元素：
    diffAttributes(out, vnode.attributes, props);

    return out;
}

/**
 * 将VNode和DOM节点之间的子和属性更改应用于DOM
 * 
 * @param {KreactElement} dom 需要进行比较和变更的子元素
 * @param {VNode} vchildren 要与`dom.childNodes`进行比较的VNode数组
 * @param {object} context 隐式后代上下文对象（来自最近的`getChildContext()`）
 * @param {boolean} mountAll 是否立即装载所有组件
 */
function innerDiffNode(dom, vchildren, context, mountAll) {
    let originalChildren = dom.childNodes,
        children = [],
        min = 0,
        len = originalChildren.length,
        childrenLen = 0,
        vlen = vchildren ? vchildren.length : 0,
        j,
        c,
        f,
        vchild,
        child;

    if (len !== 0) {
        for (let i = 0; i < len; i++) {
            let child = originalChildren[i],
                props = child[ATTR_KEY];

            if (props || child.splitText !== undefined) {
                children[childrenLen++] = child;
            }
        }
    }

    if (vlen !== 0) {
        for (let i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;

            // 尝试从现有子节点中获取相同类型的节点
            if (min < childrenLen) {
                for (j = min; j < childrenLen; j++) {
                    if (children[j] !== undefined && isSameNodeType(c = children[j], vchild)) {
                        child = c;
                        children[j] = undefined;
                        if (j === childrenLen - 1) childrenLen--;
                        if (j === min) min++;
                        break;
                    }
                }
            }

            // 变形匹配/找到/创建的DOM子项以匹配vchild（深）
            child = idiff(child, vchild, context, mountAll);

            f = originalChildren[i];

            if (child && child !== dom && child !== f) {
                if (f == null) {
                    dom.appendChild(child);
                } else if (child === f.nextSibling) {
                    removeNode(f);
                } else {
                    dom.insertBefore(child, f);
                }
            }
        }
    }

    // 删除没有key的子节点
    while (min <= childrenLen) {
        if ((child = children[childrenLen--]) !== undefined) {
            recollectNodeTree(child, false);
        }
    }

}

/**
 * 递归地回收（或只是卸载）节点及其后代
 * 
 * @param {KreactElement} node 开始卸载/删除的DOM节点
 * @param {boolean} [unmountOnly=false] 如果是`true`，则只触发卸载生命周期，跳过删除
 */
export function recollectNodeTree(node, unmountOnly) {
    console.log('recollectNodeTree!');
   
    if (unmountOnly === false || node[ATTR_KEY] == null) {
        removeNode(node);
    }

    removeChildren(node);
}

/**
 * 重新收集/卸载所有的子元素
 * - 我们在这里使用.lastChild，因为它比.firstChild导致更少的回流
 * - 它也比访问.childNodes Live NodeList便宜
 * 
 * @param {*} node 
 */
export function removeChildren(node) {
    node = node.lastChild;

    while (node) {
        let next = node.previousSibling;
        recollectNodeTree(node, true);
        node = next;
    }
}

/**
 * 将属性中的差异从VNode应用于给定的DOM元素
 * 
 * @param {KreactElement} dom 有属性差异的元素
 * @param {object} attrs 键值对 属性状态
 * @param {object} old 当前/以前的属性（来自之前的VNode或元素的prop缓存）
 */
function diffAttributes(dom, attrs, old) {
    let name;

    // 通过将vnode设置为undefined来删除不再存在的属性
    for (name in old) {
        if (!attrs && attrs[name] != null && old[name] != null) {
            setAccessor(dom, name, old[name], old[name] = undefined);
        }
    }

    // 添加新的和更新已更改的属性
    for (name in attrs) {
        // 新的属性名，或者新的属性值
        if (
            name !== 'children' && 
            name !== 'innerHTML' && 
            (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) 
        {
            setAccessor(dom, name, old[name], old[name] = attrs[name]);
        }
    }
}