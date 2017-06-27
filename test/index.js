const { strictEqual } = require('assert');
const _ = require('lodash');
const fs = require('fs');
const { transform } = require('babel-core');

describe('transform', () => {
  const dirs = fs.readdirSync(__dirname + '/fixtures');

  dirs.forEach((dirname) => {
    const root = __dirname + '/fixtures/' + dirname;

    it(dirname.replace(/_/g, ' '), () => {
      let options = _.attempt(() => (
        require(root + '/options.json')
      ));

      if (_.isError(options)) {
        options = {};
      }

      const code = fs.readFileSync(root + '/source.js', 'utf8');
      const generated = transform(code, {
        babelrc: false,
        filename: 'source.js',
        plugins: [
          [require('../src'), options]
        ]
      });

      strictEqual(
        generated.code,
        fs.readFileSync(root + '/generated.js', 'utf8')
      );
    });
  });
});
