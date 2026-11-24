const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const {version: baseVersion} = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const makefile = fs.readFileSync(path.join(root, 'Makefile'), 'utf8');
assert.match(baseVersion, /^\d+\.\d+\.\d+$/);
const version = makefile.match(/^PKG_VERSION:=(.+)$/m)[1];
const release = makefile.match(/^PKG_RELEASE:=(\d+)$/m)[1];
assert.match(version, new RegExp(`^${baseVersion.replaceAll('.', '\\.')}(?:~[0-9a-f]{7})?$`));
const view = fs.readFileSync(path.join(root, 'files/www/views/gl-sdk4-ui-udp-discovery-relay.common.js'), 'utf8');
assert.equal(view.match(/var uiVersion = '([^']+)'/)[1], version);
const ref = process.argv[2] || '';
if (ref.startsWith('refs/tags/')) {
  const hash = version.match(/~([0-9a-f]{7})$/);
  assert(hash, 'Release tags must include the UI commit hash');
  assert.equal(ref, `refs/tags/v${baseVersion}-r${release}+${hash[1]}`);
}
console.log('UI versions consistent:', version);
