'use strict';

const {
  exec
} = require('child_process');
const originalPosition = process.cwd();

/**
 * Executea shell command
 *
 * @param {String} cmd Command to execute
 * @param {?String} dir A directoy where to execute the command.
 * @return {Promise} Promise resolves itself if the command was executed
 * successfully and rejects it there was an error.
 */
function _exec(cmd) {
  return new Promise((resolve, reject) => {
    let log = `Executing command: ${cmd}`;
    console.info(log);
    exec(cmd, {}, (err, stdout, stderr) => {
      if (err) {
        let currentDir = process.cwd();
        reject(new Error('Unable to execute command: ' + err.message +
          '. Was in dir: ' + currentDir + '. stdout: ', stdout, '. stderr: ',
          stderr));
        return;
      }
      resolve(stdout);
    });
  });
}

process.chdir('elements-data');
_exec('bower install')
.then(() => {
  process.chdir(originalPosition);
  process.exit(0);
})
.then(() => {
  process.chdir(originalPosition);
  process.exit(1);
});
