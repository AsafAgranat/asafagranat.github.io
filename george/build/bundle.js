
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // The programming goals of Split.js are to deliver readable, understandable and
    // maintainable code, while at the same time manually optimizing for tiny minified file size,
    // browser compatibility without additional requirements
    // and very few assumptions about the user's page layout.
    var global$1 = typeof window !== 'undefined' ? window : null;
    var ssr = global$1 === null;
    var document$1 = !ssr ? global$1.document : undefined;

    // Save a couple long function names that are used frequently.
    // This optimization saves around 400 bytes.
    var addEventListener = 'addEventListener';
    var removeEventListener = 'removeEventListener';
    var getBoundingClientRect = 'getBoundingClientRect';
    var gutterStartDragging = '_a';
    var aGutterSize = '_b';
    var bGutterSize = '_c';
    var HORIZONTAL = 'horizontal';
    var NOOP = function () { return false; };

    // Helper function determines which prefixes of CSS calc we need.
    // We only need to do this once on startup, when this anonymous function is called.
    //
    // Tests -webkit, -moz and -o prefixes. Modified from StackOverflow:
    // http://stackoverflow.com/questions/16625140/js-feature-detection-to-detect-the-usage-of-webkit-calc-over-calc/16625167#16625167
    var calc = ssr
        ? 'calc'
        : ((['', '-webkit-', '-moz-', '-o-']
              .filter(function (prefix) {
                  var el = document$1.createElement('div');
                  el.style.cssText = "width:" + prefix + "calc(9px)";

                  return !!el.style.length
              })
              .shift()) + "calc");

    // Helper function checks if its argument is a string-like type
    var isString = function (v) { return typeof v === 'string' || v instanceof String; };

    // Helper function allows elements and string selectors to be used
    // interchangeably. In either case an element is returned. This allows us to
    // do `Split([elem1, elem2])` as well as `Split(['#id1', '#id2'])`.
    var elementOrSelector = function (el) {
        if (isString(el)) {
            var ele = document$1.querySelector(el);
            if (!ele) {
                throw new Error(("Selector " + el + " did not match a DOM element"))
            }
            return ele
        }

        return el
    };

    // Helper function gets a property from the properties object, with a default fallback
    var getOption = function (options, propName, def) {
        var value = options[propName];
        if (value !== undefined) {
            return value
        }
        return def
    };

    var getGutterSize = function (gutterSize, isFirst, isLast, gutterAlign) {
        if (isFirst) {
            if (gutterAlign === 'end') {
                return 0
            }
            if (gutterAlign === 'center') {
                return gutterSize / 2
            }
        } else if (isLast) {
            if (gutterAlign === 'start') {
                return 0
            }
            if (gutterAlign === 'center') {
                return gutterSize / 2
            }
        }

        return gutterSize
    };

    // Default options
    var defaultGutterFn = function (i, gutterDirection) {
        var gut = document$1.createElement('div');
        gut.className = "gutter gutter-" + gutterDirection;
        return gut
    };

    var defaultElementStyleFn = function (dim, size, gutSize) {
        var style = {};

        if (!isString(size)) {
            style[dim] = calc + "(" + size + "% - " + gutSize + "px)";
        } else {
            style[dim] = size;
        }

        return style
    };

    var defaultGutterStyleFn = function (dim, gutSize) {
        var obj;

        return (( obj = {}, obj[dim] = (gutSize + "px"), obj ));
    };

    // The main function to initialize a split. Split.js thinks about each pair
    // of elements as an independant pair. Dragging the gutter between two elements
    // only changes the dimensions of elements in that pair. This is key to understanding
    // how the following functions operate, since each function is bound to a pair.
    //
    // A pair object is shaped like this:
    //
    // {
    //     a: DOM element,
    //     b: DOM element,
    //     aMin: Number,
    //     bMin: Number,
    //     dragging: Boolean,
    //     parent: DOM element,
    //     direction: 'horizontal' | 'vertical'
    // }
    //
    // The basic sequence:
    //
    // 1. Set defaults to something sane. `options` doesn't have to be passed at all.
    // 2. Initialize a bunch of strings based on the direction we're splitting.
    //    A lot of the behavior in the rest of the library is paramatized down to
    //    rely on CSS strings and classes.
    // 3. Define the dragging helper functions, and a few helpers to go with them.
    // 4. Loop through the elements while pairing them off. Every pair gets an
    //    `pair` object and a gutter.
    // 5. Actually size the pair elements, insert gutters and attach event listeners.
    var Split = function (idsOption, options) {
        if ( options === void 0 ) options = {};

        if (ssr) { return {} }

        var ids = idsOption;
        var dimension;
        var clientAxis;
        var position;
        var positionEnd;
        var clientSize;
        var elements;

        // Allow HTMLCollection to be used as an argument when supported
        if (Array.from) {
            ids = Array.from(ids);
        }

        // All DOM elements in the split should have a common parent. We can grab
        // the first elements parent and hope users read the docs because the
        // behavior will be whacky otherwise.
        var firstElement = elementOrSelector(ids[0]);
        var parent = firstElement.parentNode;
        var parentStyle = getComputedStyle ? getComputedStyle(parent) : null;
        var parentFlexDirection = parentStyle ? parentStyle.flexDirection : null;

        // Set default options.sizes to equal percentages of the parent element.
        var sizes = getOption(options, 'sizes') || ids.map(function () { return 100 / ids.length; });

        // Standardize minSize and maxSize to an array if it isn't already.
        // This allows minSize and maxSize to be passed as a number.
        var minSize = getOption(options, 'minSize', 100);
        var minSizes = Array.isArray(minSize) ? minSize : ids.map(function () { return minSize; });
        var maxSize = getOption(options, 'maxSize', Infinity);
        var maxSizes = Array.isArray(maxSize) ? maxSize : ids.map(function () { return maxSize; });

        // Get other options
        var expandToMin = getOption(options, 'expandToMin', false);
        var gutterSize = getOption(options, 'gutterSize', 10);
        var gutterAlign = getOption(options, 'gutterAlign', 'center');
        var snapOffset = getOption(options, 'snapOffset', 30);
        var dragInterval = getOption(options, 'dragInterval', 1);
        var direction = getOption(options, 'direction', HORIZONTAL);
        var cursor = getOption(
            options,
            'cursor',
            direction === HORIZONTAL ? 'col-resize' : 'row-resize'
        );
        var gutter = getOption(options, 'gutter', defaultGutterFn);
        var elementStyle = getOption(
            options,
            'elementStyle',
            defaultElementStyleFn
        );
        var gutterStyle = getOption(options, 'gutterStyle', defaultGutterStyleFn);

        // 2. Initialize a bunch of strings based on the direction we're splitting.
        // A lot of the behavior in the rest of the library is paramatized down to
        // rely on CSS strings and classes.
        if (direction === HORIZONTAL) {
            dimension = 'width';
            clientAxis = 'clientX';
            position = 'left';
            positionEnd = 'right';
            clientSize = 'clientWidth';
        } else if (direction === 'vertical') {
            dimension = 'height';
            clientAxis = 'clientY';
            position = 'top';
            positionEnd = 'bottom';
            clientSize = 'clientHeight';
        }

        // 3. Define the dragging helper functions, and a few helpers to go with them.
        // Each helper is bound to a pair object that contains its metadata. This
        // also makes it easy to store references to listeners that that will be
        // added and removed.
        //
        // Even though there are no other functions contained in them, aliasing
        // this to self saves 50 bytes or so since it's used so frequently.
        //
        // The pair object saves metadata like dragging state, position and
        // event listener references.

        function setElementSize(el, size, gutSize, i) {
            // Split.js allows setting sizes via numbers (ideally), or if you must,
            // by string, like '300px'. This is less than ideal, because it breaks
            // the fluid layout that `calc(% - px)` provides. You're on your own if you do that,
            // make sure you calculate the gutter size by hand.
            var style = elementStyle(dimension, size, gutSize, i);

            Object.keys(style).forEach(function (prop) {
                // eslint-disable-next-line no-param-reassign
                el.style[prop] = style[prop];
            });
        }

        function setGutterSize(gutterElement, gutSize, i) {
            var style = gutterStyle(dimension, gutSize, i);

            Object.keys(style).forEach(function (prop) {
                // eslint-disable-next-line no-param-reassign
                gutterElement.style[prop] = style[prop];
            });
        }

        function getSizes() {
            return elements.map(function (element) { return element.size; })
        }

        // Supports touch events, but not multitouch, so only the first
        // finger `touches[0]` is counted.
        function getMousePosition(e) {
            if ('touches' in e) { return e.touches[0][clientAxis] }
            return e[clientAxis]
        }

        // Actually adjust the size of elements `a` and `b` to `offset` while dragging.
        // calc is used to allow calc(percentage + gutterpx) on the whole split instance,
        // which allows the viewport to be resized without additional logic.
        // Element a's size is the same as offset. b's size is total size - a size.
        // Both sizes are calculated from the initial parent percentage,
        // then the gutter size is subtracted.
        function adjust(offset) {
            var a = elements[this.a];
            var b = elements[this.b];
            var percentage = a.size + b.size;

            a.size = (offset / this.size) * percentage;
            b.size = percentage - (offset / this.size) * percentage;

            setElementSize(a.element, a.size, this[aGutterSize], a.i);
            setElementSize(b.element, b.size, this[bGutterSize], b.i);
        }

        // drag, where all the magic happens. The logic is really quite simple:
        //
        // 1. Ignore if the pair is not dragging.
        // 2. Get the offset of the event.
        // 3. Snap offset to min if within snappable range (within min + snapOffset).
        // 4. Actually adjust each element in the pair to offset.
        //
        // ---------------------------------------------------------------------
        // |    | <- a.minSize               ||              b.minSize -> |    |
        // |    |  | <- this.snapOffset      ||     this.snapOffset -> |  |    |
        // |    |  |                         ||                        |  |    |
        // |    |  |                         ||                        |  |    |
        // ---------------------------------------------------------------------
        // | <- this.start                                        this.size -> |
        function drag(e) {
            var offset;
            var a = elements[this.a];
            var b = elements[this.b];

            if (!this.dragging) { return }

            // Get the offset of the event from the first side of the
            // pair `this.start`. Then offset by the initial position of the
            // mouse compared to the gutter size.
            offset =
                getMousePosition(e) -
                this.start +
                (this[aGutterSize] - this.dragOffset);

            if (dragInterval > 1) {
                offset = Math.round(offset / dragInterval) * dragInterval;
            }

            // If within snapOffset of min or max, set offset to min or max.
            // snapOffset buffers a.minSize and b.minSize, so logic is opposite for both.
            // Include the appropriate gutter sizes to prevent overflows.
            if (offset <= a.minSize + snapOffset + this[aGutterSize]) {
                offset = a.minSize + this[aGutterSize];
            } else if (
                offset >=
                this.size - (b.minSize + snapOffset + this[bGutterSize])
            ) {
                offset = this.size - (b.minSize + this[bGutterSize]);
            }

            if (offset >= a.maxSize - snapOffset + this[aGutterSize]) {
                offset = a.maxSize + this[aGutterSize];
            } else if (
                offset <=
                this.size - (b.maxSize - snapOffset + this[bGutterSize])
            ) {
                offset = this.size - (b.maxSize + this[bGutterSize]);
            }

            // Actually adjust the size.
            adjust.call(this, offset);

            // Call the drag callback continously. Don't do anything too intensive
            // in this callback.
            getOption(options, 'onDrag', NOOP)(getSizes());
        }

        // Cache some important sizes when drag starts, so we don't have to do that
        // continously:
        //
        // `size`: The total size of the pair. First + second + first gutter + second gutter.
        // `start`: The leading side of the first element.
        //
        // ------------------------------------------------
        // |      aGutterSize -> |||                      |
        // |                     |||                      |
        // |                     |||                      |
        // |                     ||| <- bGutterSize       |
        // ------------------------------------------------
        // | <- start                             size -> |
        function calculateSizes() {
            // Figure out the parent size minus padding.
            var a = elements[this.a].element;
            var b = elements[this.b].element;

            var aBounds = a[getBoundingClientRect]();
            var bBounds = b[getBoundingClientRect]();

            this.size =
                aBounds[dimension] +
                bBounds[dimension] +
                this[aGutterSize] +
                this[bGutterSize];
            this.start = aBounds[position];
            this.end = aBounds[positionEnd];
        }

        function innerSize(element) {
            // Return nothing if getComputedStyle is not supported (< IE9)
            // Or if parent element has no layout yet
            if (!getComputedStyle) { return null }

            var computedStyle = getComputedStyle(element);

            if (!computedStyle) { return null }

            var size = element[clientSize];

            if (size === 0) { return null }

            if (direction === HORIZONTAL) {
                size -=
                    parseFloat(computedStyle.paddingLeft) +
                    parseFloat(computedStyle.paddingRight);
            } else {
                size -=
                    parseFloat(computedStyle.paddingTop) +
                    parseFloat(computedStyle.paddingBottom);
            }

            return size
        }

        // When specifying percentage sizes that are less than the computed
        // size of the element minus the gutter, the lesser percentages must be increased
        // (and decreased from the other elements) to make space for the pixels
        // subtracted by the gutters.
        function trimToMin(sizesToTrim) {
            // Try to get inner size of parent element.
            // If it's no supported, return original sizes.
            var parentSize = innerSize(parent);
            if (parentSize === null) {
                return sizesToTrim
            }

            if (minSizes.reduce(function (a, b) { return a + b; }, 0) > parentSize) {
                return sizesToTrim
            }

            // Keep track of the excess pixels, the amount of pixels over the desired percentage
            // Also keep track of the elements with pixels to spare, to decrease after if needed
            var excessPixels = 0;
            var toSpare = [];

            var pixelSizes = sizesToTrim.map(function (size, i) {
                // Convert requested percentages to pixel sizes
                var pixelSize = (parentSize * size) / 100;
                var elementGutterSize = getGutterSize(
                    gutterSize,
                    i === 0,
                    i === sizesToTrim.length - 1,
                    gutterAlign
                );
                var elementMinSize = minSizes[i] + elementGutterSize;

                // If element is too smal, increase excess pixels by the difference
                // and mark that it has no pixels to spare
                if (pixelSize < elementMinSize) {
                    excessPixels += elementMinSize - pixelSize;
                    toSpare.push(0);
                    return elementMinSize
                }

                // Otherwise, mark the pixels it has to spare and return it's original size
                toSpare.push(pixelSize - elementMinSize);
                return pixelSize
            });

            // If nothing was adjusted, return the original sizes
            if (excessPixels === 0) {
                return sizesToTrim
            }

            return pixelSizes.map(function (pixelSize, i) {
                var newPixelSize = pixelSize;

                // While there's still pixels to take, and there's enough pixels to spare,
                // take as many as possible up to the total excess pixels
                if (excessPixels > 0 && toSpare[i] - excessPixels > 0) {
                    var takenPixels = Math.min(
                        excessPixels,
                        toSpare[i] - excessPixels
                    );

                    // Subtract the amount taken for the next iteration
                    excessPixels -= takenPixels;
                    newPixelSize = pixelSize - takenPixels;
                }

                // Return the pixel size adjusted as a percentage
                return (newPixelSize / parentSize) * 100
            })
        }

        // stopDragging is very similar to startDragging in reverse.
        function stopDragging() {
            var self = this;
            var a = elements[self.a].element;
            var b = elements[self.b].element;

            if (self.dragging) {
                getOption(options, 'onDragEnd', NOOP)(getSizes());
            }

            self.dragging = false;

            // Remove the stored event listeners. This is why we store them.
            global$1[removeEventListener]('mouseup', self.stop);
            global$1[removeEventListener]('touchend', self.stop);
            global$1[removeEventListener]('touchcancel', self.stop);
            global$1[removeEventListener]('mousemove', self.move);
            global$1[removeEventListener]('touchmove', self.move);

            // Clear bound function references
            self.stop = null;
            self.move = null;

            a[removeEventListener]('selectstart', NOOP);
            a[removeEventListener]('dragstart', NOOP);
            b[removeEventListener]('selectstart', NOOP);
            b[removeEventListener]('dragstart', NOOP);

            a.style.userSelect = '';
            a.style.webkitUserSelect = '';
            a.style.MozUserSelect = '';
            a.style.pointerEvents = '';

            b.style.userSelect = '';
            b.style.webkitUserSelect = '';
            b.style.MozUserSelect = '';
            b.style.pointerEvents = '';

            self.gutter.style.cursor = '';
            self.parent.style.cursor = '';
            document$1.body.style.cursor = '';
        }

        // startDragging calls `calculateSizes` to store the inital size in the pair object.
        // It also adds event listeners for mouse/touch events,
        // and prevents selection while dragging so avoid the selecting text.
        function startDragging(e) {
            // Right-clicking can't start dragging.
            if ('button' in e && e.button !== 0) {
                return
            }

            // Alias frequently used variables to save space. 200 bytes.
            var self = this;
            var a = elements[self.a].element;
            var b = elements[self.b].element;

            // Call the onDragStart callback.
            if (!self.dragging) {
                getOption(options, 'onDragStart', NOOP)(getSizes());
            }

            // Don't actually drag the element. We emulate that in the drag function.
            e.preventDefault();

            // Set the dragging property of the pair object.
            self.dragging = true;

            // Create two event listeners bound to the same pair object and store
            // them in the pair object.
            self.move = drag.bind(self);
            self.stop = stopDragging.bind(self);

            // All the binding. `window` gets the stop events in case we drag out of the elements.
            global$1[addEventListener]('mouseup', self.stop);
            global$1[addEventListener]('touchend', self.stop);
            global$1[addEventListener]('touchcancel', self.stop);
            global$1[addEventListener]('mousemove', self.move);
            global$1[addEventListener]('touchmove', self.move);

            // Disable selection. Disable!
            a[addEventListener]('selectstart', NOOP);
            a[addEventListener]('dragstart', NOOP);
            b[addEventListener]('selectstart', NOOP);
            b[addEventListener]('dragstart', NOOP);

            a.style.userSelect = 'none';
            a.style.webkitUserSelect = 'none';
            a.style.MozUserSelect = 'none';
            a.style.pointerEvents = 'none';

            b.style.userSelect = 'none';
            b.style.webkitUserSelect = 'none';
            b.style.MozUserSelect = 'none';
            b.style.pointerEvents = 'none';

            // Set the cursor at multiple levels
            self.gutter.style.cursor = cursor;
            self.parent.style.cursor = cursor;
            document$1.body.style.cursor = cursor;

            // Cache the initial sizes of the pair.
            calculateSizes.call(self);

            // Determine the position of the mouse compared to the gutter
            self.dragOffset = getMousePosition(e) - self.end;
        }

        // adjust sizes to ensure percentage is within min size and gutter.
        sizes = trimToMin(sizes);

        // 5. Create pair and element objects. Each pair has an index reference to
        // elements `a` and `b` of the pair (first and second elements).
        // Loop through the elements while pairing them off. Every pair gets a
        // `pair` object and a gutter.
        //
        // Basic logic:
        //
        // - Starting with the second element `i > 0`, create `pair` objects with
        //   `a = i - 1` and `b = i`
        // - Set gutter sizes based on the _pair_ being first/last. The first and last
        //   pair have gutterSize / 2, since they only have one half gutter, and not two.
        // - Create gutter elements and add event listeners.
        // - Set the size of the elements, minus the gutter sizes.
        //
        // -----------------------------------------------------------------------
        // |     i=0     |         i=1         |        i=2       |      i=3     |
        // |             |                     |                  |              |
        // |           pair 0                pair 1             pair 2           |
        // |             |                     |                  |              |
        // -----------------------------------------------------------------------
        var pairs = [];
        elements = ids.map(function (id, i) {
            // Create the element object.
            var element = {
                element: elementOrSelector(id),
                size: sizes[i],
                minSize: minSizes[i],
                maxSize: maxSizes[i],
                i: i,
            };

            var pair;

            if (i > 0) {
                // Create the pair object with its metadata.
                pair = {
                    a: i - 1,
                    b: i,
                    dragging: false,
                    direction: direction,
                    parent: parent,
                };

                pair[aGutterSize] = getGutterSize(
                    gutterSize,
                    i - 1 === 0,
                    false,
                    gutterAlign
                );
                pair[bGutterSize] = getGutterSize(
                    gutterSize,
                    false,
                    i === ids.length - 1,
                    gutterAlign
                );

                // if the parent has a reverse flex-direction, switch the pair elements.
                if (
                    parentFlexDirection === 'row-reverse' ||
                    parentFlexDirection === 'column-reverse'
                ) {
                    var temp = pair.a;
                    pair.a = pair.b;
                    pair.b = temp;
                }
            }

            // Determine the size of the current element. IE8 is supported by
            // staticly assigning sizes without draggable gutters. Assigns a string
            // to `size`.
            //
            // Create gutter elements for each pair.
            if (i > 0) {
                var gutterElement = gutter(i, direction, element.element);
                setGutterSize(gutterElement, gutterSize, i);

                // Save bound event listener for removal later
                pair[gutterStartDragging] = startDragging.bind(pair);

                // Attach bound event listener
                gutterElement[addEventListener](
                    'mousedown',
                    pair[gutterStartDragging]
                );
                gutterElement[addEventListener](
                    'touchstart',
                    pair[gutterStartDragging]
                );

                parent.insertBefore(gutterElement, element.element);

                pair.gutter = gutterElement;
            }

            setElementSize(
                element.element,
                element.size,
                getGutterSize(
                    gutterSize,
                    i === 0,
                    i === ids.length - 1,
                    gutterAlign
                ),
                i
            );

            // After the first iteration, and we have a pair object, append it to the
            // list of pairs.
            if (i > 0) {
                pairs.push(pair);
            }

            return element
        });

        function adjustToMin(element) {
            var isLast = element.i === pairs.length;
            var pair = isLast ? pairs[element.i - 1] : pairs[element.i];

            calculateSizes.call(pair);

            var size = isLast
                ? pair.size - element.minSize - pair[bGutterSize]
                : element.minSize + pair[aGutterSize];

            adjust.call(pair, size);
        }

        elements.forEach(function (element) {
            var computedSize = element.element[getBoundingClientRect]()[dimension];

            if (computedSize < element.minSize) {
                if (expandToMin) {
                    adjustToMin(element);
                } else {
                    // eslint-disable-next-line no-param-reassign
                    element.minSize = computedSize;
                }
            }
        });

        function setSizes(newSizes) {
            var trimmed = trimToMin(newSizes);
            trimmed.forEach(function (newSize, i) {
                if (i > 0) {
                    var pair = pairs[i - 1];

                    var a = elements[pair.a];
                    var b = elements[pair.b];

                    a.size = trimmed[i - 1];
                    b.size = newSize;

                    setElementSize(a.element, a.size, pair[aGutterSize], a.i);
                    setElementSize(b.element, b.size, pair[bGutterSize], b.i);
                }
            });
        }

        function destroy(preserveStyles, preserveGutter) {
            pairs.forEach(function (pair) {
                if (preserveGutter !== true) {
                    pair.parent.removeChild(pair.gutter);
                } else {
                    pair.gutter[removeEventListener](
                        'mousedown',
                        pair[gutterStartDragging]
                    );
                    pair.gutter[removeEventListener](
                        'touchstart',
                        pair[gutterStartDragging]
                    );
                }

                if (preserveStyles !== true) {
                    var style = elementStyle(
                        dimension,
                        pair.a.size,
                        pair[aGutterSize]
                    );

                    Object.keys(style).forEach(function (prop) {
                        elements[pair.a].element.style[prop] = '';
                        elements[pair.b].element.style[prop] = '';
                    });
                }
            });
        }

        return {
            setSizes: setSizes,
            getSizes: getSizes,
            collapse: function collapse(i) {
                adjustToMin(elements[i]);
            },
            destroy: destroy,
            parent: parent,
            pairs: pairs,
        }
    };

    /* node_modules\svelte-content-loader\src\ContentLoader.svelte generated by Svelte v3.38.2 */

    const file$3 = "node_modules\\svelte-content-loader\\src\\ContentLoader.svelte";

    // (11:9)      
    function fallback_block(ctx) {
    	let rect;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "width", /*width*/ ctx[8]);
    			attr_dev(rect, "height", /*height*/ ctx[7]);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$3, 11, 4, 338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*width*/ 256) {
    				attr_dev(rect, "width", /*width*/ ctx[8]);
    			}

    			if (dirty & /*height*/ 128) {
    				attr_dev(rect, "height", /*height*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(11:9)      ",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if animate}
    function create_if_block_2$1(ctx) {
    	let animate_1;
    	let animate_1_dur_value;

    	const block = {
    		c: function create() {
    			animate_1 = svg_element("animate");
    			attr_dev(animate_1, "dur", animate_1_dur_value = "" + (/*speed*/ ctx[9] + "s"));
    			attr_dev(animate_1, "values", "-2; 1");
    			attr_dev(animate_1, "attributeName", "offset");
    			attr_dev(animate_1, "repeatCount", "indefinite");
    			add_location(animate_1, file$3, 17, 4, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, animate_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*speed*/ 512 && animate_1_dur_value !== (animate_1_dur_value = "" + (/*speed*/ ctx[9] + "s"))) {
    				attr_dev(animate_1, "dur", animate_1_dur_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(animate_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(17:4) {#if animate}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if animate}
    function create_if_block_1$1(ctx) {
    	let animate_1;
    	let animate_1_dur_value;

    	const block = {
    		c: function create() {
    			animate_1 = svg_element("animate");
    			attr_dev(animate_1, "dur", animate_1_dur_value = "" + (/*speed*/ ctx[9] + "s"));
    			attr_dev(animate_1, "values", "-1.5; 1.5");
    			attr_dev(animate_1, "attributeName", "offset");
    			attr_dev(animate_1, "repeatCount", "indefinite");
    			add_location(animate_1, file$3, 27, 4, 789);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, animate_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*speed*/ 512 && animate_1_dur_value !== (animate_1_dur_value = "" + (/*speed*/ ctx[9] + "s"))) {
    				attr_dev(animate_1, "dur", animate_1_dur_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(animate_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(27:4) {#if animate}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#if animate}
    function create_if_block$1(ctx) {
    	let animate_1;
    	let animate_1_dur_value;

    	const block = {
    		c: function create() {
    			animate_1 = svg_element("animate");
    			attr_dev(animate_1, "dur", animate_1_dur_value = "" + (/*speed*/ ctx[9] + "s"));
    			attr_dev(animate_1, "values", "-1; 2");
    			attr_dev(animate_1, "attributeName", "offset");
    			attr_dev(animate_1, "repeatCount", "indefinite");
    			add_location(animate_1, file$3, 37, 4, 1030);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, animate_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*speed*/ 512 && animate_1_dur_value !== (animate_1_dur_value = "" + (/*speed*/ ctx[9] + "s"))) {
    				attr_dev(animate_1, "dur", animate_1_dur_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(animate_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(37:4) {#if animate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let svg;
    	let title;
    	let t;
    	let rect;
    	let rect_clip_path_value;
    	let defs;
    	let clipPath;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let stop2;
    	let svg_viewBox_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);
    	let if_block0 = /*animate*/ ctx[5] && create_if_block_2$1(ctx);
    	let if_block1 = /*animate*/ ctx[5] && create_if_block_1$1(ctx);
    	let if_block2 = /*animate*/ ctx[5] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title = svg_element("title");
    			t = text("Loading...");
    			rect = svg_element("rect");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			if (if_block0) if_block0.c();
    			stop1 = svg_element("stop");
    			if (if_block1) if_block1.c();
    			stop2 = svg_element("stop");
    			if (if_block2) if_block2.c();
    			attr_dev(title, "id", "loading-aria");
    			add_location(title, file$3, 1, 1, 121);
    			set_style(rect, "fill", "url(" + /*baseUrl*/ ctx[6] + "#" + /*idGradient*/ ctx[11] + ")");
    			attr_dev(rect, "clip-path", rect_clip_path_value = "url(" + /*baseUrl*/ ctx[6] + "#" + /*idClip*/ ctx[10] + ")");
    			attr_dev(rect, "width", /*width*/ ctx[8]);
    			attr_dev(rect, "height", /*height*/ ctx[7]);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			add_location(rect, file$3, 2, 1, 166);
    			attr_dev(clipPath, "id", /*idClip*/ ctx[10]);
    			add_location(clipPath, file$3, 9, 2, 301);
    			attr_dev(stop0, "stop-color", /*primaryColor*/ ctx[2]);
    			attr_dev(stop0, "stop-opacity", /*primaryOpacity*/ ctx[4]);
    			attr_dev(stop0, "offset", "0%");
    			add_location(stop0, file$3, 15, 3, 452);
    			attr_dev(stop1, "stop-color", /*secondaryColor*/ ctx[1]);
    			attr_dev(stop1, "stop-opacity", /*secondaryOpacity*/ ctx[3]);
    			attr_dev(stop1, "offset", "50%");
    			add_location(stop1, file$3, 25, 3, 687);
    			attr_dev(stop2, "stop-color", /*primaryColor*/ ctx[2]);
    			attr_dev(stop2, "stop-opacity", /*primaryOpacity*/ ctx[4]);
    			attr_dev(stop2, "offset", "100%");
    			add_location(stop2, file$3, 35, 3, 931);
    			attr_dev(linearGradient, "id", /*idGradient*/ ctx[11]);
    			add_location(linearGradient, file$3, 14, 2, 416);
    			add_location(defs, file$3, 8, 1, 292);
    			attr_dev(svg, "width", /*width*/ ctx[8]);
    			attr_dev(svg, "height", /*height*/ ctx[7]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*width*/ ctx[8] + " " + /*height*/ ctx[7]);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "ria-labelledby", "loading-aria");
    			attr_dev(svg, "preserveAspectRatio", /*preserveAspectRatio*/ ctx[0]);
    			add_location(svg, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title);
    			append_dev(title, t);
    			append_dev(svg, rect);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(clipPath, null);
    			}

    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			if (if_block0) if_block0.m(stop0, null);
    			append_dev(linearGradient, stop1);
    			if (if_block1) if_block1.m(stop1, null);
    			append_dev(linearGradient, stop2);
    			if (if_block2) if_block2.m(stop2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*baseUrl, idGradient*/ 2112) {
    				set_style(rect, "fill", "url(" + /*baseUrl*/ ctx[6] + "#" + /*idGradient*/ ctx[11] + ")");
    			}

    			if (!current || dirty & /*baseUrl, idClip*/ 1088 && rect_clip_path_value !== (rect_clip_path_value = "url(" + /*baseUrl*/ ctx[6] + "#" + /*idClip*/ ctx[10] + ")")) {
    				attr_dev(rect, "clip-path", rect_clip_path_value);
    			}

    			if (!current || dirty & /*width*/ 256) {
    				attr_dev(rect, "width", /*width*/ ctx[8]);
    			}

    			if (!current || dirty & /*height*/ 128) {
    				attr_dev(rect, "height", /*height*/ ctx[7]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*width, height*/ 384) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*idClip*/ 1024) {
    				attr_dev(clipPath, "id", /*idClip*/ ctx[10]);
    			}

    			if (/*animate*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(stop0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*primaryColor*/ 4) {
    				attr_dev(stop0, "stop-color", /*primaryColor*/ ctx[2]);
    			}

    			if (!current || dirty & /*primaryOpacity*/ 16) {
    				attr_dev(stop0, "stop-opacity", /*primaryOpacity*/ ctx[4]);
    			}

    			if (/*animate*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(stop1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*secondaryColor*/ 2) {
    				attr_dev(stop1, "stop-color", /*secondaryColor*/ ctx[1]);
    			}

    			if (!current || dirty & /*secondaryOpacity*/ 8) {
    				attr_dev(stop1, "stop-opacity", /*secondaryOpacity*/ ctx[3]);
    			}

    			if (/*animate*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(stop2, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*primaryColor*/ 4) {
    				attr_dev(stop2, "stop-color", /*primaryColor*/ ctx[2]);
    			}

    			if (!current || dirty & /*primaryOpacity*/ 16) {
    				attr_dev(stop2, "stop-opacity", /*primaryOpacity*/ ctx[4]);
    			}

    			if (!current || dirty & /*idGradient*/ 2048) {
    				attr_dev(linearGradient, "id", /*idGradient*/ ctx[11]);
    			}

    			if (!current || dirty & /*width*/ 256) {
    				attr_dev(svg, "width", /*width*/ ctx[8]);
    			}

    			if (!current || dirty & /*height*/ 128) {
    				attr_dev(svg, "height", /*height*/ ctx[7]);
    			}

    			if (!current || dirty & /*width, height*/ 384 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*width*/ ctx[8] + " " + /*height*/ ctx[7])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty & /*preserveAspectRatio*/ 1) {
    				attr_dev(svg, "preserveAspectRatio", /*preserveAspectRatio*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function uid() {
    	return Math.random().toString(36).substring(2);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let idClip;
    	let idGradient;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContentLoader", slots, ['default']);

    	let { preserveAspectRatio = "xMidYMid meet" } = $$props,
    		{ secondaryColor = "#ecebeb" } = $$props,
    		{ primaryColor = "#f9f9f9" } = $$props,
    		{ secondaryOpacity = 1 } = $$props,
    		{ primaryOpacity = 1 } = $$props,
    		{ animate = true } = $$props,
    		{ baseUrl = "" } = $$props,
    		{ height = 130 } = $$props,
    		{ width = 400 } = $$props,
    		{ speed = 2 } = $$props,
    		{ uniqueKey } = $$props;

    	const writable_props = [
    		"preserveAspectRatio",
    		"secondaryColor",
    		"primaryColor",
    		"secondaryOpacity",
    		"primaryOpacity",
    		"animate",
    		"baseUrl",
    		"height",
    		"width",
    		"speed",
    		"uniqueKey"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContentLoader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("preserveAspectRatio" in $$props) $$invalidate(0, preserveAspectRatio = $$props.preserveAspectRatio);
    		if ("secondaryColor" in $$props) $$invalidate(1, secondaryColor = $$props.secondaryColor);
    		if ("primaryColor" in $$props) $$invalidate(2, primaryColor = $$props.primaryColor);
    		if ("secondaryOpacity" in $$props) $$invalidate(3, secondaryOpacity = $$props.secondaryOpacity);
    		if ("primaryOpacity" in $$props) $$invalidate(4, primaryOpacity = $$props.primaryOpacity);
    		if ("animate" in $$props) $$invalidate(5, animate = $$props.animate);
    		if ("baseUrl" in $$props) $$invalidate(6, baseUrl = $$props.baseUrl);
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("speed" in $$props) $$invalidate(9, speed = $$props.speed);
    		if ("uniqueKey" in $$props) $$invalidate(12, uniqueKey = $$props.uniqueKey);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		preserveAspectRatio,
    		secondaryColor,
    		primaryColor,
    		secondaryOpacity,
    		primaryOpacity,
    		animate,
    		baseUrl,
    		height,
    		width,
    		speed,
    		uniqueKey,
    		idClip,
    		idGradient
    	});

    	$$self.$inject_state = $$props => {
    		if ("preserveAspectRatio" in $$props) $$invalidate(0, preserveAspectRatio = $$props.preserveAspectRatio);
    		if ("secondaryColor" in $$props) $$invalidate(1, secondaryColor = $$props.secondaryColor);
    		if ("primaryColor" in $$props) $$invalidate(2, primaryColor = $$props.primaryColor);
    		if ("secondaryOpacity" in $$props) $$invalidate(3, secondaryOpacity = $$props.secondaryOpacity);
    		if ("primaryOpacity" in $$props) $$invalidate(4, primaryOpacity = $$props.primaryOpacity);
    		if ("animate" in $$props) $$invalidate(5, animate = $$props.animate);
    		if ("baseUrl" in $$props) $$invalidate(6, baseUrl = $$props.baseUrl);
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("speed" in $$props) $$invalidate(9, speed = $$props.speed);
    		if ("uniqueKey" in $$props) $$invalidate(12, uniqueKey = $$props.uniqueKey);
    		if ("idClip" in $$props) $$invalidate(10, idClip = $$props.idClip);
    		if ("idGradient" in $$props) $$invalidate(11, idGradient = $$props.idGradient);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*uniqueKey*/ 4096) {
    			$$invalidate(10, idClip = uniqueKey ? `${uniqueKey}-idClip` : uid());
    		}

    		if ($$self.$$.dirty & /*uniqueKey*/ 4096) {
    			$$invalidate(11, idGradient = uniqueKey ? `${uniqueKey}-idGradient` : uid());
    		}
    	};

    	return [
    		preserveAspectRatio,
    		secondaryColor,
    		primaryColor,
    		secondaryOpacity,
    		primaryOpacity,
    		animate,
    		baseUrl,
    		height,
    		width,
    		speed,
    		idClip,
    		idGradient,
    		uniqueKey,
    		$$scope,
    		slots
    	];
    }

    class ContentLoader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			preserveAspectRatio: 0,
    			secondaryColor: 1,
    			primaryColor: 2,
    			secondaryOpacity: 3,
    			primaryOpacity: 4,
    			animate: 5,
    			baseUrl: 6,
    			height: 7,
    			width: 8,
    			speed: 9,
    			uniqueKey: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContentLoader",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*uniqueKey*/ ctx[12] === undefined && !("uniqueKey" in props)) {
    			console.warn("<ContentLoader> was created without expected prop 'uniqueKey'");
    		}
    	}

    	get preserveAspectRatio() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set preserveAspectRatio(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryColor() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryColor(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryColor() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryColor(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryOpacity() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryOpacity(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryOpacity() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryOpacity(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animate() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animate(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get baseUrl() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set baseUrl(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get speed() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set speed(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uniqueKey() {
    		throw new Error("<ContentLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uniqueKey(value) {
    		throw new Error("<ContentLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Nav-loader.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\Nav-loader.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:2) <ContentLoader height="110" viewBox="0 0 250 110" primaryColor="#dddddd" secondaryOpacity="0">
    function create_default_slot$1(ctx) {
    	let rect0;
    	let t0;
    	let rect1;
    	let t1;
    	let rect2;
    	let t2;

    	const block = {
    		c: function create() {
    			rect0 = svg_element("rect");
    			t0 = space();
    			rect1 = svg_element("rect");
    			t1 = space();
    			rect2 = svg_element("rect");
    			t2 = space();
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "rx", "3");
    			attr_dev(rect0, "ry", "3");
    			attr_dev(rect0, "width", randomInt$1(80, 220));
    			attr_dev(rect0, "height", "10");
    			add_location(rect0, file$2, 13, 4, 363);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "35");
    			attr_dev(rect1, "rx", "3");
    			attr_dev(rect1, "ry", "3");
    			attr_dev(rect1, "width", randomInt$1(80, 220));
    			attr_dev(rect1, "height", "10");
    			add_location(rect1, file$2, 14, 4, 442);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", "70");
    			attr_dev(rect2, "rx", "3");
    			attr_dev(rect2, "ry", "3");
    			attr_dev(rect2, "width", randomInt$1(80, 220));
    			attr_dev(rect2, "height", "10");
    			add_location(rect2, file$2, 15, 4, 522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, rect1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, rect2, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(rect1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(rect2);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(13:2) <ContentLoader height=\\\"110\\\" viewBox=\\\"0 0 250 110\\\" primaryColor=\\\"#dddddd\\\" secondaryOpacity=\\\"0\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#each Array(count) as _}
    function create_each_block$2(ctx) {
    	let contentloader;
    	let current;

    	contentloader = new ContentLoader({
    			props: {
    				height: "110",
    				viewBox: "0 0 250 110",
    				primaryColor: "#dddddd",
    				secondaryOpacity: "0",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contentloader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contentloader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contentloader_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				contentloader_changes.$$scope = { dirty, ctx };
    			}

    			contentloader.$set(contentloader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contentloader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contentloader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contentloader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(12:0) {#each Array(count) as _}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = Array(/*count*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "loader-wrapper svelte-1ej1tl8");
    			add_location(div, file$2, 10, 0, 204);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*randomInt, count*/ 1) {
    				each_value = Array(/*count*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomInt$1(min, max) {
    	return Math.floor(Math.random() * (max - min)) + min;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav_loader", slots, []);
    	let { count = 3 } = $$props;
    	const writable_props = ["count"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav_loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    	};

    	$$self.$capture_state = () => ({ ContentLoader, count, randomInt: randomInt$1 });

    	$$self.$inject_state = $$props => {
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [count];
    }

    class Nav_loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { count: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav_loader",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get count() {
    		throw new Error("<Nav_loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Nav_loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Docs-loader.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\Docs-loader.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (12:2) <ContentLoader height="300" width="700" viewBox="0 0 700 300" primaryColor="#dddddd" secondaryOpacity="0">
    function create_default_slot(ctx) {
    	let rect;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "rx", "3");
    			attr_dev(rect, "ry", "3");
    			attr_dev(rect, "width", "100%");
    			attr_dev(rect, "height", "300");
    			add_location(rect, file$1, 12, 4, 373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:2) <ContentLoader height=\\\"300\\\" width=\\\"700\\\" viewBox=\\\"0 0 700 300\\\" primaryColor=\\\"#dddddd\\\" secondaryOpacity=\\\"0\\\">",
    		ctx
    	});

    	return block;
    }

    // (10:0) {#each Array(count) as _}
    function create_each_block$1(ctx) {
    	let div;
    	let contentloader;
    	let t;
    	let current;

    	contentloader = new ContentLoader({
    			props: {
    				height: "300",
    				width: "700",
    				viewBox: "0 0 700 300",
    				primaryColor: "#dddddd",
    				secondaryOpacity: "0",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(contentloader.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "loader-wrapper svelte-1n4h5fy");
    			add_location(div, file$1, 10, 0, 229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(contentloader, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contentloader_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				contentloader_changes.$$scope = { dirty, ctx };
    			}

    			contentloader.$set(contentloader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contentloader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contentloader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(contentloader);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:0) {#each Array(count) as _}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = Array(/*count*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*count*/ 1) {
    				each_value = Array(/*count*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomInt(min, max) {
    	return Math.floor(Math.random() * (max - min)) + min;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Docs_loader", slots, []);
    	let { count = 3 } = $$props;
    	const writable_props = ["count"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Docs_loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    	};

    	$$self.$capture_state = () => ({ ContentLoader, count, randomInt });

    	$$self.$inject_state = $$props => {
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [count];
    }

    class Docs_loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { count: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Docs_loader",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get count() {
    		throw new Error("<Docs_loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Docs_loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */

    const { document: document_1, window: window_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (204:4) {#if isMobile}
    function create_if_block_8(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "☰";
    			attr_dev(button, "class", "menu-button svelte-apm650");
    			add_location(button, file, 204, 6, 5616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(204:4) {#if isMobile}",
    		ctx
    	});

    	return block;
    }

    // (210:4) {#if !initializing}
    function create_if_block_7(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*meta*/ ctx[10].updated + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Updated: ");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "meta-date svelte-apm650");
    			add_location(div, file, 210, 6, 5816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*meta*/ 1024 && t1_value !== (t1_value = /*meta*/ ctx[10].updated + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(210:4) {#if !initializing}",
    		ctx
    	});

    	return block;
    }

    // (216:2) {#if menuVisible}
    function create_if_block_4(ctx) {
    	let nav_1;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_6, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*initializing*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value_1 = /*nav*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			nav_1 = element("nav");
    			div = element("div");
    			if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "nav-inner svelte-apm650");
    			add_location(div, file, 217, 6, 5999);
    			attr_dev(nav_1, "id", "nav");
    			attr_dev(nav_1, "class", "svelte-apm650");
    			toggle_class(nav_1, "is-mobile", /*isMobile*/ ctx[8]);
    			add_location(nav_1, file, 216, 4, 5950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav_1, anchor);
    			append_dev(nav_1, div);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}

    			if (dirty[0] & /*nav, selectedNav, handleNavClick, highlightDoc*/ 393234) {
    				each_value_1 = /*nav*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*isMobile*/ 256) {
    				toggle_class(nav_1, "is-mobile", /*isMobile*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav_1);
    			if_blocks[current_block_type_index].d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(216:2) {#if menuVisible}",
    		ctx
    	});

    	return block;
    }

    // (223:8) {:else}
    function create_else_block(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "✕";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "search-input svelte-apm650");
    			attr_dev(input, "id", "searchInput");
    			attr_dev(input, "placeholder", "Start typing");
    			toggle_class(input, "is-mobile", /*isMobile*/ ctx[8]);
    			toggle_class(input, "is-busy", /*searchVal*/ ctx[0].length);
    			toggle_class(input, "is-focused", /*isFocused*/ ctx[6]);
    			add_location(input, file, 228, 14, 6482);
    			attr_dev(button, "class", "clear-input svelte-apm650");
    			add_location(button, file, 241, 14, 6968);
    			attr_dev(div, "class", "search-input-wrapper svelte-apm650");
    			toggle_class(div, "is-mobile", /*isMobile*/ ctx[8]);
    			add_location(div, file, 223, 10, 6170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*searchVal*/ ctx[0]);
    			/*input_binding*/ ctx[22](input);
    			append_dev(div, t0);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[21]),
    					listen_dev(input, "focus", /*onInputFocus*/ ctx[11], false, false, false),
    					listen_dev(input, "blur", /*onInputBlur*/ ctx[12], false, false, false),
    					listen_dev(button, "click", /*clearInput*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchVal*/ 1 && input.value !== /*searchVal*/ ctx[0]) {
    				set_input_value(input, /*searchVal*/ ctx[0]);
    			}

    			if (dirty[0] & /*isMobile*/ 256) {
    				toggle_class(input, "is-mobile", /*isMobile*/ ctx[8]);
    			}

    			if (dirty[0] & /*searchVal*/ 1) {
    				toggle_class(input, "is-busy", /*searchVal*/ ctx[0].length);
    			}

    			if (dirty[0] & /*isFocused*/ 64) {
    				toggle_class(input, "is-focused", /*isFocused*/ ctx[6]);
    			}

    			if (dirty[0] & /*isMobile*/ 256) {
    				toggle_class(div, "is-mobile", /*isMobile*/ ctx[8]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(223:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (219:8) {#if initializing}
    function create_if_block_6(ctx) {
    	let div;
    	let navloader;
    	let current;
    	navloader = new Nav_loader({ props: { count: 5 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(navloader.$$.fragment);
    			attr_dev(div, "class", "nav-loader svelte-apm650");
    			add_location(div, file, 219, 10, 6062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(navloader, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navloader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navloader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(navloader);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(219:8) {#if initializing}",
    		ctx
    	});

    	return block;
    }

    // (249:12) {#if nav.multiple}
    function create_if_block_5(ctx) {
    	let span;
    	let t_value = /*nav*/ ctx[1].brief.replace("[\"toolmode\"]", "") + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "link-brief svelte-apm650");
    			add_location(span, file, 249, 14, 7430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*nav*/ 2 && t_value !== (t_value = /*nav*/ ctx[1].brief.replace("[\"toolmode\"]", "") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(249:12) {#if nav.multiple}",
    		ctx
    	});

    	return block;
    }

    // (246:8) {#each nav as nav}
    function create_each_block_1(ctx) {
    	let a;
    	let span;
    	let t1_value = /*nav*/ ctx[1].id.replace("tv_", "") + "";
    	let t1;
    	let t2;
    	let t3;
    	let a_href_value;
    	let a_title_value;
    	let mounted;
    	let dispose;
    	let if_block = /*nav*/ ctx[1].multiple && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = "tv_";
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			attr_dev(span, "class", "link-prefix svelte-apm650");
    			add_location(span, file, 247, 12, 7319);
    			attr_dev(a, "href", a_href_value = `#${/*nav*/ ctx[1].id}_${/*nav*/ ctx[1].index}`);
    			attr_dev(a, "title", a_title_value = `${/*nav*/ ctx[1].brief}`);
    			attr_dev(a, "class", "svelte-apm650");
    			toggle_class(a, "selected", /*selectedNav*/ ctx[4] === /*nav*/ ctx[1].id);
    			add_location(a, file, 246, 10, 7129);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			if (if_block) if_block.m(a, null);
    			append_dev(a, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						a,
    						"click",
    						function () {
    							if (is_function(/*handleNavClick*/ ctx[17](/*nav*/ ctx[1].id))) /*handleNavClick*/ ctx[17](/*nav*/ ctx[1].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						a,
    						"click",
    						function () {
    							if (is_function(/*highlightDoc*/ ctx[18](/*nav*/ ctx[1].id, /*nav*/ ctx[1].index))) /*highlightDoc*/ ctx[18](/*nav*/ ctx[1].id, /*nav*/ ctx[1].index).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*nav*/ 2 && t1_value !== (t1_value = /*nav*/ ctx[1].id.replace("tv_", "") + "")) set_data_dev(t1, t1_value);

    			if (/*nav*/ ctx[1].multiple) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(a, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*nav*/ 2 && a_href_value !== (a_href_value = `#${/*nav*/ ctx[1].id}_${/*nav*/ ctx[1].index}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty[0] & /*nav*/ 2 && a_title_value !== (a_title_value = `${/*nav*/ ctx[1].brief}`)) {
    				attr_dev(a, "title", a_title_value);
    			}

    			if (dirty[0] & /*selectedNav, nav*/ 18) {
    				toggle_class(a, "selected", /*selectedNav*/ ctx[4] === /*nav*/ ctx[1].id);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(246:8) {#each nav as nav}",
    		ctx
    	});

    	return block;
    }

    // (259:4) {#if initializing}
    function create_if_block_3(ctx) {
    	let div;
    	let docsloader;
    	let current;
    	docsloader = new Docs_loader({ props: { count: 5 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(docsloader.$$.fragment);
    			attr_dev(div, "class", "nav-loader svelte-apm650");
    			add_location(div, file, 259, 6, 7744);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(docsloader, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(docsloader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(docsloader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(docsloader);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(259:4) {#if initializing}",
    		ctx
    	});

    	return block;
    }

    // (282:28) 
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No matching docs";
    			attr_dev(div, "class", "no-content svelte-apm650");
    			add_location(div, file, 282, 6, 8467);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(282:28) ",
    		ctx
    	});

    	return block;
    }

    // (264:4) {#if docs.length > 0}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*docs*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*highlightedDoc, docs*/ 640) {
    				each_value = /*docs*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(264:4) {#if docs.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (272:12) {#if doc.version}
    function create_if_block_1(ctx) {
    	let span;
    	let t_value = /*doc*/ ctx[29].version + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "article-version svelte-apm650");
    			add_location(span, file, 271, 29, 8161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*docs*/ 512 && t_value !== (t_value = /*doc*/ ctx[29].version + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(272:12) {#if doc.version}",
    		ctx
    	});

    	return block;
    }

    // (265:6) {#each docs as doc}
    function create_each_block(ctx) {
    	let div0;
    	let div0_id_value;
    	let t0;
    	let article;
    	let div1;
    	let h2;
    	let t1_value = /*doc*/ ctx[29].id + "";
    	let t1;
    	let t2;
    	let t3;
    	let div2;
    	let section;
    	let pre;
    	let raw_value = /*doc*/ ctx[29].content + "";
    	let t4;
    	let if_block = /*doc*/ ctx[29].version && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			article = element("article");
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div2 = element("div");
    			section = element("section");
    			pre = element("pre");
    			t4 = space();
    			attr_dev(div0, "class", "anchor svelte-apm650");
    			attr_dev(div0, "id", div0_id_value = `${/*doc*/ ctx[29].id}_${/*doc*/ ctx[29].index}`);
    			add_location(div0, file, 265, 8, 7891);
    			attr_dev(h2, "class", "svelte-apm650");
    			add_location(h2, file, 268, 12, 8083);
    			attr_dev(div1, "class", "article-header svelte-apm650");
    			add_location(div1, file, 267, 10, 8041);
    			attr_dev(pre, "class", "svelte-apm650");
    			add_location(pre, file, 275, 14, 8314);
    			attr_dev(section, "class", "svelte-apm650");
    			add_location(section, file, 274, 12, 8289);
    			attr_dev(div2, "class", "article-content svelte-apm650");
    			add_location(div2, file, 273, 10, 8246);
    			attr_dev(article, "class", "svelte-apm650");
    			toggle_class(article, "is-highlighted", /*highlightedDoc*/ ctx[7] === `${/*doc*/ ctx[29].id}_${/*doc*/ ctx[29].index}`);
    			add_location(article, file, 266, 8, 7953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(article, t3);
    			append_dev(article, div2);
    			append_dev(div2, section);
    			append_dev(section, pre);
    			pre.innerHTML = raw_value;
    			append_dev(article, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*docs*/ 512 && div0_id_value !== (div0_id_value = `${/*doc*/ ctx[29].id}_${/*doc*/ ctx[29].index}`)) {
    				attr_dev(div0, "id", div0_id_value);
    			}

    			if (dirty[0] & /*docs*/ 512 && t1_value !== (t1_value = /*doc*/ ctx[29].id + "")) set_data_dev(t1, t1_value);

    			if (/*doc*/ ctx[29].version) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*docs*/ 512 && raw_value !== (raw_value = /*doc*/ ctx[29].content + "")) pre.innerHTML = raw_value;
    			if (dirty[0] & /*highlightedDoc, docs*/ 640) {
    				toggle_class(article, "is-highlighted", /*highlightedDoc*/ ctx[7] === `${/*doc*/ ctx[29].id}_${/*doc*/ ctx[29].index}`);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(265:6) {#each docs as doc}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let header;
    	let div0;
    	let t1;
    	let h1;
    	let t3;
    	let div1;
    	let t4;
    	let div3;
    	let t5;
    	let main;
    	let t6;
    	let t7;
    	let div2;
    	let t8_value = /*meta*/ ctx[10].copyright + "";
    	let t8;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isMobile*/ ctx[8] && create_if_block_8(ctx);
    	let if_block1 = !/*initializing*/ ctx[2] && create_if_block_7(ctx);
    	let if_block2 = /*menuVisible*/ ctx[5] && create_if_block_4(ctx);
    	let if_block3 = /*initializing*/ ctx[2] && create_if_block_3(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*docs*/ ctx[9].length > 0) return create_if_block;
    		if (!/*initializing*/ ctx[2]) return create_if_block_2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block4 = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			header = element("header");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "TVPaint George Script documentation";
    			t3 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t4 = space();
    			div3 = element("div");
    			if (if_block2) if_block2.c();
    			t5 = space();
    			main = element("main");
    			if (if_block3) if_block3.c();
    			t6 = space();
    			if (if_block4) if_block4.c();
    			t7 = space();
    			div2 = element("div");
    			t8 = text(t8_value);
    			document_1.title = "Blah";
    			attr_dev(h1, "class", "svelte-apm650");
    			toggle_class(h1, "is-mobile", /*isMobile*/ ctx[8]);
    			add_location(h1, file, 206, 4, 5693);
    			attr_dev(div0, "class", "svelte-apm650");
    			add_location(div0, file, 202, 2, 5583);
    			attr_dev(div1, "class", "svelte-apm650");
    			add_location(div1, file, 208, 2, 5778);
    			attr_dev(header, "class", "svelte-apm650");
    			add_location(header, file, 201, 0, 5571);
    			attr_dev(div2, "class", "meta-copyright svelte-apm650");
    			add_location(div2, file, 284, 4, 8530);
    			attr_dev(main, "id", "main");
    			attr_dev(main, "class", "svelte-apm650");
    			toggle_class(main, "is-blocked", /*isMobile*/ ctx[8] && /*menuVisible*/ ctx[5]);
    			toggle_class(main, "is-loading", /*initializing*/ ctx[2]);
    			add_location(main, file, 257, 2, 7594);
    			attr_dev(div3, "class", "wrapper svelte-apm650");
    			add_location(div3, file, 214, 0, 5902);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, h1);
    			append_dev(header, t3);
    			append_dev(header, div1);
    			if (if_block1) if_block1.m(div1, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t5);
    			append_dev(div3, main);
    			if (if_block3) if_block3.m(main, null);
    			append_dev(main, t6);
    			if (if_block4) if_block4.m(main, null);
    			append_dev(main, t7);
    			append_dev(main, div2);
    			append_dev(div2, t8);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[15], false, false, false),
    					listen_dev(main, "click", /*handleMainClick*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*isMobile*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(div0, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*isMobile*/ 256) {
    				toggle_class(h1, "is-mobile", /*isMobile*/ ctx[8]);
    			}

    			if (!/*initializing*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*menuVisible*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*menuVisible*/ 32) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div3, t5);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*initializing*/ ctx[2]) {
    				if (if_block3) {
    					if (dirty[0] & /*initializing*/ 4) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_3(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(main, t6);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if (if_block4) if_block4.d(1);
    				if_block4 = current_block_type && current_block_type(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(main, t7);
    				}
    			}

    			if ((!current || dirty[0] & /*meta*/ 1024) && t8_value !== (t8_value = /*meta*/ ctx[10].copyright + "")) set_data_dev(t8, t8_value);

    			if (dirty[0] & /*isMobile, menuVisible*/ 288) {
    				toggle_class(main, "is-blocked", /*isMobile*/ ctx[8] && /*menuVisible*/ ctx[5]);
    			}

    			if (dirty[0] & /*initializing*/ 4) {
    				toggle_class(main, "is-loading", /*initializing*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();

    			if (if_block4) {
    				if_block4.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const htmlUrl = "https://cors.bridged.cc/https://www.tvpaint.com/doc/tvpaint-animation-11/george-commands";

    function htmlFromString(htmlString) {
    	var div = document.createElement("div");
    	div.innerHTML = htmlString.trim();
    	return div.childNodes;
    }

    function nodelistFromArray(arrayOfNodes) {
    	var div = document.createElement("div");
    	arrayOfNodes.forEach(item => div.appendChild(item));
    	return div.innerHTML;
    }

    function handleSearchButtonClick() {
    	searchVisible = true;
    }

    function instance($$self, $$props, $$invalidate) {
    	let isMobile;
    	let nav;
    	let docs;
    	let meta;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let initializing = true;
    	let searchVal = "";
    	let searchInput;
    	let selectedNav = "";
    	let menuVisible = true;
    	var screen = window.matchMedia("(max-width: 799px)");

    	// let searchVisible;
    	let htmlSource;

    	let navSource = [];
    	let docsSource = [];
    	let isFocused = false;
    	const onInputFocus = () => $$invalidate(6, isFocused = true);
    	const onInputBlur = () => $$invalidate(6, isFocused = false);
    	let highlightedDoc = null;

    	screen.addEventListener("change", e => {
    		if (e.matches) {
    			if (menuVisible) $$invalidate(5, menuVisible = false);
    			$$invalidate(8, isMobile = true);
    			destroySplit();
    		} else {
    			$$invalidate(8, isMobile = false);
    			$$invalidate(5, menuVisible = true);

    			setTimeout(() => {
    				initSplit();
    			});
    		}
    	});

    	// const url =
    	//   "https://raw.githubusercontent.com/AsafAgranat/asafagranat.github.io/master/files/TVP_george_ref.txt";
    	onMount(async () => {
    		await fetch(htmlUrl).then(res => {
    			return res.text();
    		}).then(str => {
    			processFetchResponse(str);
    			initSplit();
    		});
    	});

    	function processFetchResponse(str) {
    		const substr = "<p class=\"code\">";
    		const position = str.indexOf(substr);
    		htmlSource = str.slice(position + substr.length).split(/------|------/g).filter(val => val !== "");
    		let navNodes = htmlFromString(htmlSource[0]);

    		navNodes.forEach((entry, i) => {
    			function setBrief(id, index, text) {
    				return navSource.find(item => item.id === id) || navNodes[i + 2]?.innerText === id;
    			}

    			if (entry.nodeName === "A") {
    				let navItem = {
    					index: i / 2,
    					id: entry.innerText,
    					brief: navNodes[i + 1].textContent,
    					multiple: setBrief(entry.innerText, i, navNodes[i + 1].textContent)
    				};

    				$$invalidate(19, navSource = [...navSource, navItem]);
    			}
    		});

    		let docsNodes = htmlSource.slice(1);

    		docsNodes.forEach((entry, i) => {
    			const node = htmlFromString(entry);

    			function nodesToString(nodelist) {
    				let [...nodes] = nodelist;
    				let arr = nodes.slice(nodes[0].nodeName === "#text" ? 2 : 1);
    				let text = nodelistFromArray(arr);
    				return text.replace("[PARAMETERS]", "<h3>Parameters</h3>").replace("[ERROR]", "<h3>Error</h3>").replace("[WARNING]", "<h3>Warning</h3>").replaceAll("[RETURN]", "<h3>Return</h3>").replaceAll("[COMMENT]", "<h3>Comment</h3>");
    			}

    			let doc = {
    				index: i,
    				id: node[node[0].nodeName === "#text" ? 1 : 0].innerText,
    				...node[0].nodeName === "#text" && { version: node[0].textContent },
    				content: nodesToString(node)
    			};

    			if (docsNodes.length === i + 1) {
    				let footer = htmlFromString(entry);

    				footer.forEach(node => {
    					if (node.nodeName === "FOOTER") {
    						let [...children] = node.childNodes;

    						$$invalidate(10, meta = {
    							updated: children.find(el => el.className === "last-update").innerText.split(":").pop().trim(),
    							copyright: children.find(el => el.className === "copyright").innerText.trim()
    						});
    					}
    				});

    				$$invalidate(2, initializing = false);
    			} else {
    				$$invalidate(20, docsSource = [...docsSource, doc]);
    			}
    		});
    	}

    	var splitInstance = {};

    	function initSplit() {
    		splitInstance = Split(["#nav", "#main"], { sizes: [25, 75], minSize: [100, 300] });
    	}

    	function destroySplit() {
    		splitInstance.destroy();
    	}

    	function clearInput() {
    		$$invalidate(0, searchVal = "");
    		if (isMobile) searchVisible = false;
    	}

    	function toggleMenu() {
    		$$invalidate(5, menuVisible = !menuVisible);
    	}

    	function handleKeydown(event) {
    		if (isMobile) searchVisible = true;

    		setTimeout(() => {
    			if (document.activeElement.id !== "searchInput" && event.keyCode >= 65 && event.keyCode <= 90) {
    				$$invalidate(0, searchVal = event.key);
    				searchInput.focus();
    			}
    		});
    	}

    	function handleMainClick() {
    		if (!isMobile) return;

    		if (menuVisible) {
    			toggleMenu();
    		}
    	}

    	function handleNavClick(name) {
    		if (!isMobile) return;
    		$$invalidate(4, selectedNav = name);
    		toggleMenu();
    	}

    	function highlightDoc(id, index) {
    		$$invalidate(7, highlightedDoc = `${id}_${index}`);

    		setTimeout(
    			() => {
    				$$invalidate(7, highlightedDoc = null);
    			},
    			500
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchVal = this.value;
    		$$invalidate(0, searchVal);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			searchInput = $$value;
    			$$invalidate(3, searchInput);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Split,
    		NavLoader: Nav_loader,
    		DocsLoader: Docs_loader,
    		initializing,
    		searchVal,
    		searchInput,
    		selectedNav,
    		menuVisible,
    		screen,
    		htmlSource,
    		navSource,
    		docsSource,
    		isFocused,
    		onInputFocus,
    		onInputBlur,
    		highlightedDoc,
    		htmlUrl,
    		processFetchResponse,
    		splitInstance,
    		initSplit,
    		destroySplit,
    		htmlFromString,
    		nodelistFromArray,
    		clearInput,
    		toggleMenu,
    		handleKeydown,
    		handleMainClick,
    		handleNavClick,
    		handleSearchButtonClick,
    		highlightDoc,
    		isMobile,
    		nav,
    		docs,
    		meta
    	});

    	$$self.$inject_state = $$props => {
    		if ("initializing" in $$props) $$invalidate(2, initializing = $$props.initializing);
    		if ("searchVal" in $$props) $$invalidate(0, searchVal = $$props.searchVal);
    		if ("searchInput" in $$props) $$invalidate(3, searchInput = $$props.searchInput);
    		if ("selectedNav" in $$props) $$invalidate(4, selectedNav = $$props.selectedNav);
    		if ("menuVisible" in $$props) $$invalidate(5, menuVisible = $$props.menuVisible);
    		if ("screen" in $$props) $$invalidate(25, screen = $$props.screen);
    		if ("htmlSource" in $$props) htmlSource = $$props.htmlSource;
    		if ("navSource" in $$props) $$invalidate(19, navSource = $$props.navSource);
    		if ("docsSource" in $$props) $$invalidate(20, docsSource = $$props.docsSource);
    		if ("isFocused" in $$props) $$invalidate(6, isFocused = $$props.isFocused);
    		if ("highlightedDoc" in $$props) $$invalidate(7, highlightedDoc = $$props.highlightedDoc);
    		if ("splitInstance" in $$props) splitInstance = $$props.splitInstance;
    		if ("isMobile" in $$props) $$invalidate(8, isMobile = $$props.isMobile);
    		if ("nav" in $$props) $$invalidate(1, nav = $$props.nav);
    		if ("docs" in $$props) $$invalidate(9, docs = $$props.docs);
    		if ("meta" in $$props) $$invalidate(10, meta = $$props.meta);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*navSource, searchVal*/ 524289) {
    			$$invalidate(1, nav = navSource.filter(nav => nav.id?.includes(searchVal.toLowerCase())));
    		}

    		if ($$self.$$.dirty[0] & /*docsSource, searchVal*/ 1048577) {
    			$$invalidate(9, docs = docsSource.filter(doc => doc.id?.includes(searchVal.toLowerCase())));
    		}
    	};

    	$$invalidate(8, isMobile = screen.matches);
    	$$invalidate(10, meta = {});

    	return [
    		searchVal,
    		nav,
    		initializing,
    		searchInput,
    		selectedNav,
    		menuVisible,
    		isFocused,
    		highlightedDoc,
    		isMobile,
    		docs,
    		meta,
    		onInputFocus,
    		onInputBlur,
    		clearInput,
    		toggleMenu,
    		handleKeydown,
    		handleMainClick,
    		handleNavClick,
    		highlightDoc,
    		navSource,
    		docsSource,
    		input_input_handler,
    		input_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
