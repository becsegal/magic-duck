import { constants, unwrapTemplate } from '@glimmer/util';
import { capabilityFlagsFrom, getComponentTemplate, getInternalComponentManager, getInternalHelperManager, getInternalModifierManager, managerHasCapability } from '@glimmer/manager';
import { templateFactory } from '@glimmer/opcode-compiler';

/**
 * Default component template, which is a plain yield
 */
const DEFAULT_TEMPLATE_BLOCK = [[[18
/* Yield */
, 1, null]], ['&default'], false, []];
const DEFAULT_TEMPLATE = {
  // random uuid
  id: '1b32f5c2-7623-43d6-a0ad-9672898920a1',
  moduleName: '__default__.hbs',
  block: JSON.stringify(DEFAULT_TEMPLATE_BLOCK),
  scope: null,
  isStrictMode: true
};

const WELL_KNOWN_EMPTY_ARRAY = Object.freeze([]);
const STARTER_CONSTANTS = constants(WELL_KNOWN_EMPTY_ARRAY);
const WELL_KNOWN_EMPTY_ARRAY_POSITION = STARTER_CONSTANTS.indexOf(WELL_KNOWN_EMPTY_ARRAY);
class CompileTimeConstantImpl {
  constructor() {
    // `0` means NULL
    this.values = STARTER_CONSTANTS.slice();
    this.indexMap = new Map(this.values.map((value, index) => [value, index]));
  }

  value(value) {
    let indexMap = this.indexMap;
    let index = indexMap.get(value);

    if (index === undefined) {
      index = this.values.push(value) - 1;
      indexMap.set(value, index);
    }

    return index;
  }

  array(values) {
    if (values.length === 0) {
      return WELL_KNOWN_EMPTY_ARRAY_POSITION;
    }

    let handles = new Array(values.length);

    for (let i = 0; i < values.length; i++) {
      handles[i] = this.value(values[i]);
    }

    return this.value(handles);
  }

  toPool() {
    return this.values;
  }

}
class RuntimeConstantsImpl {
  constructor(pool) {
    this.values = pool;
  }

  getValue(handle) {
    return this.values[handle];
  }

  getArray(value) {
    let handles = this.getValue(value);
    let reified = new Array(handles.length);

    for (let i = 0; i < handles.length; i++) {
      let n = handles[i];
      reified[i] = this.getValue(n);
    }

    return reified;
  }

}
class ConstantsImpl extends CompileTimeConstantImpl {
  constructor() {
    super(...arguments);
    this.reifiedArrs = {
      [WELL_KNOWN_EMPTY_ARRAY_POSITION]: WELL_KNOWN_EMPTY_ARRAY
    };
    this.defaultTemplate = templateFactory(DEFAULT_TEMPLATE)(); // Used for tests and debugging purposes, and to be able to analyze large apps
    // This is why it's enabled even in production

    this.helperDefinitionCount = 0;
    this.modifierDefinitionCount = 0;
    this.componentDefinitionCount = 0;
    this.helperDefinitionCache = new WeakMap();
    this.modifierDefinitionCache = new WeakMap();
    this.componentDefinitionCache = new WeakMap();
  }

  helper(definitionState, // TODO: Add a way to expose resolved name for debugging
  _resolvedName = null, isOptional) {
    let handle = this.helperDefinitionCache.get(definitionState);

    if (handle === undefined) {
      let managerOrHelper = getInternalHelperManager(definitionState, isOptional);

      if (managerOrHelper === null) {
        this.helperDefinitionCache.set(definitionState, null);
        return null;
      }
      let helper = typeof managerOrHelper === 'function' ? managerOrHelper : managerOrHelper.getHelper(definitionState);
      handle = this.value(helper);
      this.helperDefinitionCache.set(definitionState, handle);
      this.helperDefinitionCount++;
    }

    return handle;
  }

  modifier(definitionState, resolvedName = null, isOptional) {
    let handle = this.modifierDefinitionCache.get(definitionState);

    if (handle === undefined) {
      let manager = getInternalModifierManager(definitionState, isOptional);

      if (manager === null) {
        this.modifierDefinitionCache.set(definitionState, null);
        return null;
      }

      let definition = {
        resolvedName,
        manager,
        state: definitionState
      };
      handle = this.value(definition);
      this.modifierDefinitionCache.set(definitionState, handle);
      this.modifierDefinitionCount++;
    }

    return handle;
  }

