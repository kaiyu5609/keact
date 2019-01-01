# kreact

## 简介

`kreact` —— 拥有虚拟DOM、组件化、生命周期等功能的轻量UI库。
- 官网：`--`
- 文档：`--`
- 源码：`--`

特色（推广的一些亮点）

## 安装下载

- 使用`npm`安装：`npm install kreact`

## 快速使用

#### 一、安装依赖模块

- 使用`npm`安装：`npm install babel-plugin-transform-react-jsx`依赖，用于将`JSX`转换成虚拟DOM。
- 在项目根目录中添加`.babelrc`文件
```js
{
    "plugins": [
        ["transform-react-jsx", { "pragma": "h"}]
    ]
}
```
#### 二、开始使用

```html
<div id="wrapper"></div>
```
```js
import { h, render, Component } from 'kreact';

class Test extends Component {
    render(props) {
        return <p style={props.style}>TEST_COMPONENT</p>;
    }
}

class Clock extends Component {

    constructor(props) {
        super();

        this.state = {
            count: 1
        };
    }

    componentDidMount() {
        console.log('mounted!');
    }

    componentDidUpdate() {
        console.log('updated!');
    }

    clickHandler(ev) {
        let count = this.state.count;
        this.setState({
            count: ++count
        });
    }

    render(props, state) {
        // console.log(props);
        let time = new Date().toLocaleTimeString();

        return <div style={{color: 'orange', cursor: 'pointer'}} onClick={this.clickHandler.bind(this)}>
            <Test style={{color: 'white'}} />
            <p>{ time + ' <' + state.count + '>' }</p>
        </div>;
    }
}

// console.log(<Clock />);

var data = [
    { name: 'dhuang' }
];

render(<Clock data={data} />, document.querySelector('#wrapper'));
```

#### 三、打包
- 可以使用`webpack`进行打包


## 文档
- 使用文档(./doc/use/README.md)
- 二次开发文档(./doc/dev/README.md)

## 交流 & 提问
`(issues 地址)`

## 关于作者

- 个人主页
- 收款二维码


