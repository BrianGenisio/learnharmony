import {editorTemplate} from './editor.template';
import StringCompiler from './string-compiler';

class Editor {
  constructor() {
    this.compiler = new StringCompiler();
    this.moduleId = 0;
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

  get code() {
    return this.codeMirror.getValue();
  }

  set code(value) {
    this.codeMirror.setValue(value);
  }

  execute() {
    this.codeMirror.save();
    let code = this.$el.find('textarea').val();
    let moduleName = 'repl' + this.moduleId++;

    this.compiler
      .transpile(code, moduleName)
      .then(function transpileSuccess(transpiled) {
        System.register(moduleName, [], function() { return eval(transpiled); });
        System.import(moduleName);
      });

    this.$el.find('.module-name').text(moduleName);
  }
}

export default Editor;
