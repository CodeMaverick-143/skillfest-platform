#!/bin/bash
# promote_admin.sh
# Usage: ./promote_admin.sh [github_username]

USERNAME=${1:-"CodeMaverick-143"}

echo "[⚡] Initializing promotion for: $USERNAME"

# 1. Identify the database container
DB_CONTAINER=$(docker compose ps -q db)

if [ -z "$DB_CONTAINER" ]; then
    echo "[✘] Error: Database container 'db' is not running. Please run 'docker compose up -d' first."
    exit 1
fi

# 2. Run the SQL update
# We promote the user to both Admin and Reviewer roles for full access.
docker exec -i "$DB_CONTAINER" psql -U postgres -d skillfest <<EOF
UPDATE users SET is_admin = true, is_reviewer = true WHERE username = '$USERNAME';
EOF

if [ $? -eq 0 ]; then
    echo "[✔] Success! $USERNAME has been promoted to Administrator."
    echo "[ℹ] Note: The user must have logged in to the platform at least once for their record to exist in the database."
else
    echo "[✘] Failed to execute SQL update."
    exit 1
fi
