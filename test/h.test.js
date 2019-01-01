import { h } from '../src/h';
import { VNode } from '../src/vnode';

const buildVNode = (nodeName, attributes, children = []) => ({
    nodeName,
    children,
    attributes,
    key: attributes && attributes.key
});

describe('h(jsx)', () => {
    it('should return a VNode', () => {
        let r;
        expect( () => r = h('foo') ).not.toThrow();
        expect(r).toBeDefined();
        expect(r).toBeInstanceOf(VNode);
        expect(r).toHaveProperty('attributes', undefined);
        expect(r).toHaveProperty('children', []);
    });

    it('should preserve row attributes', () => {
        let attrs = { foo: 'bar', baz: 10, func: () => {} },
            r = h('foo', attrs);

        expect(r).toHaveProperty('attributes', attrs);
    });

    it('should support element children', () => {
        let r = h('foo', null, h('bar'), h('baz'));

        expect(r).toHaveProperty('children', [
            buildVNode('bar'),
            buildVNode('baz')
        ]);
    });

    it('should support multiple element children, given as arg list', () => {
        let r = h('foo', null, h('bar'), h('baz', null, h('test')));

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', [
            buildVNode('bar'),
            buildVNode('baz', undefined, [
                buildVNode('test')
            ])
        ]);
    });

    it('should handle multiple element children, given as an array', () => {
        let r = h('foo', null, [
            h('bar'),
            h('baz', null, h('test'))
        ]);

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', [
            buildVNode('bar'),
            buildVNode('baz', undefined, [
                buildVNode('test')
            ])
        ]);
    });

    it('should handle multiple children, flattening one layer as needed', () => {
        let r = h('foo', null, h('bar'), [
            h('baz', null, h('test'))
        ]);

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', [
            buildVNode('bar'),
            buildVNode('baz', undefined, [
                buildVNode('test')
            ])
        ]);
    });

    it('should support nested children', () => {
        const m = x => h(x);

        expect(
            h('foo', null, m('a'), [m('b'), m('c')], m('d'))
        ).toHaveProperty('children', [
            'a', 'b', 'c', 'd'
        ].map(m));

        expect(
            h('foo', null, [m('a'), [m('b'), m('c')], m('d')])
        ).toHaveProperty('children', [
            'a', 'b', 'c', 'd'
        ].map(m));

        expect(
            h('foo', { children: [m('a'), [m('b'), m('c')], m('d')] })
        ).toHaveProperty('children', [
            'a', 'b', 'c', 'd'
        ].map(m));

        expect(
            h('foo', { children: [[m('a'), [m('b'), m('c')], m('d')]] })
        ).toHaveProperty('children', [
            'a', 'b', 'c', 'd'
        ].map(m));

        expect(
            h('foo', { children: m('a') })
        ).toHaveProperty('children', [m('a')]);

        expect(
            h('foo', { children: 'a' })
        ).toHaveProperty('children', ['a']);

    });

    it('should support text children', () => {
        let r = h('foo', null, 'textstuff');

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', ['textstuff']);
    });

    it('should merge adjacent text children', () => {
        let r = h('foo', null, 'one', 'two', h('bar'), 'three', h('baz'), h('baz'), 'four', null, 'five', 'six');

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', [
            'onetwo',
            buildVNode('bar'),
            'three',
            buildVNode('baz'),
            buildVNode('baz'),
            'fourfivesix'
        ]);
    });

    it('should merge nested adjacent text children', () => {
        let r = h('foo', null, 'one', ['two', null, 'three'], null, ['four', null, 'five', null], 'six', null);

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', ['onetwothreefourfivesix']);
    });

    it('should not merge children that are boolean values', () => {
        let r = h('foo', null, 'one', true, 'two', false, 'three');

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', ['onetwothree']);
    });

    it('should not merge children of components', () => {
        let Component = ({ children }) => children;
        let r = h(Comment, null, 'x', 'y');

        expect(r).toBeDefined();
        expect(r).toHaveProperty('children', ['x', 'y']);
    });

});