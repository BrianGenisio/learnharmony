import {editorTemplate} from './editor.template';
import StringCompiler from './string-compiler';

class Editor {
  constructor() {
    this.compiler = new StringCompiler();
  }

  render($element) {
    $element.html(editorTemplate);
    this.$el = $element.find('#code-editor');

    this.$el.find('#run').on('click', () => this.execute());
  }

  execute() {
    var code = this.$el.find('textarea').val();
    var transpiled = this.compiler.transpile(code);
    eval(transpiled);
  }
}

export default Editor;