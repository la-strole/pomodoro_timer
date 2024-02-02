module.exports = function (grunt) {
  grunt.initConfig({

    eslint: {
      target: ['public/js/*.js']
    },

    htmlhint: {
      options: {
        htmlhintrc: '.htmlhintrc' // Create an HTMLLint configuration file.
      },
      src: ['public/*.html']
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.min.html': './public/pomodoro.html'
        }
      }
    },

    uglify: {
      my_target: {
        files: [{
          expand: true,
          cwd: './public/js', // Source directory.
          src: ['**/*.js'], // Match all JavaScript files.
          dest: 'dist/js', // Output directory.
          ext: '.js' // Extension for minified files.
        }]
      }
    }

  })

  grunt.loadNpmTasks('grunt-eslint')
  grunt.loadNpmTasks('grunt-htmlhint')
  grunt.loadNpmTasks('grunt-contrib-htmlmin')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  grunt.registerTask('lint', ['eslint', 'htmlhint'])
  grunt.registerTask('minification', ['htmlmin', 'uglify'])
}
