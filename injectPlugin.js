// If your plugin is direct dependent to the html webpack plugin:
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');

class InjectPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('InjectPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(
        'InjectPlugin', // <-- Set a meaningful name here for stacktraces
        (data, cb) => {
          data.assets.js = data.assets.js.map((url)=>{
            return `./${path.basename(url)}`
          })
          cb(null, data)
        }
      )
    })
  }
}

module.exports = InjectPlugin
