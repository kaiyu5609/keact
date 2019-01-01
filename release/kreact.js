(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["kreact"] = factory();
	else
		root["kreact"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "release";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// 渲染方式
var NO_RENDER = exports.NO_RENDER = 0;
var SYNC_RENDER = exports.SYNC_RENDER = 1;
var FORCE_RENDER = exports.FORCE_RENDER = 2;
var ASYNC_RENDER = exports.ASYNC_RENDER = 3;

var ATTR_KEY = exports.ATTR_KEY = '__kreactattr__';

var IS_NON_DIMENSIONAL = exports.IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extend = extend;
/**
 * 从 `props`复制所有的属性到`obj`中
 * 
 * @param {object} obj 
 * @param {object} props 
 * @returns {object}
 * @private
 */
function extend(obj, props) {
  for (var i in props) {
    obj[i] = props[i];
  }return obj;
}

/**
 * 尽快异步调用函数。如果`Promise`可用，则使用它来调度回调，否则退回使用`setTimeout`（主要用于IE<11）
 * @type {(callback: function) => void}
 */
var defer = exports.defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.recyclerComponents = undefined;
exports.createComponent = createComponent;
exports.setComponentProps = setComponentProps;
exports.renderComponent = renderComponent;
exports.buildComponentFromVNode = buildComponentFromVNode;
exports.unmountComponent = unmountComponent;

var _constants = __webpack_require__(0);

var _render = __webpack_require__(3);

var _index = __webpack_require__(6);

var _diff = __webpack_require__(5);

var _component = __webpack_require__(4);

/**
 * 保留一组组件以便重复使用
 * @type {Component[]}
 * @private
 */
var recyclerComponents = exports.recyclerComponents = [];

/**
 * 创建一个组件。规范化PFC和有类组件之间的差异
 * 
 * @param {function} Ctor 要创建的组件的构造函数
 * @param {object} props 组件的初始props
 * @param {object} context 组件的初始上下文
 * @returns {Component}
 */
function createComponent(Ctor, props, context) {
    var inst = void 0,
        i = recyclerComponents.length;

    if (Ctor.prototype && Ctor.prototype.render) {
        inst = new Ctor(props, context);

        _component.Component.call(inst, props, context);
    } else {
        inst = new _component.Component(props, context);
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
    return this.constructor(props, context);
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
function setComponentProps(component, props, renderMode, context, mountAll) {
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

    if (renderMode !== _constants.NO_RENDER) {
        if (renderMode === _constants.SYNC_RENDER || !component.base) {
            renderComponent(component, _constants.SYNC_RENDER, mountAll);
        } else {
            (0, _render.enqueueRender)(component);
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
function renderComponent(component, renderMode, mountAll, isChild) {
    if (component._disable) return;

    var
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
        rendered = void 0,
        inst = void 0,
        cbase = null;

    // 更新组件
    if (isUpdate) {
        component.props = prevProps;
        component.state = prevState;
        component.context = prevContext;

        if (renderMode !== _constants.FORCE_RENDER && component.shouldComponentUpdate && component.shouldComponentUpdate(props, stata, context) === false) {
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

        var childComponent = rendered && rendered.nodeName,
            base = void 0;

        if (typeof childComponent === 'function') {
            var childProps = (0, _index.getNodeProps)(rendered);
            inst = initialChildComponent;

            if (inst && inst.constructor === childComponent) {
                setComponentProps(inst, childProps, _constants.SYNC_RENDER, context, false);
            } else {
                component._component = inst = createComponent(childComponent, childProps, context);
                inst.nextBase = inst.nextBase || nextBase;
                inst._parentComponent = component;

                setComponentProps(inst, childProps, _constants.NO_RENDER, context, false);
                renderComponent(inst, _constants.SYNC_RENDER, mountAll, true);
            }

            base = inst.base;
        } else {
            cbase = initialBase;

            if (initialBase || renderMode === _constants.SYNC_RENDER) {
                base = (0, _diff.diff)(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
            }
        }

        component.base = base;

        if (base) {
            base._component = component;
            base._componentConstructor = component.constructor;
        }
    }

    if (!isUpdate || mountAll) {
        _diff.mounts.push(component);
    } else if (!skip) {
        // 确保在父组件中的componentDidUpdate()挂钩之前调用子组件的挂起componentDidMount()挂钩。
        if (component.componentDidUpdate) {
            component.componentDidUpdate(prevProps, prevState, snapshot);
        }
    }

    if (!_diff.diffLevel && !isChild) (0, _diff.flushMounts)();
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
function buildComponentFromVNode(dom, vnode, context, mountAll) {
    var c = dom && dom._component,
        originalComponent = c,
        oldDom = dom,
        isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
        isOwner = isDirectOwner,
        props = (0, _index.getNodeProps)(vnode);

    while (c && !isOwner && (c = c._parentComponent)) {
        isOwner = c.constructor === vnode.nodeName;
    }

    if (c && isOwner && (!mountAll || c._component)) {} else {
        var _c = createComponent(vnode.nodeName, props, context);

        if (dom && !_c.nextBase) {
            _c.nextBase = dom;
            // 传递dom/oldDom作为nextBase，如果它未使用到则将会回收它，因此绕过L229的回收
            oldDom = null;
        }

        setComponentProps(_c, props, _constants.SYNC_RENDER, context, mountAll);

        dom = _c.base;

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
function unmountComponent(component) {
    console.log('unmountComponent!');
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.enqueueRender = enqueueRender;
exports.rerender = rerender;
exports.render = render;

var _util = __webpack_require__(1);

var _component = __webpack_require__(2);

var _diff = __webpack_require__(5);

/**
 * 要重新渲染`dirty`组件的托管队列
 * @type {Array<Component>}
 */
var items = [];

/**
 * 将组件重新排列
 * 
 * @param {Component} component 要重新渲染的组件
 */
function enqueueRender(component) {
    if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
        (0, _util.defer)(rerender);
    }
}

/**
 * 重新渲染所有排队的`dirty`组件
 */
function rerender() {
    var p = void 0;
    while (p = items.pop()) {
        if (p._dirty) (0, _component.renderComponent)(p);
    }
}

/**
 * 将JSX渲染为`parent`元素
 * 
 * @param {VNode} vnode 要渲染的VNode(JSX)
 * @param {KreactElement} parent 要渲染的DOM元素
 * @param {KreactElement} merge 尝试以`merge`为根来重用现有的DOM树
 */
function render(vnode, parent, merge) {
    return (0, _diff.diff)(merge, vnode, {}, false, parent, false);
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Component = Component;

var _constants = __webpack_require__(0);

var _util = __webpack_require__(1);

var _component = __webpack_require__(2);

var _render = __webpack_require__(3);

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
function Component(props, context) {
    this._dirty = true;

    this.context = context;

    this.props = props;

    this.state = this.state || {};
}

(0, _util.extend)(Component.prototype, {

    /**
     * 更新组件状态并安排重新渲染
     * 
     * @param {object | function} state 将状态属性的字典简单地合并到当前状态，或者是生成这个字典的函数，该函数以当前状态和props作为参数调用
     */
    setState: function setState(state) {
        if (!this.prevState) this.prevState = this.state;

        this.state = (0, _util.extend)((0, _util.extend)({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);

        (0, _render.enqueueRender)(this);
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
    render: function render() {}
});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.diffLevel = exports.mounts = undefined;
exports.flushMounts = flushMounts;
exports.diff = diff;
exports.recollectNodeTree = recollectNodeTree;
exports.removeChildren = removeChildren;

var _constants = __webpack_require__(0);

var _index = __webpack_require__(6);

var _component = __webpack_require__(2);

var _index2 = __webpack_require__(11);

/**
 * 已挂载且正在等待componentDidMount的组件的队列
 * @type {Array<Component>}
 */
var mounts = exports.mounts = [];

/**
 * Diff递归计数，用于跟踪diff周期的结束
 */
var diffLevel = exports.diffLevel = 0;

/**
 * 调用排队的componentDidMount生命周期方法
 */
function flushMounts() {
    var c = void 0;

    while (c = mounts.shift()) {
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
function diff(dom, vnode, context, mountAll, parent, componentRoot) {
    // diff深度
    exports.diffLevel = diffLevel += 1;

    var ret = idiff(dom, vnode, context, mountAll, componentRoot);

    // 如果parent是一个新的父级元素，则追加 创建好的子元素ret
    if (parent && ret.parentNode !== parent) {
        parent.appendChild(ret);
    }

    // diffLevel减少到0，表示我们正在退出diff
    if (!(exports.diffLevel = diffLevel -= 1)) {
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
    var out = dom;

    // 如果VNode表示组件
    var vnodeName = vnode.nodeName;
    if (typeof vnodeName === 'function') {
        return (0, _component.buildComponentFromVNode)(dom, vnode, context, mountAll);
    }

    // 字符串或数字节点
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        // 生成新的Text节点并回收旧元素
        out = document.createTextNode(vnode);

        if (dom) {
            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
            recollectNodeTree(dom, true);
        }

        out[_constants.ATTR_KEY] = true;

        return out;
    }

    // DOM元素，如果没有现有元素或类型不一致，则创建一个新元素：
    vnodeName = String(vnodeName);
    if (!dom || !(0, _index.isNamedNode)(dom, vnodeName)) {
        out = (0, _index2.createNode)(vnodeName);

        if (dom) {
            // 将子节点移动到替换节点中
            while (dom.firstChild) {
                out.appendChild(dom.firstChild);
            } // 如果先前的元素已组装到DOM中，则将其替换为内联
            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

            // 回收旧元素（跳过非元素节点类型）
            recollectNodeTree(dom, true);
        }
    }

    var fc = out.firstChild,
        props = out[_constants.ATTR_KEY],
        vchildren = vnode.children;

    if (props == null) {
        props = out[_constants.ATTR_KEY] = {};

        // 收集元素上的props
        for (var a = out.attributes, i = a.length; i--;) {
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
    var originalChildren = dom.childNodes,
        children = [],
        min = 0,
        len = originalChildren.length,
        childrenLen = 0,
        vlen = vchildren ? vchildren.length : 0,
        j = void 0,
        c = void 0,
        f = void 0,
        vchild = void 0,
        child = void 0;

    if (len !== 0) {
        for (var i = 0; i < len; i++) {
            var _child = originalChildren[i],
                props = _child[_constants.ATTR_KEY];

            if (props || _child.splitText !== undefined) {
                children[childrenLen++] = _child;
            }
        }
    }

    if (vlen !== 0) {
        for (var _i = 0; _i < vlen; _i++) {
            vchild = vchildren[_i];
            child = null;

            // 尝试从现有子节点中获取相同类型的节点
            if (min < childrenLen) {
                for (j = min; j < childrenLen; j++) {
                    if (children[j] !== undefined && (0, _index.isSameNodeType)(c = children[j], vchild)) {
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

            f = originalChildren[_i];

            if (child && child !== dom && child !== f) {
                if (f == null) {
                    dom.appendChild(child);
                } else if (child === f.nextSibling) {
                    (0, _index2.removeNode)(f);
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
function recollectNodeTree(node, unmountOnly) {
    console.log('recollectNodeTree!');

    if (unmountOnly === false || node[_constants.ATTR_KEY] == null) {
        (0, _index2.removeNode)(node);
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
function removeChildren(node) {
    node = node.lastChild;

    while (node) {
        var next = node.previousSibling;
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
    var name = void 0;

    // 通过将vnode设置为undefined来删除不再存在的属性
    for (name in old) {
        if (!attrs && attrs[name] != null && old[name] != null) {
            (0, _index2.setAccessor)(dom, name, old[name], old[name] = undefined);
        }
    }

    // 添加新的和更新已更改的属性
    for (name in attrs) {
        // 新的属性名，或者新的属性值
        if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
            (0, _index2.setAccessor)(dom, name, old[name], old[name] = attrs[name]);
        }
    }
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isSameNodeType = isSameNodeType;
exports.isNamedNode = isNamedNode;
exports.getNodeProps = getNodeProps;

var _util = __webpack_require__(1);

/**
 * 检查两个节点是否相同
 * 
 * @param {KreactElement} node 要进行比较的DOM节点
 * @param {VNode} vnode 要进行比较的虚拟DOM节点
 * @private
 */
function isSameNodeType(node, vnode) {
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
function isNamedNode(node, nodeName) {
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
function getNodeProps(vnode) {
    var props = (0, _util.extend)({}, vnode.attributes);
    props.children = vnode.children;

    var defaultProps = vnode.nodeName.defaultProps;
    if (defaultProps !== undefined) {
        for (var i in defaultProps) {
            if (props[i] === undefined) {
                props[i] = defaultProps[i];
            }
        }
    }

    return props;
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.render = exports.Component = exports.flatten = exports.h = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _h = __webpack_require__(9);

var _component = __webpack_require__(4);

var _render = __webpack_require__(3);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.h = _h.h;
exports.flatten = _h.flatten;
exports.Component = _component.Component;
exports.render = _render.render;
exports.default = {
    h: _h.h,
    flatten: _h.flatten,
    Component: _component.Component,
    render: _render.render
};

/*************TEST**************/

var Test = function (_Component) {
    _inherits(Test, _Component);

    function Test() {
        _classCallCheck(this, Test);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Test).apply(this, arguments));
    }

    _createClass(Test, [{
        key: 'render',
        value: function render(props) {
            return (0, _h.h)(
                'p',
                { style: props.style },
                'TEST_COMPONENT'
            );
        }
    }]);

    return Test;
}(_component.Component);

var Clock = function (_Component2) {
    _inherits(Clock, _Component2);

    function Clock(props) {
        _classCallCheck(this, Clock);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Clock).call(this));

        _this2.state = {
            count: 1
        };
        return _this2;
    }

    _createClass(Clock, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            console.log('mounted!');
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            console.log('updated!');
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler(ev) {
            var count = this.state.count;
            this.setState({
                count: ++count
            });
        }
    }, {
        key: 'render',
        value: function render(props, state) {
            // console.log(props);
            var time = new Date().toLocaleTimeString();

            return (0, _h.h)(
                'div',
                { style: { color: 'orange', cursor: 'pointer' }, onClick: this.clickHandler.bind(this) },
                (0, _h.h)(Test, { style: { color: 'white' } }),
                (0, _h.h)(
                    'p',
                    null,
                    time + ' <' + state.count + '>'
                )
            );
        }
    }]);

    return Clock;
}(_component.Component);

// console.log(<Clock />);

var data = [{ name: 'dhuang' }];

(0, _render.render)((0, _h.h)(Clock, { data: data }), document.querySelector('#wrapper'));

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.h = h;
exports.flatten = flatten;

var _vnode = __webpack_require__(10);

var stack = [];

var EMPTY_CHILDREN = [];

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
function h(nodeName, attributes) {
    var children = EMPTY_CHILDREN,
        lastSimple = void 0,
        child = void 0,
        simple = void 0,
        i = void 0;

    for (i = arguments.length; i-- > 2;) {
        // 收集第三个之后的参数
        stack.push(arguments[i]);
    }

    if (attributes && attributes.children != null) {
        if (!stack.length) stack.push(attributes.children);
        delete attributes.children;
    }

    // 处理 children
    while (stack.length) {
        if ((child = stack.pop()) && child.pop !== undefined) {
            for (i = child.length; i--;) {
                stack.push(child[i]);
            }
        } else {
            if (typeof child === 'boolean') child = null;

            if (simple = typeof nodeName !== 'function') {
                if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
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

    var p = new _vnode.VNode();
    p.nodeName = nodeName;
    p.children = children;
    p.attributes = attributes == null ? undefined : attributes;

    return p;
}

/**
 * flatten (test)
 */
var EMPTY_RESULT = [];
function flatten() {
    var stack = [],
        result = EMPTY_RESULT,
        item = void 0,
        i = void 0;

    for (i = arguments.length; i-- > 0;) {
        stack.push(arguments[i]);
    }

    while (stack.length) {
        if ((item = stack.pop()) && item.pop !== undefined) {
            for (i = item.length; i--;) {
                stack.push(item[i]);
            }
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

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Virtual DOM Node
 * @typedef VNode
 * @property {string | function} nodeName 要创建DOM节点的字符串 或 要渲染组件的构造函数
 * @property {Array<VNode | string>} children 子节点
 * @property {object} attributes VNode的属性
 */
var VNode = exports.VNode = function VNode() {};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.createNode = createNode;
exports.removeNode = removeNode;
exports.setAccessor = setAccessor;

var _constants = __webpack_require__(0);

/**
 * 使用给定的nodeName创建一个元素
 * 
 * @param {string} nodeName 要创建的DOM节点
 * @returns {KreactElement} 创建的DOM节点
 */
function createNode(nodeName) {
    var node = document.createElement(nodeName);
    node.normalizedNodeName = nodeName;
    return node;
}

/**
 * 从其父节点中删除子节点
 * 
 * @param {Node} node 要删除的节点
 */
function removeNode(node) {
    var parentNode = node.parentNode;
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
function setAccessor(node, name, old, value) {
    if (name === 'className') name = 'class';

    if (name === 'class') {
        node.className = value || '';
    } else if (name === 'style') {
        if (!value || typeof value === 'string' || typeof old === 'string') {
            node.style.cssText = value || '';
        }
        if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
            if (typeof old !== 'string') {
                for (var i in old) {
                    if (!(i in value)) {
                        node.style[i] = '';
                    }
                }
            }
            for (var _i in value) {
                node.style[_i] = typeof value[_i] === 'number' && _constants.IS_NON_DIMENSIONAL.test(_i) === false ? value[_i] + 'px' : value[_i];
            }
        }
    } else if (name[0] == 'o' && name[1] == 'n') {
        var useCapture = name !== (name = name.replace(/Capture$/, ''));

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

/***/ })
/******/ ]);
});
//# sourceMappingURL=kreact.js.map