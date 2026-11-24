#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock


SCRIPT = Path(__file__).with_name("prepare-release.py")
SPEC = importlib.util.spec_from_file_location("prepare_release", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ReleaseVersionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "files/www/views").mkdir(parents=True)
        (self.root / "package.json").write_text(json.dumps({"version": "0.0.1"}))
        (self.root / "Makefile").write_text(
            "PKG_NAME:=gl-ui-udp-discovery-relay\n"
            "PKG_VERSION:=0.0.1\n"
            "PKG_RELEASE:=1\n"
        )
        (self.root / "files/www/views/gl-sdk4-ui-udp-discovery-relay.common.js").write_text(
            "var uiVersion = '0.0.1';\n"
        )

    def tearDown(self):
        self.temp.cleanup()

    @mock.patch.object(MODULE.subprocess, "check_output", return_value="abcdef0123456789abcdef0123456789abcdef01\n")
    def test_prepares_hash_version_and_release_metadata(self, _check_output):
        values = MODULE.prepare(self.root)
        self.assertEqual(values["version"], "0.0.1~abcdef0")
        self.assertEqual(values["filename"], "gl-ui-udp-discovery-relay-0.0.1-abcdef0-r1.apk")
        self.assertEqual(values["tag"], "v0.0.1-r1+abcdef0")
        self.assertIn("PKG_VERSION:=0.0.1~abcdef0\n", (self.root / "Makefile").read_text())
        self.assertIn("var uiVersion = '0.0.1~abcdef0';", (self.root / "files/www/views/gl-sdk4-ui-udp-discovery-relay.common.js").read_text())

    @mock.patch.object(MODULE.subprocess, "check_output", return_value="abcdef0123456789abcdef0123456789abcdef01\n")
    def test_repeated_prepare_does_not_append_a_second_hash(self, _check_output):
        MODULE.prepare(self.root)
        values = MODULE.prepare(self.root)
        self.assertEqual(values["version"], "0.0.1~abcdef0")
        self.assertEqual((self.root / "Makefile").read_text().count("~abcdef0"), 1)

    def test_requires_a_committed_tree(self):
        with mock.patch.object(
            MODULE.subprocess,
            "check_output",
            side_effect=subprocess.CalledProcessError(128, "git"),
        ):
            with self.assertRaises(ValueError):
                MODULE.prepare(self.root)


if __name__ == "__main__":
    unittest.main()
