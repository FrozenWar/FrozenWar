module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: [
      {
        expand: true,
        cwd: 'src/html',
        src: ['**/*'],
        dest: 'build/'
      }
    ],
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: true,
        mangle: {
          sort: true,
          toplevel: true,
          eval: true
        }
      },
      files: {
        src: 'build/js/client.js',
        dest: 'build/js/client.min.js'
      }
    },
    browserify: {
      files: {
        src: 'src/Client.js',
        dest: 'build/js/client.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['copy', 'browserify', 'uglify']);
}
