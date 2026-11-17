#!/bin/sh
# Real UI package transactions in a disposable root; no firmware hooks run here.
set -eu
sdk=${1:?Usage: test-apk.sh SDK_ROOT [DIST_DIR]}
out=${2:-dist}
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
apk="$sdk/staging_dir/host/bin/apk"
version=$(sed -n 's/^PKG_VERSION:=//p' "$root/Makefile")
release=$(sed -n 's/^PKG_RELEASE:=//p' "$root/Makefile")
package="$out/gl-ui-udp-discovery-relay-$version-r$release.apk"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT HUP INT TERM
"$apk" adbdump "$package" > "$work/metadata"
awk '/^[[:space:]]+(user|group):/ { seen=1; if ($2 != "root") bad=1 } END { exit !seen || bad }' "$work/metadata"
mkdir -p "$work/fixture/usr/bin" "$work/root"
printf 'Core dependency fixture\n' > "$work/fixture/usr/bin/udp-discovery-relay"
"$apk" mkpkg --info name:firmware-test-fixture --info version:1 --info arch:noarch \
    --info 'provides:udp-discovery-relay gl-sdk4-ui-core gl-oui-rpc luci-lib-nixio' \
    --files "$work/fixture" --output "$work/fixture.apk"
if [ "$(id -u)" = 0 ]; then
    "$apk" --root "$work/root" --initdb --allow-untrusted --no-network --no-scripts add "$work/fixture.apk" "$package"
else
    "$apk" --root "$work/root" --initdb --usermode --allow-untrusted --no-network --no-scripts add "$work/fixture.apk" "$package"
fi
[ -f "$work/root/www/views/gl-sdk4-ui-udp-discovery-relay.common.js" ]
[ -f "$work/root/usr/lib/oui-httpd/rpc/udp-discovery-relay" ]
"$apk" --root "$work/root" --allow-untrusted --no-network --no-scripts del gl-ui-udp-discovery-relay
[ ! -e "$work/root/www/views/gl-sdk4-ui-udp-discovery-relay.common.js" ]
cmp "$work/fixture/usr/bin/udp-discovery-relay" "$work/root/usr/bin/udp-discovery-relay"
echo 'PASS UI APK install and removal without changing its Core dependency fixture'
