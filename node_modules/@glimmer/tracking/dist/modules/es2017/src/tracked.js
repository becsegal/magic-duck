import { DEBUG } from '@glimmer/env';
import { trackedData } from '@glimmer/validator';
/**
 * @decorator
 *
 * Marks a property as tracked.
 *
 * By default, a component's properties are expected to be static,
 * meaning you are not able to update them and have the template update accordingly.
 * Marking a property as tracked means that when that property changes,
 * a rerender of the component is scheduled so the template is kept up to date.
 *
 * @example
 *
 * ```typescript
 * import Component from '@glimmer/component';
 * import { tracked } from '@glimmer/tracking';
 *
 * export default class MyComponent extends Component {
 *    @tracked
 *    remainingApples = 10
 * }
 * ```
 *
 * When something changes the component's `remainingApples` property, the rerender
 * will be scheduled.
 *
 * @example Computed Properties
 *
 * In the case that you have a getter that depends on other properties, tracked
 * properties accessed within the getter will automatically be tracked for you.
 * That means when any of those dependent tracked properties is changed, a
 * rerender of the component will be scheduled.
 *
 * In the following example we have two properties,
 * `eatenApples`, and `remainingApples`.
 *
 *
 * ```typescript
 * import Component from '@glimmer/component';
 * import { tracked } from '@glimmer/tracking';
 *
 * const totalApples = 100;
 *
 * export default class MyComponent extends Component {
 *    @tracked
 *    eatenApples = 0
 *
 *    get remainingApples() {
 *      return totalApples - this.eatenApples;
 *    }
 *
 *    increment() {
 *      this.eatenApples = this.eatenApples + 1;
 *    }
 *  }
 * ```
 */
