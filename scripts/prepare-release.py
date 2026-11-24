#!/usr/bin/env python3
"""Prepare a UI release version from the package base version and this commit."""
import json
import os
from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parent.parent


def metadata(text, key):
    values = re.findall(rf"^{re.escape(key)}\s*:=\s*(\S+)\s*$", text, re.MULTILINE)
    if len(values) != 1:
        raise ValueError(f"Expected one literal {key} assignment")
    return values[0]


def prepare(root=ROOT):
    package = json.loads((root / "package.json").read_text())
    base_version = package.get("version")
    if not isinstance(base_version, str) or not re.fullmatch(r"\d+\.\d+\.\d+", base_version):
        raise ValueError("Unsupported UI base version")

    makefile = root / "Makefile"
    make_text = makefile.read_text()
    name = metadata(make_text, "PKG_NAME")
    release = metadata(make_text, "PKG_RELEASE")
    if name != "gl-ui-udp-discovery-relay" or not release.isdecimal() or int(release) < 1:
        raise ValueError("Invalid UI package metadata")

    try:
        commit = subprocess.check_output(
            ["git", "-C", str(root), "rev-parse", "HEAD"],
            text=True,
            stderr=subprocess.PIPE,
        ).strip()
    except subprocess.CalledProcessError as error:
        raise ValueError("A committed UI source tree is required") from error
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Invalid project commit")

    short = commit[:7]
    version = f"{base_version}~{short}"
    filename = f"{name}-{base_version}-{short}-r{release}.apk"
    tag = f"v{base_version}-r{release}+{short}"

    version_match = re.search(r"^PKG_VERSION\s*:=.*$", make_text, flags=re.MULTILINE)
    if not version_match:
        raise ValueError("Missing PKG_VERSION assignment")
    updated_make = re.sub(
        r"^PKG_VERSION\s*:=.*$", f"PKG_VERSION:={version}", make_text, flags=re.MULTILINE
    )
    view = root / "files/www/views/gl-sdk4-ui-udp-discovery-relay.common.js"
    view_text = view.read_text()
    updated_view, count = re.subn(
        r"(var uiVersion = ')[^']+(';)", rf"\g<1>{version}\g<2>", view_text
    )
    if count != 1:
        raise ValueError("Expected one UI version declaration")

    outputs = {
        "name": name,
        "version": version,
        "release": release,
        "tag": tag,
        "filename": filename,
        "project_commit": commit,
    }
    if any("\n" in value or "\r" in value for value in outputs.values()):
        raise ValueError("Invalid release metadata")

    makefile.write_text(updated_make)
    view.write_text(updated_view)
    return outputs


if __name__ == "__main__":
    values = prepare()
    output = "".join(f"{key}={value}\n" for key, value in values.items())
    print(output, end="")
    if "GITHUB_OUTPUT" in os.environ:
        with open(os.environ["GITHUB_OUTPUT"], "a") as stream:
            stream.write(output)
