import { IS_NON_DIMENSIONAL } from '../core/constants';

/**
 * 使用给定的nodeName创建一个元素
 * 
 * @param {string} nodeName 要创建的DOM节点
 * @returns {KreactElement} 创建的DOM节点
 */
export function createNode(nodeName) {
    let node = document.createElement(nodeName);
    node.normalizedNodeName = nodeName;
    return node;
}

/**
 * 从其父节点中删除子节点
 * 
 * @param {Node} node 要删除的节点
 */
export function removeNode(node) {
    let parentNode = node.parentNode;
    if (parentNode) parentNode.removeChild(node);
}

/**
 * 以挂钩事件处理钩子函数代理一个事件
 * 
 * @param {Event} e 浏览器事件对象
 * @private
 */
function eventProxy(e) {
    return this._listeners[e.type](e);
}

/**
 * 在给定节点上设置命名属性，对某些名称和事件处理函数具有特殊行为。如果`value`为`null`，则将删除属性/处理函数。
 * 
 * @param {KreactElement} node 变更的元素
 * @param {string} name 要设置的名称/键，例如事件或属性名称
 * @param {*} old 为此名称/节点设置的上一个值
 * @param {*} value 属性值，例如要用作事件处理器的函数
 * @private 
 */
export function setAccessor(node, name, old, value) {
    if (name === 'className') name = 'class';

    if (name === 'class') {
        node.className = value || '';
    } else if (name === 'style') {
        if (!value || typeof value === 'string' || typeof old === 'string') {
            node.style.cssText = value || '';
        }
        if (value && typeof value === 'object') {
            if (typeof old !== 'string') {
                for (let i in old) {
                    if (!(i in value)) {
                        node.style[i] = '';
                    }
                }
            }
            for (let i in value) {
                node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? (value[i] + 'px') : value[i];
            }
        }
    } else if (name[0] == 'o' && name[1] == 'n') {
        let useCapture = name !== (name = name.replace(/Capture$/, ''));

        name = name.toLowerCase().substring(2);

        if (value) {
            if (!old) node.addEventListener(name, eventProxy, useCapture);
        } else {
            node.removeEventListener(name, eventProxy, useCapture);
        }
        (node._listeners || (node._listeners = {}))[name] = value;
    } else {
        // spellcheck的处理方式与所有其他布尔值不同，当值为`false`时不应该删除
        if (value == null || value === false) {
            node.removeAttribute(name);
        } else if (typeof value !== 'function') {
            node.setAttribute(name, value);
        }
    }

}
