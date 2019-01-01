import { extend } from '../core/util';

/**
 * 检查两个节点是否相同
 * 
 * @param {KreactElement} node 要进行比较的DOM节点
 * @param {VNode} vnode 要进行比较的虚拟DOM节点
 * @private
 */
export function isSameNodeType(node, vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return node.splitText !== undefined;
    }

    if (typeof vnode.nodeName === 'string') {
        return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
    }

    return node._componentConstructor === vnode.nodeName;
}

/**
 * 检查Element是否具有给定的nodeName，不区分大小写
 * 
 * @param {KreactElement} node 用于检查名称的DOM元素
 * @param {string} nodeName 要比较的非标准化名称
 */
export function isNamedNode(node, nodeName) {
    return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
}

/**
 * 从VNode重构组件的`props`
 * 确保`defaultProps`的默认/回退值：
 * 添加了`vnode.attributes`中不存在的`defaultProps`的自有属性
 * 
 * @param {VNode} vnode 要获取`props`的VNode
 * @returns {object} 当前VNode的`props`
 */
export function getNodeProps(vnode) {
    let props = extend({}, vnode.attributes);
    props.children = vnode.children;

    let defaultProps = vnode.nodeName.defaultProps;
    if (defaultProps !== undefined) {
        for (let i in defaultProps) {
            if (props[i] === undefined) {
                props[i] = defaultProps[i];
            }
        }
    }

    return props;
}