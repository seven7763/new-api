#!/usr/bin/env python3
"""Idempotently add the daoxe-docs snippet include to an nginx vhost.

Inserts `include /etc/nginx/snippets/daoxe-docs.conf;` just before the final
closing brace of the file (which closes the HTTPS `server {}` block). Adds
nothing else and rewrites no existing directive. Safe to re-run.
"""
import sys

INCLUDE = "    include /etc/nginx/snippets/daoxe-docs.conf;\n"
MARKER = "daoxe-docs.conf"

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as fh:
    text = fh.read()

if MARKER in text:
    print(f"SKIP  {path} (include already present)")
    sys.exit(0)

idx = text.rfind("}")
if idx == -1:
    print(f"ERROR {path}: no closing brace found")
    sys.exit(2)

# Ensure the inserted line sits on its own line before the final brace.
prefix = text[:idx].rstrip("\n")
suffix = text[idx:]
new_text = prefix + "\n\n" + INCLUDE + suffix

with open(path, "w", encoding="utf-8") as fh:
    fh.write(new_text)

if new_text.count(MARKER) != 1:
    print(f"ERROR {path}: include count = {new_text.count(MARKER)}")
    sys.exit(3)

print(f"OK    {path} (include added before final brace)")
