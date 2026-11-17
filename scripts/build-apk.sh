#!/bin/sh
# Package only this native UI; the Core is supplied by its independent package.
set -eu
umask 022
[ "$(id -u)" = 0 ] || { echo 'Run packaging as root (sudo or a root container) to preserve APK ownership.' >&2; exit 1; }
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
sdk=${1:?Usage: build-apk.sh SDK_ROOT [DIST_DIR]}
out=${2:-"$root/dist"}
mkdir -p "$out"
out=$(CDPATH= cd -- "$out" && pwd)
sdk=$(CDPATH= cd -- "$sdk" && pwd)
apk="$sdk/staging_dir/host/bin/apk"
case "$("$apk" --version)" in 'apk-tools 3.'*) ;; *) echo 'OpenWrt APK v3 host tools required.' >&2; exit 1;; esac
metadata() { sed -n "s/^$1:=//p" "$root/Makefile" | head -1; }
name=$(metadata PKG_NAME)
version=$(metadata PKG_VERSION)
release=$(metadata PKG_RELEASE)
license=$(metadata PKG_LICENSE)
depends=$(awk '/^[[:space:]]*DEPENDS:=/ {sub(/^[[:space:]]*DEPENDS:=/, ""); gsub(/\+/, ""); print; exit}' "$root/Makefile")
[ -n "$name" ] && [ -n "$version" ] && [ -n "$release" ] && [ -n "$depends" ]
export SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH:-0}
case "$SOURCE_DATE_EPOCH" in ''|*[!0-9]*) exit 1;; esac
build=$(mktemp -d)
trap 'rm -rf "$build"' EXIT HUP INT TERM
payload="$build/root"
mkdir -p "$payload/lib/apk/packages"
cp -R "$root/files/." "$payload/"
(cd "$payload" && find . -type f | sed 's|^\.|/|;s|^//|/|' | sort) > "$payload/lib/apk/packages/$name.list"
cat > "$build/post-install" <<'HOOK'
#!/bin/sh
[ "${IPKG_NO_SCRIPT}" = 1 ] && exit 0
[ -s "${IPKG_INSTROOT}/lib/functions.sh" ] || exit 0
. "${IPKG_INSTROOT}/lib/functions.sh"
export root="${IPKG_INSTROOT}"
export pkgname=gl-ui-udp-discovery-relay
default_postinst || exit $?
[ -n "${IPKG_INSTROOT}" ] || { nginx -t -q && nginx -s reload; }
HOOK
{ printf '#!/bin/sh\nexport PKG_UPGRADE=1\n'; sed '/^#!/d' "$build/post-install"; } > "$build/post-upgrade"
cat > "$build/pre-deinstall" <<'HOOK'
#!/bin/sh
[ -s "${IPKG_INSTROOT}/lib/functions.sh" ] || exit 0
. "${IPKG_INSTROOT}/lib/functions.sh"
export root="${IPKG_INSTROOT}"
export pkgname=gl-ui-udp-discovery-relay
default_prerm
HOOK
cat > "$build/post-deinstall" <<'HOOK'
#!/bin/sh
[ -n "${IPKG_INSTROOT}" ] || { nginx -t -q && nginx -s reload; }
HOOK
filename="$name-$version-r$release.apk"
"$apk" mkpkg --compat 3.0.0_pre1 --compression deflate:9 \
    --info "name:$name" --info "version:$version-r$release" --info arch:noarch \
    --info "license:$license" --info "origin:$name" --info "depends:$depends" \
    --info 'description:Native GL.iNet SDK4 UDP Discovery Relay interface' \
    --info 'tags:openwrt:section=net' \
    --script "post-install:$build/post-install" --script "post-upgrade:$build/post-upgrade" \
    --script "pre-deinstall:$build/pre-deinstall" --script "post-deinstall:$build/post-deinstall" \
    --files "$payload" --output "$build/$filename"
"$apk" adbdump "$build/$filename" > "$build/metadata"
awk '/^[[:space:]]+(user|group):/ { seen=1; if ($2 != "root") { print "Non-root APK ownership: " $0 > "/dev/stderr"; bad=1 } } END { exit !seen || bad }' "$build/metadata"
"$apk" verify --allow-untrusted "$build/$filename"
mv "$build/$filename" "$out/$filename"
(cd "$out" && sha256sum "$filename" > "$filename.sha256")
cp "$root/LICENSE" "$out/LICENSE"
{
    printf 'Package: %s %s-r%s\nArchitecture: noarch\n' "$name" "$version" "$release"
    printf 'SDK: %s\n' "${UDR_SDK_LABEL:-local-openwrt-sdk}"
    "$apk" --version
} > "$out/build-provenance.txt"
echo 'Built independent UI APKv3; Core and compatible SDK4 runtime are required.'
