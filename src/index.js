var postcss = require('postcss')
var treeShakingPlugin = require('./treeShakingPlugin')

class CSSTreeShakingPlugin {
  constructor (options) {
    this.options = Object.assign({}, {remove: true, showInfo: true}, options)
  }

  apply (compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      console.log('>>>>>>>', 'compilation', compilation)
		  const styleFiles = Object.keys(compilation.assets).filter(asset => {
			  return /\.css$/.test(asset)
      })
      console.log('>>>>>>>', 'compilation.styleFiles', styleFiles)

		  const jsFiles = Object.keys(compilation.assets).filter(asset => {
    return /\.(js|jsx)$/.test(asset)
  })
      console.log('>>>>>>>', 'compilation.jsFiles', jsFiles)

      const jsContents = jsFiles.reduce((acc, filename) => {
			  const contents = compilation.assets[filename].source()
			  acc += contents
			  return acc
      }, '')

      let tasks = []
      styleFiles.forEach((filename) => {
        const source = compilation.assets[filename].source()
        let listOpts = {
          include: 'ids',
          source: jsContents
        }
        tasks.push(postcss(treeShakingPlugin(listOpts, (src) => {
          compilation.assets[filename] = {
            source: () => src,
            size: () => src.length
          }
        })).process(source))
      })

      Promise.all(tasks).then(() => {
        callback()
      })
	  })
  }
}

module.exports = CSSTreeShakingPlugin