  component(definitionState, owner, isOptional) {
    var _a;

    let definition = this.componentDefinitionCache.get(definitionState);

    if (definition === undefined) {
      let manager = getInternalComponentManager(definitionState, isOptional);

      if (manager === null) {
        this.componentDefinitionCache.set(definitionState, null);
        return null;
      }
      let capabilities = capabilityFlagsFrom(manager.getCapabilities(definitionState));
      let templateFactory$$1 = getComponentTemplate(definitionState);
      let compilable = null;
      let template;

      if (!managerHasCapability(manager, capabilities, 1
      /* DynamicLayout */
      )) {
        template = (_a = templateFactory$$1 === null || templateFactory$$1 === void 0 ? void 0 : templateFactory$$1(owner)) !== null && _a !== void 0 ? _a : this.defaultTemplate;
      } else {
        template = templateFactory$$1 === null || templateFactory$$1 === void 0 ? void 0 : templateFactory$$1(owner);
      }

      if (template !== undefined) {
        template = unwrapTemplate(template);
        compilable = managerHasCapability(manager, capabilities, 1024
        /* Wrapped */
        ) ? template.asWrappedLayout() : template.asLayout();
      }

      definition = {
        resolvedName: null,
        handle: -1,
        manager,
        capabilities,
        state: definitionState,
        compilable
      };
      definition.handle = this.value(definition);
      this.componentDefinitionCache.set(definitionState, definition);
      this.componentDefinitionCount++;
    }

    return definition;
  }

  resolvedComponent(resolvedDefinition, resolvedName) {
    let definition = this.componentDefinitionCache.get(resolvedDefinition);

    if (definition === undefined) {
      let {
        manager,
        state,
        template
      } = resolvedDefinition;
      let capabilities = capabilityFlagsFrom(manager.getCapabilities(resolvedDefinition));
      let compilable = null;

      if (!managerHasCapability(manager, capabilities, 1
      /* DynamicLayout */
      )) {
        template = template !== null && template !== void 0 ? template : this.defaultTemplate;
      }

      if (template !== null) {
        template = unwrapTemplate(template);
        compilable = managerHasCapability(manager, capabilities, 1024
        /* Wrapped */
        ) ? template.asWrappedLayout() : template.asLayout();
      }

      definition = {
        resolvedName,
        handle: -1,
        manager,
        capabilities,
        state,
        compilable
      };
      definition.handle = this.value(definition);
      this.componentDefinitionCache.set(resolvedDefinition, definition);
      this.componentDefinitionCount++;
    }

    return definition;
  }

  getValue(index) {
    return this.values[index];
  }

  getArray(index) {
    let reifiedArrs = this.reifiedArrs;
    let reified = reifiedArrs[index];

    if (reified === undefined) {
      let names = this.getValue(index);
      reified = new Array(names.length);

      for (let i = 0; i < names.length; i++) {
        reified[i] = this.getValue(names[i]);
      }

      reifiedArrs[index] = reified;
    }

    return reified;
  }

}

class RuntimeOpImpl {
  constructor(heap) {
    this.heap = heap;
    this.offset = 0;
  }

  get size() {
    let rawType = this.heap.getbyaddr(this.offset);
    return ((rawType & 768
    /* OPERAND_LEN_MASK */
    ) >> 8
    /* ARG_SHIFT */
    ) + 1;
  }

  get isMachine() {
    let rawType = this.heap.getbyaddr(this.offset);
    return rawType & 1024
    /* MACHINE_MASK */
    ? 1 : 0;
  }

  get type() {
    return this.heap.getbyaddr(this.offset) & 255
    /* TYPE_MASK */
    ;
  }

  get op1() {
    return this.heap.getbyaddr(this.offset + 1);
  }

  get op2() {
    return this.heap.getbyaddr(this.offset + 2);
  }

  get op3() {
    return this.heap.getbyaddr(this.offset + 3);
  }

}

const PAGE_SIZE = 0x100000;
class RuntimeHeapImpl {
  constructor(serializedHeap) {
    let {
      buffer,
      table
    } = serializedHeap;
    this.heap = new Int32Array(buffer);
    this.table = table;
  } // It is illegal to close over this address, as compaction
  // may move it. However, it is legal to use this address
  // multiple times between compactions.


  getaddr(handle) {
    return this.table[handle];
  }

  getbyaddr(address) {
    return this.heap[address];
  }