export let tracked = (...args) => {
    let [target, key, descriptor] = args;
    // Error on `@tracked()`, `@tracked(...args)`, and `@tracked get propName()`
    if (DEBUG && typeof target === 'string')
        throwTrackedWithArgumentsError(args);
    if (DEBUG && target === undefined)
        throwTrackedWithEmptyArgumentsError();
    if (DEBUG && descriptor && descriptor.get)
        throwTrackedComputedPropertyError();
    if (descriptor) {
        return descriptorForField(target, key, descriptor);
    }
    else {
        // In TypeScript's implementation, decorators on simple class fields do not
        // receive a descriptor, so we define the property on the target directly.
        Object.defineProperty(target, key, descriptorForField(target, key));
    }
};
function throwTrackedComputedPropertyError() {
    throw new Error(`The @tracked decorator does not need to be applied to getters. Properties implemented using a getter will recompute automatically when any tracked properties they access change.`);
}
function throwTrackedWithArgumentsError(args) {
    throw new Error(`You attempted to use @tracked with ${args.length > 1 ? 'arguments' : 'an argument'} ( @tracked(${args
        .map((d) => `'${d}'`)
        .join(', ')}) ), which is no longer necessary nor supported. Dependencies are now automatically tracked, so you can just use ${'`@tracked`'}.`);
}
function throwTrackedWithEmptyArgumentsError() {
    throw new Error('You attempted to use @tracked(), which is no longer necessary nor supported. Remove the parentheses and you will be good to go!');
}
function descriptorForField(_target, key, desc) {
    if (DEBUG && desc && (desc.value || desc.get || desc.set)) {
        throw new Error(`You attempted to use @tracked on ${String(key)}, but that element is not a class field. @tracked is only usable on class fields. Native getters and setters will autotrack add any tracked fields they encounter, so there is no need mark getters and setters with @tracked.`);
    }
    let { getter, setter } = trackedData(key, desc && desc.initializer);
    return {
        enumerable: true,
        configurable: true,
        get() {
            return getter(this);
        },
        set(newValue) {
            setter(this, newValue);
            propertyDidChange();
        },
    };
}
let propertyDidChange = function () { };
export function setPropertyDidChange(cb) {
    propertyDidChange = cb;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2tlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3RyYWNraW5nL3NyYy90cmFja2VkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRWpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdURHO0FBQ0gsTUFBTSxDQUFDLElBQUksT0FBTyxHQUFzQixDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7SUFDekQsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBRXJDLDRFQUE0RTtJQUM1RSxJQUFJLEtBQUssSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRO1FBQUUsOEJBQThCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUUsSUFBSSxLQUFLLElBQUksTUFBTSxLQUFLLFNBQVM7UUFBRSxtQ0FBbUMsRUFBRSxDQUFDO0lBQ3pFLElBQUksS0FBSyxJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsR0FBRztRQUFFLGlDQUFpQyxFQUFFLENBQUM7SUFFL0UsSUFBSSxVQUFVLEVBQUU7UUFDZCxPQUFPLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDcEQ7U0FBTTtRQUNMLDJFQUEyRTtRQUMzRSwwRUFBMEU7UUFDMUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3JFO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsU0FBUyxpQ0FBaUM7SUFDeEMsTUFBTSxJQUFJLEtBQUssQ0FDYixtTEFBbUwsQ0FDcEwsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLDhCQUE4QixDQUFDLElBQVc7SUFDakQsTUFBTSxJQUFJLEtBQUssQ0FDYixzQ0FDRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxhQUNsQyxlQUFlLElBQUk7U0FDaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ3BCLElBQUksQ0FDSCxJQUFJLENBQ0wsb0hBQW9ILFlBQVksR0FBRyxDQUN2SSxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsbUNBQW1DO0lBQzFDLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUlBQWlJLENBQ2xJLENBQUM7QUFDSixDQUFDO0FBaUJELFNBQVMsa0JBQWtCLENBQ3pCLE9BQVUsRUFDVixHQUFNLEVBQ04sSUFBa0M7SUFFbEMsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN6RCxNQUFNLElBQUksS0FBSyxDQUNiLG9DQUFvQyxNQUFNLENBQ3hDLEdBQUcsQ0FDSixnT0FBZ08sQ0FDbE8sQ0FBQztLQUNIO0lBRUQsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxXQUFXLENBQU8sR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFMUUsT0FBTztRQUNMLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFlBQVksRUFBRSxJQUFJO1FBRWxCLEdBQUc7WUFDRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsR0FBRyxDQUFVLFFBQWE7WUFDeEIsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2QixpQkFBaUIsRUFBRSxDQUFDO1FBQ3RCLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQUVELElBQUksaUJBQWlCLEdBQUcsY0FBYSxDQUFDLENBQUM7QUFFdkMsTUFBTSxVQUFVLG9CQUFvQixDQUFDLEVBQWM7SUFDakQsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBERUJVRyB9IGZyb20gJ0BnbGltbWVyL2Vudic7XG5pbXBvcnQgeyB0cmFja2VkRGF0YSB9IGZyb20gJ0BnbGltbWVyL3ZhbGlkYXRvcic7XG5cbi8qKlxuICogQGRlY29yYXRvclxuICpcbiAqIE1hcmtzIGEgcHJvcGVydHkgYXMgdHJhY2tlZC5cbiAqXG4gKiBCeSBkZWZhdWx0LCBhIGNvbXBvbmVudCdzIHByb3BlcnRpZXMgYXJlIGV4cGVjdGVkIHRvIGJlIHN0YXRpYyxcbiAqIG1lYW5pbmcgeW91IGFyZSBub3QgYWJsZSB0byB1cGRhdGUgdGhlbSBhbmQgaGF2ZSB0aGUgdGVtcGxhdGUgdXBkYXRlIGFjY29yZGluZ2x5LlxuICogTWFya2luZyBhIHByb3BlcnR5IGFzIHRyYWNrZWQgbWVhbnMgdGhhdCB3aGVuIHRoYXQgcHJvcGVydHkgY2hhbmdlcyxcbiAqIGEgcmVyZW5kZXIgb2YgdGhlIGNvbXBvbmVudCBpcyBzY2hlZHVsZWQgc28gdGhlIHRlbXBsYXRlIGlzIGtlcHQgdXAgdG8gZGF0ZS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCBDb21wb25lbnQgZnJvbSAnQGdsaW1tZXIvY29tcG9uZW50JztcbiAqIGltcG9ydCB7IHRyYWNrZWQgfSBmcm9tICdAZ2xpbW1lci90cmFja2luZyc7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICogICAgQHRyYWNrZWRcbiAqICAgIHJlbWFpbmluZ0FwcGxlcyA9IDEwXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaGVuIHNvbWV0aGluZyBjaGFuZ2VzIHRoZSBjb21wb25lbnQncyBgcmVtYWluaW5nQXBwbGVzYCBwcm9wZXJ0eSwgdGhlIHJlcmVuZGVyXG4gKiB3aWxsIGJlIHNjaGVkdWxlZC5cbiAqXG4gKiBAZXhhbXBsZSBDb21wdXRlZCBQcm9wZXJ0aWVzXG4gKlxuICogSW4gdGhlIGNhc2UgdGhhdCB5b3UgaGF2ZSBhIGdldHRlciB0aGF0IGRlcGVuZHMgb24gb3RoZXIgcHJvcGVydGllcywgdHJhY2tlZFxuICogcHJvcGVydGllcyBhY2Nlc3NlZCB3aXRoaW4gdGhlIGdldHRlciB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgdHJhY2tlZCBmb3IgeW91LlxuICogVGhhdCBtZWFucyB3aGVuIGFueSBvZiB0aG9zZSBkZXBlbmRlbnQgdHJhY2tlZCBwcm9wZXJ0aWVzIGlzIGNoYW5nZWQsIGFcbiAqIHJlcmVuZGVyIG9mIHRoZSBjb21wb25lbnQgd2lsbCBiZSBzY2hlZHVsZWQuXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlIHdlIGhhdmUgdHdvIHByb3BlcnRpZXMsXG4gKiBgZWF0ZW5BcHBsZXNgLCBhbmQgYHJlbWFpbmluZ0FwcGxlc2AuXG4gKlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCBDb21wb25lbnQgZnJvbSAnQGdsaW1tZXIvY29tcG9uZW50JztcbiAqIGltcG9ydCB7IHRyYWNrZWQgfSBmcm9tICdAZ2xpbW1lci90cmFja2luZyc7XG4gKlxuICogY29uc3QgdG90YWxBcHBsZXMgPSAxMDA7XG4gKlxuICogZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICogICAgQHRyYWNrZWRcbiAqICAgIGVhdGVuQXBwbGVzID0gMFxuICpcbiAqICAgIGdldCByZW1haW5pbmdBcHBsZXMoKSB7XG4gKiAgICAgIHJldHVybiB0b3RhbEFwcGxlcyAtIHRoaXMuZWF0ZW5BcHBsZXM7XG4gKiAgICB9XG4gKlxuICogICAgaW5jcmVtZW50KCkge1xuICogICAgICB0aGlzLmVhdGVuQXBwbGVzID0gdGhpcy5lYXRlbkFwcGxlcyArIDE7XG4gKiAgICB9XG4gKiAgfVxuICogYGBgXG4gKi9cbmV4cG9ydCBsZXQgdHJhY2tlZDogUHJvcGVydHlEZWNvcmF0b3IgPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgbGV0IFt0YXJnZXQsIGtleSwgZGVzY3JpcHRvcl0gPSBhcmdzO1xuXG4gIC8vIEVycm9yIG9uIGBAdHJhY2tlZCgpYCwgYEB0cmFja2VkKC4uLmFyZ3MpYCwgYW5kIGBAdHJhY2tlZCBnZXQgcHJvcE5hbWUoKWBcbiAgaWYgKERFQlVHICYmIHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnKSB0aHJvd1RyYWNrZWRXaXRoQXJndW1lbnRzRXJyb3IoYXJncyk7XG4gIGlmIChERUJVRyAmJiB0YXJnZXQgPT09IHVuZGVmaW5lZCkgdGhyb3dUcmFja2VkV2l0aEVtcHR5QXJndW1lbnRzRXJyb3IoKTtcbiAgaWYgKERFQlVHICYmIGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5nZXQpIHRocm93VHJhY2tlZENvbXB1dGVkUHJvcGVydHlFcnJvcigpO1xuXG4gIGlmIChkZXNjcmlwdG9yKSB7XG4gICAgcmV0dXJuIGRlc2NyaXB0b3JGb3JGaWVsZCh0YXJnZXQsIGtleSwgZGVzY3JpcHRvcik7XG4gIH0gZWxzZSB7XG4gICAgLy8gSW4gVHlwZVNjcmlwdCdzIGltcGxlbWVudGF0aW9uLCBkZWNvcmF0b3JzIG9uIHNpbXBsZSBjbGFzcyBmaWVsZHMgZG8gbm90XG4gICAgLy8gcmVjZWl2ZSBhIGRlc2NyaXB0b3IsIHNvIHdlIGRlZmluZSB0aGUgcHJvcGVydHkgb24gdGhlIHRhcmdldCBkaXJlY3RseS5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIGRlc2NyaXB0b3JGb3JGaWVsZCh0YXJnZXQsIGtleSkpO1xuICB9XG59O1xuXG5mdW5jdGlvbiB0aHJvd1RyYWNrZWRDb21wdXRlZFByb3BlcnR5RXJyb3IoKSB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICBgVGhlIEB0cmFja2VkIGRlY29yYXRvciBkb2VzIG5vdCBuZWVkIHRvIGJlIGFwcGxpZWQgdG8gZ2V0dGVycy4gUHJvcGVydGllcyBpbXBsZW1lbnRlZCB1c2luZyBhIGdldHRlciB3aWxsIHJlY29tcHV0ZSBhdXRvbWF0aWNhbGx5IHdoZW4gYW55IHRyYWNrZWQgcHJvcGVydGllcyB0aGV5IGFjY2VzcyBjaGFuZ2UuYFxuICApO1xufVxuXG5mdW5jdGlvbiB0aHJvd1RyYWNrZWRXaXRoQXJndW1lbnRzRXJyb3IoYXJnczogYW55W10pIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgIGBZb3UgYXR0ZW1wdGVkIHRvIHVzZSBAdHJhY2tlZCB3aXRoICR7XG4gICAgICBhcmdzLmxlbmd0aCA+IDEgPyAnYXJndW1lbnRzJyA6ICdhbiBhcmd1bWVudCdcbiAgICB9ICggQHRyYWNrZWQoJHthcmdzXG4gICAgICAubWFwKChkKSA9PiBgJyR7ZH0nYClcbiAgICAgIC5qb2luKFxuICAgICAgICAnLCAnXG4gICAgICApfSkgKSwgd2hpY2ggaXMgbm8gbG9uZ2VyIG5lY2Vzc2FyeSBub3Igc3VwcG9ydGVkLiBEZXBlbmRlbmNpZXMgYXJlIG5vdyBhdXRvbWF0aWNhbGx5IHRyYWNrZWQsIHNvIHlvdSBjYW4ganVzdCB1c2UgJHsnYEB0cmFja2VkYCd9LmBcbiAgKTtcbn1cblxuZnVuY3Rpb24gdGhyb3dUcmFja2VkV2l0aEVtcHR5QXJndW1lbnRzRXJyb3IoKSB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnWW91IGF0dGVtcHRlZCB0byB1c2UgQHRyYWNrZWQoKSwgd2hpY2ggaXMgbm8gbG9uZ2VyIG5lY2Vzc2FyeSBub3Igc3VwcG9ydGVkLiBSZW1vdmUgdGhlIHBhcmVudGhlc2VzIGFuZCB5b3Ugd2lsbCBiZSBnb29kIHRvIGdvISdcbiAgKTtcbn1cblxuLyoqXG4gKiBXaGVuZXZlciBhIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaXMgZW50ZXJlZCwgdGhlIGN1cnJlbnQgdHJhY2tlciBpc1xuICogc2F2ZWQgb2ZmIGFuZCBhIG5ldyB0cmFja2VyIGlzIHJlcGxhY2VkLlxuICpcbiAqIEFueSB0cmFja2VkIHByb3BlcnRpZXMgY29uc3VtZWQgYXJlIGFkZGVkIHRvIHRoZSBjdXJyZW50IHRyYWNrZXIuXG4gKlxuICogV2hlbiBhIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydHkgaXMgZXhpdGVkLCB0aGUgdHJhY2tlcidzIHRhZ3MgYXJlXG4gKiBjb21iaW5lZCBhbmQgYWRkZWQgdG8gdGhlIHBhcmVudCB0cmFja2VyLlxuICpcbiAqIFRoZSBjb25zZXF1ZW5jZSBpcyB0aGF0IGVhY2ggdHJhY2tlZCBjb21wdXRlZCBwcm9wZXJ0eSBoYXMgYSB0YWdcbiAqIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHRyYWNrZWQgcHJvcGVydGllcyBjb25zdW1lZCBpbnNpZGUgb2ZcbiAqIGl0c2VsZiwgaW5jbHVkaW5nIGNoaWxkIHRyYWNrZWQgY29tcHV0ZWQgcHJvcGVydGllcy5cbiAqL1xudHlwZSBEZWNvcmF0b3JQcm9wZXJ0eURlc2NyaXB0b3IgPSAoUHJvcGVydHlEZXNjcmlwdG9yICYgeyBpbml0aWFsaXplcj86IGFueSB9KSB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZGVzY3JpcHRvckZvckZpZWxkPFQgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBUPihcbiAgX3RhcmdldDogVCxcbiAga2V5OiBLLFxuICBkZXNjPzogRGVjb3JhdG9yUHJvcGVydHlEZXNjcmlwdG9yXG4pOiBEZWNvcmF0b3JQcm9wZXJ0eURlc2NyaXB0b3Ige1xuICBpZiAoREVCVUcgJiYgZGVzYyAmJiAoZGVzYy52YWx1ZSB8fCBkZXNjLmdldCB8fCBkZXNjLnNldCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgWW91IGF0dGVtcHRlZCB0byB1c2UgQHRyYWNrZWQgb24gJHtTdHJpbmcoXG4gICAgICAgIGtleVxuICAgICAgKX0sIGJ1dCB0aGF0IGVsZW1lbnQgaXMgbm90IGEgY2xhc3MgZmllbGQuIEB0cmFja2VkIGlzIG9ubHkgdXNhYmxlIG9uIGNsYXNzIGZpZWxkcy4gTmF0aXZlIGdldHRlcnMgYW5kIHNldHRlcnMgd2lsbCBhdXRvdHJhY2sgYWRkIGFueSB0cmFja2VkIGZpZWxkcyB0aGV5IGVuY291bnRlciwgc28gdGhlcmUgaXMgbm8gbmVlZCBtYXJrIGdldHRlcnMgYW5kIHNldHRlcnMgd2l0aCBAdHJhY2tlZC5gXG4gICAgKTtcbiAgfVxuXG4gIGxldCB7IGdldHRlciwgc2V0dGVyIH0gPSB0cmFja2VkRGF0YTxULCBLPihrZXksIGRlc2MgJiYgZGVzYy5pbml0aWFsaXplcik7XG5cbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblxuICAgIGdldCh0aGlzOiBUKTogYW55IHtcbiAgICAgIHJldHVybiBnZXR0ZXIodGhpcyk7XG4gICAgfSxcblxuICAgIHNldCh0aGlzOiBULCBuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgICBzZXR0ZXIodGhpcywgbmV3VmFsdWUpO1xuICAgICAgcHJvcGVydHlEaWRDaGFuZ2UoKTtcbiAgICB9LFxuICB9O1xufVxuXG5sZXQgcHJvcGVydHlEaWRDaGFuZ2UgPSBmdW5jdGlvbiAoKSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb3BlcnR5RGlkQ2hhbmdlKGNiOiAoKSA9PiB2b2lkKSB7XG4gIHByb3BlcnR5RGlkQ2hhbmdlID0gY2I7XG59XG4iXX0=