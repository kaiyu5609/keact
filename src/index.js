import { h, h as createElement, flatten } from './core/h';
import { Component } from './core/component';
import { render } from './core/render';

export {
    h,
    flatten,
    Component,
    render
};

export default {
    h,
    flatten,
    Component,
    render
};





/*************TEST**************/

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