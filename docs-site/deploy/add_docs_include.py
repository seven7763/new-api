#!/usr/bin/env python3
"""Idempotently add the daoxe-docs snippet include to an nginx vhost.

Inserts `include /etc/nginx/snippets/daoxe-docs.conf;` before the closing brace
of the vhost's HTTPS `server {}` block. Adds nothing else, rewrites no existing
directive, and is safe to re-run.

That block is located rather than assumed. The first version appended before the
file's last `}` and only worked because this vhost happens to list its port-80
redirect first; certbot writes that block last, and there the include lands
inside `server { return 301 https://$host$request_uri; }` — `nginx -t` still
passes and every /docs URL 301s to itself. When the scan below cannot name one
unambiguous HTTPS block it refuses to write anything, which is the point.
"""
import re
import sys

INCLUDE = "    include /etc/nginx/snippets/daoxe-docs.conf;\n"
MARKER = "daoxe-docs.conf"
# `listen 443 ssl;`, `listen [::]:443 ssl;`, `listen 8443 ssl;` — anything that
# terminates TLS. Anchored to a directive boundary rather than a line start so a
# one-line `server { listen 443 ssl; ... }` still matches. A port-80 redirect
# block matches nothing here.
LISTENS_TLS = re.compile(
    r"(?:^|[;{}])[ \t]*listen[ \t]+[^;{}\n]*(?:\bssl\b|\b443\b)", re.M
)

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as fh:
    text = fh.read()

if MARKER in text:
    print(f"SKIP  {path} (include already present)")
    sys.exit(0)

# Depth-0 blocks, scanned with comments and quoted strings consumed as single
# spans: a `{` inside a comment and a `#` inside a sub_filter string both have
# to stay inert. `masked` is the same text with those spans blanked (newlines
# kept), and it is what the block header and the listen search read, so
# `# the https server` above a block cannot be mistaken for part of its header.
masked = list(text)
blocks = []
depth = 0
header_from = 0
open_at = -1
i = 0
while i < len(text):
    ch = text[i]
    if ch == "#":
        nl = text.find("\n", i)
        end = len(text) if nl < 0 else nl
    elif ch in "\"'":
        end = i + 1
        while end < len(text) and text[end] != ch:
            end += 2 if text[end] == "\\" else 1
        end = min(end + 1, len(text))
    elif ch == "{":
        depth += 1
        if depth == 1:
            open_at = i
        i += 1
        continue
    elif ch == "}":
        depth -= 1
        if depth < 0:
            sys.exit(f"ERROR {path}: unbalanced `}}` at offset {i}")
        if depth == 0:
            blocks.append((header_from, open_at, i))
            header_from = i + 1
        i += 1
        continue
    else:
        i += 1
        continue
    for k in range(i, end):
        if masked[k] != "\n":
            masked[k] = " "
    i = end

if depth != 0:
    sys.exit(f"ERROR {path}: {depth} unclosed block(s)")

masked = "".join(masked)
targets = [
    (open_at, close_at)
    for header_from, open_at, close_at in blocks
    if masked[header_from:open_at].split()[-1:] == ["server"]
    and LISTENS_TLS.search(masked[open_at:close_at])
]

if len(targets) != 1:
    sys.exit(
        f"ERROR {path}: found {len(targets)} HTTPS `server {{}}` blocks, need exactly 1"
        " — add the include by hand"
    )

close_at = targets[0][1]
new_text = text[:close_at].rstrip("\n") + "\n\n" + INCLUDE + text[close_at:]

if new_text.count(MARKER) != 1:
    sys.exit(f"ERROR {path}: include count would be {new_text.count(MARKER)}, not writing")

with open(path, "w", encoding="utf-8") as fh:
    fh.write(new_text)

print(
    f"OK    {path} (include added before the HTTPS server block closing on line "
    f"{text.count(chr(10), 0, close_at) + 1})"
)
