const Path = require('path');
const _ = require('lodash');
const transformDwayneJs = require('transform-dwayne-js-expressions');
const { default: LinesAndColumns } = require('lines-and-columns');

module.exports = ({ types: t }) => ({
  visitor: {
    Program(path, state) {
      state.file.__dwayneLines__ = new LinesAndColumns(state.file.code);
    },
    TaggedTemplateExpression(path, state) {
      const {
        opts: options,
        file: {
          __dwayneLines__,
          code,
          log: { filename }
        }
      } = state;

      options.useES6 = !!_.get(options, 'useES6', true);

      const taggedJsFuncName = _.get(options, 'taggedJsFuncName', 'js');
      const {
        quasi: {
          start,
          quasis,
          expressions
        },
        tag: { name }
      } = path.node;

      if (
        quasis.length !== 1
        || expressions.length
        || name !== taggedJsFuncName
      ) {
        return;
      }

      const lines = __dwayneLines__ || /* istanbul ignore next */ new LinesAndColumns(code);
      const loc = lines.locationForIndex(start + 1);
      const transformerOpts = _.assign({}, options, {
        filename: Path.relative(process.cwd(), filename),
        startLine: loc.line + 1,
        startColumn: loc.column,
        startPosition: start + 1
      });
      const transformed = transformDwayneJs(quasis[0].value.cooked, transformerOpts);

      path.replaceWithSourceString(transformed.code);
    }
  }
});
