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

    this.codeMirror = CodeMirror.fromTextArea(this.$el.find('textarea')[0], {
      lineNumbers: true,
      mode: "javascript"
    });
  }

  execute() {
    this.codeMirror.save();
    var code = this.$el.find('textarea').val();
    var transpiled = this.compiler.transpile(code);
    eval(transpiled);
  }
}

export default Editor;