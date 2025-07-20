import { Quill } from 'react-quill';

const Inline = Quill.import('blots/inline');

class CustomColor extends Inline {
  static blotName: string = 'customColor';
  static tagName: string = 'FONT';

  constructor(domNode, value) {
    super(domNode, value);

    domNode.style.color = domNode.color;

    const span = this.replaceWith(new Inline(Inline.create()));

    span.children.forEach(child => {
      if (child.attributes) child.attributes.copy(span);
      if (child.unwrap) child.unwrap();
    });

    this.remove();

    return span;
  }
}

export default CustomColor;
