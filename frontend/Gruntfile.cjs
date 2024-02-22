module.exports = function (grunt) {
  grunt.initConfig({

    eslint: {
      target: ['pomodoro/public/js/*.js', 'google_charts/js/*.js']
    },

    htmlhint: {
      options: {
        htmlhintrc: '.htmlhintrc' // Create an HTMLLint configuration file.
      },
      src: ['pomodoro/public/*.html', 'google_charts/*html']
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/pomodoro/index.min.html': './pomodoro/public/pomodoro.html',
          'dist/google_charts/index.min.html': './google_charts/index.html'
        }
      }
    },

    uglify: {
      my_target: {
        files: [
          {
            expand: true,
            cwd: './pomodoro/public/js', // Source directory.
            src: ['**/*.js'], // Match all JavaScript files.
            dest: 'dist/pomodoro/js', // Output directory.
            ext: '.js' // Extension for minified files.
          },
          {
            expand: true,
            cwd: './google_charts/js', // Source directory.
            src: ['**/*.js'], // Match all JavaScript files.
            dest: 'dist/google_charts/js', // Output directory.
            ext: '.js' // Extension for minified files.
          }
        ]
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
