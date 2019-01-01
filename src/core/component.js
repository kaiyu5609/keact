import { FORCE_RENDER } from './constants';
import { extend } from './util';
import { renderComponent } from '../vdom/component';
import { enqueueRender } from './render';

/**
 * 基础组件类
 * 提供`setState()`和`forceUpdate()`，它们触发渲染
 * @typedef {object} Component
 * @param {object} props 初始化props
 * @param {object} context 父组件的getChildContext的初始上下文
 * @public
 * 
 * @example
 * class MyFoo extexds Component {
 *     render(props, state) {
 *         return <div />; 
 *     }
 * }
 */
export function Component(props, context) {
    this._dirty = true;

    this.context = context;

    this.props = props;

    this.state = this.state || {};
}

extend(Component.prototype, {

    /**
     * 更新组件状态并安排重新渲染
     * 
     * @param {object | function} state 将状态属性的字典简单地合并到当前状态，或者是生成这个字典的函数，该函数以当前状态和props作为参数调用
     */
    setState(state) {
        if (!this.prevState) this.prevState = this.state;

        this.state = extend(
            extend({}, this.state), (typeof state === 'function') ? state(this.state, this.props) : state
        );

        enqueueRender(this);
    },

    /**
     * 接收`props`和`state`，并返回一个新的Virtual DOM树来构建
     * Virtual DOM通过[JSX]来构建
     * 
     * @param {object} props 从父元素/组件接收的props（例如：JSX属性）
     * @param {object} state 组件的当前状态
     * @param {object} context 由最近的祖先的`getChildContext()`返回
     * @returns {VNode}
     */
    render() {}

});