  sizeof(handle) {
    return sizeof(this.table, handle);
  }

}
function hydrateHeap(serializedHeap) {
  return new RuntimeHeapImpl(serializedHeap);
}
/**
 * The Heap is responsible for dynamically allocating
 * memory in which we read/write the VM's instructions
 * from/to. When we malloc we pass out a VMHandle, which
 * is used as an indirect way of accessing the memory during
 * execution of the VM. Internally we track the different
 * regions of the memory in an int array known as the table.
 *
 * The table 32-bit aligned and has the following layout:
 *
 * | ... | hp (u32) |       info (u32)   | size (u32) |
 * | ... |  Handle  | Scope Size | State | Size       |
 * | ... | 32bits   | 30bits     | 2bits | 32bit      |
 *
 * With this information we effectively have the ability to
 * control when we want to free memory. That being said you
 * can not free during execution as raw address are only
 * valid during the execution. This means you cannot close
 * over them as you will have a bad memory access exception.
 */

class HeapImpl {
  constructor() {
    this.offset = 0;
    this.handle = 0;
    this.heap = new Int32Array(PAGE_SIZE);
    this.handleTable = [];
    this.handleState = [];
  }

  push(item) {
    this.sizeCheck();
    this.heap[this.offset++] = item;
  }

  sizeCheck() {
    let {
      heap
    } = this;

    if (this.offset === this.heap.length) {
      let newHeap = new Int32Array(heap.length + PAGE_SIZE);
      newHeap.set(heap, 0);
      this.heap = newHeap;
    }
  }

  getbyaddr(address) {
    return this.heap[address];
  }

  setbyaddr(address, value) {
    this.heap[address] = value;
  }

  malloc() {
    // push offset, info, size
    this.handleTable.push(this.offset);
    return this.handleTable.length - 1;
  }

  finishMalloc(handle) {
  }

  size() {
    return this.offset;
  } // It is illegal to close over this address, as compaction
  // may move it. However, it is legal to use this address
  // multiple times between compactions.


  getaddr(handle) {
    return this.handleTable[handle];
  }

  sizeof(handle) {
    return sizeof(this.handleTable, handle);
  }

  free(handle) {
    this.handleState[handle] = 1
    /* Freed */
    ;
  }
  /**
   * The heap uses the [Mark-Compact Algorithm](https://en.wikipedia.org/wiki/Mark-compact_algorithm) to shift
   * reachable memory to the bottom of the heap and freeable
   * memory to the top of the heap. When we have shifted all
   * the reachable memory to the top of the heap, we move the
   * offset to the next free position.
   */


  compact() {
    let compactedSize = 0;
    let {
      handleTable,
      handleState,
      heap
    } = this;

    for (let i = 0; i < length; i++) {
      let offset = handleTable[i];
      let size = handleTable[i + 1] - offset;
      let state = handleState[i];

      if (state === 2
      /* Purged */
      ) {
          continue;
        } else if (state === 1
      /* Freed */
      ) {
          // transition to "already freed" aka "purged"
          // a good improvement would be to reuse
          // these slots
          handleState[i] = 2
          /* Purged */
          ;
          compactedSize += size;
        } else if (state === 0
      /* Allocated */
      ) {
          for (let j = offset; j <= i + size; j++) {
            heap[j - compactedSize] = heap[j];
          }

          handleTable[i] = offset - compactedSize;
        } else if (state === 3
      /* Pointer */
      ) {
          handleTable[i] = offset - compactedSize;
        }
    }

    this.offset = this.offset - compactedSize;
  }

  capture(offset = this.offset) {
    // Only called in eager mode
    let buffer = slice(this.heap, 0, offset).buffer;
    return {
      handle: this.handle,
      table: this.handleTable,
      buffer: buffer
    };
  }

}
class RuntimeProgramImpl {
  constructor(constants$$1, heap) {
    this.constants = constants$$1;
    this.heap = heap;
    this._opcode = new RuntimeOpImpl(this.heap);
  }

  opcode(offset) {
    this._opcode.offset = offset;
    return this._opcode;
  }

}

function slice(arr, start, end) {
  if (arr.slice !== undefined) {
    return arr.slice(start, end);
  }

  let ret = new Int32Array(end);

  for (; start < end; start++) {
    ret[start] = arr[start];
  }

  return ret;
}

function sizeof(table, handle) {
  {
    return -1;
  }
}

function artifacts() {
  return {
    constants: new ConstantsImpl(),
    heap: new HeapImpl()
  };
}

export { CompileTimeConstantImpl, RuntimeConstantsImpl, ConstantsImpl, RuntimeHeapImpl, hydrateHeap, HeapImpl, RuntimeProgramImpl, RuntimeOpImpl, artifacts };
