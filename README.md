# babel-plugin-transform-dwayne-js

Babel plugin for transforming js tagged expression into functions.

It's recommended to use [babel-preset-dwayne](https://github.com/dwaynejs/babel-preset-dwayne)
instead of the plugin itself.

### Example

Input:

```js
const expression = js`a + b`;
```

Output:

```js
const expression = _ => _.a + _.b;
```

#### Transformer

It's similar to [transform-dwayne-js](https://github.com/dwaynejs/transform-dwayne-js),
but for babel and js expressions only.

All the options passed to the plugin are passed to the
[transformer](https://github.com/dwaynejs/transform-dwayne-js-expressions) itself.

By default the plugin sets `options.useES6` to true.
