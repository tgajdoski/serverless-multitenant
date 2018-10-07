import { Component, Directive, HostListener, EventEmitter, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[appAnimateChange]'
})
export class AnimateChangeDirective {

 constructor(private el: ElementRef, private renderer: Renderer) {
  }

  @HostListener('DOMSubtreeModified')
  onChange() {
    this.highlight();
  }

  private highlight() {
    this.renderer.setElementClass(this.el.nativeElement, 'hidden', true);
    this.renderer.setElementClass(this.el.nativeElement, 'animated', false);
    this.renderer.setElementClass(this.el.nativeElement, 'bounceInDown', false);
    setTimeout(() => {
    this.renderer.setElementClass(this.el.nativeElement, 'hidden', false);
      this.renderer.setElementClass(this.el.nativeElement, 'animated', true);
      this.renderer.setElementClass(this.el.nativeElement, 'bounceInDown', true);
    }, 300);
  }
}
