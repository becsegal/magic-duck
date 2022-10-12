"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = exports.serialize = exports.MARKER = void 0;
// this should change if we ever change the implementation of the
// serialize/deserialize below, so that babel caches will be invalidated.
//
// this needs to have enough entropy that is it unlikely to collide with
// anything that appears earlier than it in the JS modules.
exports.MARKER = 'eaimeta@70e063a35619d71f';
function serialize(imports) {
    let tokens = [];
    for (let imp of imports) {
        if ('specifier' in imp) {
            tokens.push(imp.isDynamic ? 1 : 0);
            tokens.push(imp.specifier);
        }
        else {
            tokens.push(imp.isDynamic ? 3 : 2);
            tokens.push(imp.cookedQuasis);
            tokens.push(imp.expressionNameHints);
        }
    }
    return `${exports.MARKER}${JSON.stringify(tokens).slice(1, -1)}${exports.MARKER}`;
}
exports.serialize = serialize;
function deserialize(source) {
    let deserializer = new Deserializer(source);
    return deserializer.output;
}
exports.deserialize = deserialize;
class Deserializer {
    constructor(source) {
        this.source = source;
        this.state = {
            type: 'finding-start',
        };
        let r, e;
        this.output = new Promise((resolve, reject) => {
            r = resolve;
            e = reject;
        });
        this.resolve = r;
        this.reject = e;
        source.on('readable', this.run.bind(this));
        source.on('error', this.reject);
        source.on('close', this.finish.bind(this));
    }
    // keeps consuming chunks until we read null (meaning no buffered data
    // available) or the state machine decides to stop
    run() {
        let chunk;
        // setting the read size bigger than the marker length is important. We can
        // deal with a marker split between two chunks, but not three or more.
        while (null !== (chunk = this.source.read(1024))) {
            this.consumeChunk(chunk);
            if (this.state.type === 'done-reading') {
                this.finish();
                break;
            }
        }
    }
    consumeChunk(chunk) {
        let { state } = this;
        switch (state.type) {
            case 'finding-start':
                {
                    let start = chunk.indexOf(exports.MARKER);
                    if (start >= 0) {
                        // found the start, enter finding-end state
                        this.state = {
                            type: 'finding-end',
                            meta: [],
                        };
                        // pass the rest of the chunk forward to the next state
                        return this.consumeChunk(chunk.slice(start + exports.MARKER.length));
                    }
                    let partialMatch = matchesAtEnd(chunk, exports.MARKER);
                    if (partialMatch > 0) {
                        this.state = {
                            type: 'start-partial-match',
                            partialMatch,
                        };
                    }
                }
                break;
            case 'start-partial-match':
                if (chunk.startsWith(exports.MARKER.slice(state.partialMatch))) {
                    // completed partial match, go into finding-end state
                    this.state = {
                        type: 'finding-end',
                        meta: [],
                    };
                    return this.consumeChunk(chunk.slice(exports.MARKER.length - state.partialMatch));
                }
                else {
                    // partial match failed to complete
                    this.state = {
                        type: 'finding-start',
                    };
                    return this.consumeChunk(chunk);
                }
            case 'finding-end': {
                let endIndex = chunk.indexOf(exports.MARKER);
                if (endIndex >= 0) {
                    // found the end
                    this.state = {
                        type: 'done-reading',
                        meta: [...state.meta, chunk.slice(0, endIndex)].join(''),
                    };
                }
                else {
                    let partialMatch = matchesAtEnd(chunk, exports.MARKER);
                    if (partialMatch > 0) {
                        this.state = {
                            type: 'end-partial-match',
                            meta: [...state.meta, chunk.slice(0, -partialMatch)],
                            partialMatch,
                        };
                    }
                    else {
                        state.meta.push(chunk);
                    }
                }
                break;
            }
            case 'end-partial-match':
                if (chunk.startsWith(exports.MARKER.slice(state.partialMatch))) {
                    // completed partial match, go into finding-end state
                    this.state = {
                        type: 'done-reading',
                        meta: state.meta.join(''),
                    };
                }
                else {
                    // partial match failed to complete, so we need to replace the partial
                    // marker match we stripped off the last chunk
                    this.state = {
                        type: 'finding-end',
                        meta: [...state.meta, exports.MARKER.slice(0, state.partialMatch)],
                    };
                    return this.consumeChunk(chunk);
                }
                break;
            case 'done-reading':
            case 'finished':
                throw new Error(`bug: tried to consume more chunks when already done`);
            default:
                throw assertNever(state);
        }
    }
    convertTokens(meta) {
        let tokens = JSON.parse('[' + meta + ']');
        let syntax = [];
        while (tokens.length > 0) {
            let type = tokens.shift();
            switch (type) {
                case 0:
                    syntax.push({
                        isDynamic: false,
                        specifier: tokens.shift(),
                    });
                    break;
                case 1:
                    syntax.push({
                        isDynamic: true,
                        specifier: tokens.shift(),
                    });
                    break;
                case 2:
                    syntax.push({
                        isDynamic: false,
                        cookedQuasis: tokens.shift(),
                        expressionNameHints: tokens.shift(),
                    });
                    break;
                case 3:
                    syntax.push({
                        isDynamic: true,
                        cookedQuasis: tokens.shift(),
                        expressionNameHints: tokens.shift(),
                    });
                    break;
            }
        }
        return syntax;
    }
    finish() {
        if (this.state.type === 'finished') {
            return;
        }
        let syntax;
        if (this.state.type === 'done-reading') {
            syntax = this.convertTokens(this.state.meta);
        }
        else {
            syntax = [];
        }
        this.state = { type: 'finished' };
        this.resolve(syntax);
        this.source.destroy();
    }
}
function assertNever(value) {
    throw new Error(`bug: never should happen ${value}`);
}
function matchesAtEnd(chunk, marker) {
    while (marker.length > 0) {
        if (chunk.endsWith(marker)) {
            return marker.length;
        }
        marker = marker.slice(0, -1);
    }
    return 0;
}
//# sourceMappingURL=analyzer-syntax.js.map