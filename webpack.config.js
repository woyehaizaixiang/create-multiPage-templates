const path = require('path')
const glob = require('glob')
const copyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InjectPlugin = require('./injectPlugin')

const entries = getEntry('./src/pages/**/index.js', './src/pages/**/index.js', 1)
const config = {
  entry: entries,
  output: {
    filename: '[name].[hash:8].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.(less)$/,
        exclude: /(node_modules)/,
        use: [
          'style-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')()
              ]
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.(css|scss|sass)$/,
        exclude: /(node_modules)/,
        use: [
          'style-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')()
              ]
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
  ],
  mode: 'production'
}

// add plugin
const pages = Object.keys(getEntry('./src/**/*.html', './src/**/*.html'))
pages.forEach((pathname) => {
  var conf = {
    filename: './' + pathname,
    template: "./src/pages/" + pathname,
    inject: true,
    chunks: [pathname.replace(path.extname(pathname), '')],
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: true
    }
  }
  config.plugins.push(new HtmlWebpackPlugin(conf))
  config.plugins.push(new InjectPlugin({
    template: "./src/pages/" + pathname
  }))
})

// copy assets
const staticFile = getEntry('./src/pages/**/static/*', './src/pages/**/static/*')
const imgPackagesConf = []
for (let key in staticFile) {
  const conf = {
    from: path.normalize(staticFile[key]),
    to: key
  }
  imgPackagesConf.push(conf)
}
config.plugins.push(new copyWebpackPlugin(imgPackagesConf))

module.exports = config

// get entry
function getEntry (globPath, pathDir, splitExtname) {
  let files = glob.sync(globPath)
  let entries = {},
    entry,
    dirname,
    basename,
    pathname
  for (let i = 0; i < files.length; i++) {
    entry = files[i]
    dirname = path.dirname(entry)
    if (splitExtname) {
      basename = path.basename(entry, path.extname(entry));
    } else {
      basename = path.basename(entry)
    }
    pathname = path.normalize(path.join(dirname, basename))
    pathDir = path.normalize(pathDir)
    if (pathname.startsWith(pathDir)) {
      pathname = pathname.substring(pathDir.length)
    }
    // src/pages/index/index => index/index
    pathname = pathname.slice('src/pages/'.length)
    entries[pathname] = entry
  }
  return entries
}
