#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRE_PUSH="$(git -C "${REPO_ROOT}" rev-parse --git-path hooks/pre-push)"
MARKER="# managed-by: nicobehm-portfolio/setup-git-hooks.sh"

if [[ -z "${PRE_PUSH}" ]]; then
  echo "[hooks:setup] Skipping: git hooks path could not be resolved."
  exit 0
fi

mkdir -p "$(dirname "${PRE_PUSH}")"

if [[ -f "${PRE_PUSH}" ]] && ! grep -qF "${MARKER}" "${PRE_PUSH}"; then
  echo "[hooks:setup] Existing unmanaged pre-push hook detected at ${PRE_PUSH}." >&2
  echo "[hooks:setup] Refusing to overwrite it. Add commit verification for CV PDFs to your hook:" >&2
  echo "  node scripts/check-cv-pdfs.mjs --git-ref \"\$local_sha\"" >&2
  exit 1
fi

cat > "${PRE_PUSH}" <<EOF
#!/usr/bin/env bash
${MARKER}
set -euo pipefail

ZERO_SHA="0000000000000000000000000000000000000000"
checked=0

while read -r _local_ref local_sha _remote_ref _remote_sha; do
  if [[ -z "\${local_sha:-}" || "\${local_sha}" == "\${ZERO_SHA}" ]]; then
    continue
  fi
  echo "[pre-push] Verifying pre-generated CV PDFs at commit \${local_sha:0:12}..."
  node scripts/check-cv-pdfs.mjs --git-ref "\${local_sha}"
  checked=1
done

if [[ "\${checked}" -eq 0 ]]; then
  node scripts/check-cv-pdfs.mjs
fi
EOF

chmod +x "${PRE_PUSH}"
echo "[hooks:setup] Installed ${PRE_PUSH}"
