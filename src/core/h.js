import { VNode } from '../vdom/vnode';

const stack = [];

const EMPTY_CHILDREN = [];

/**
 * VNode树可以用作DOM树结构的轻量级表示。这种结构可以通过递归地将它与当前真正的DOM结构进行比较，并仅更新差异的部分。
 * 该方法接收元素名称，属性列表以及可附加到元素的子元素
 * @example
 * `<div id="foo" name="bar">Hello!</div>`
 * 可以通过h函数构造：
 * `h('div', { id: 'foo', name: 'bar' }, 'Hello!');`
 * @param {string | function} nodeName 元素名称，例如：`div`, `a`, `span`, 等等
 * @param {object | null} attributes 元素的属性
 * @param {VNode[]} [rest] 子元素，可以是无限嵌套的数组
 * 
 * @public
 */
export function h(nodeName, attributes) {
    let children = EMPTY_CHILDREN, lastSimple, child ,simple, i;

    for (i = arguments.length; i-- > 2; ) {// 收集第三个之后的参数
        stack.push(arguments[i]);
    }

    if (attributes && attributes.children != null) {
        if (!stack.length) stack.push(attributes.children);
        delete attributes.children;
    }

    // 处理 children
    while (stack.length) {
        if ((child = stack.pop()) && child.pop !== undefined) {
            for (i = child.length; i--; ) stack.push(child[i]);
        } else {
            if (typeof child === 'boolean') child = null;

            if ((simple = typeof nodeName !== 'function')) {
                if (child == null) child = '';
                else if (typeof child === 'number') child = String(child);
                else if (typeof child !== 'string') simple = false;
            }

            if (simple && lastSimple) {
                children[children.length - 1] += child;
            } else if (children === EMPTY_CHILDREN) {
                children = [child];
            } else {
                children.push(child);
            }

            lastSimple = simple;
        }
    }

    let p = new VNode();
    p.nodeName = nodeName;
    p.children = children;
    p.attributes = attributes == null ? undefined : attributes;

    return p;
}


/**
 * flatten (test)
 */
const EMPTY_RESULT = [];
export function flatten() {
    let stack = [], result = EMPTY_RESULT, item, i;

    for (i = arguments.length; i-- > 0; ) {
        stack.push(arguments[i]);
    }

    while (stack.length) {
        if ((item = stack.pop()) && item.pop !== undefined) {
            for (i = item.length; i--; ) stack.push(item[i]);
        } else {
            if (result === EMPTY_RESULT) {
                result = [item];
            } else {
                result.push(item);
            }
        }
    }

    return result;
}