/**
 * Virtual DOM Node
 * @typedef VNode
 * @property {string | function} nodeName 要创建DOM节点的字符串 或 要渲染组件的构造函数
 * @property {Array<VNode | string>} children 子节点
 * @property {object} attributes VNode的属性
 */
export const VNode = function VNode() {};