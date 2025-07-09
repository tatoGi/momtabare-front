import { DirectiveBinding, ObjectDirective } from 'vue';

declare module '@vue/runtime-core' {
  interface HTMLAttributes {
    _clickOutsideHandler?: (event: MouseEvent) => void;
  }
}

const clickOutside: ObjectDirective = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding) {
    const clickHandler = (event: MouseEvent) => {
      if (!el.contains(event.target as Node) && binding.value) {
        binding.value(event);
      }
    };
    
    // Store the handler on the element so we can remove it later
    (el as any)._clickOutsideHandler = clickHandler;
    document.addEventListener('click', clickHandler);
  },
  
  unmounted(el: HTMLElement) {
    const clickHandler = (el as any)._clickOutsideHandler;
    if (clickHandler) {
      document.removeEventListener('click', clickHandler);
      delete (el as any)._clickOutsideHandler;
    }
  },
};

export default clickOutside;
