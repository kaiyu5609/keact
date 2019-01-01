/**
 * 从 `props`复制所有的属性到`obj`中
 * 
 * @param {object} obj 
 * @param {object} props 
 * @returns {object}
 * @private
 */
export function extend(obj, props) {
    for (let i in props) obj[i] = props[i];
    return obj;
}

/**
 * 尽快异步调用函数。如果`Promise`可用，则使用它来调度回调，否则退回使用`setTimeout`（主要用于IE<11）
 * @type {(callback: function) => void}
 */
export const defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;