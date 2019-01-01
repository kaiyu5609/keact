import { defer } from './util';
import { renderComponent } from '../vdom/component';
import { diff } from '../vdom/diff';

/**
 * 要重新渲染`dirty`组件的托管队列
 * @type {Array<Component>}
 */
let items = [];

/**
 * 将组件重新排列
 * 
 * @param {Component} component 要重新渲染的组件
 */
export function enqueueRender(component) {
    if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
        defer(rerender);
    }
}

/**
 * 重新渲染所有排队的`dirty`组件
 */
export function rerender() {
    let p;
    while ((p = items.pop())) {
        if (p._dirty) renderComponent(p);
    }
}

/**
 * 将JSX渲染为`parent`元素
 * 
 * @param {VNode} vnode 要渲染的VNode(JSX)
 * @param {KreactElement} parent 要渲染的DOM元素
 * @param {KreactElement} merge 尝试以`merge`为根来重用现有的DOM树
 */
export function render(vnode, parent, merge) {
    return diff(merge, vnode, {}, false,  parent, false);
}