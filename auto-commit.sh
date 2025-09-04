#!/bin/bash
# Auto commit script - lägg denna i .git/hooks/post-commit

# Kontrollera om det finns ändringar
if [[ -n $(git status -s) ]]; then
    echo "Auto-committing changes..."
    git add .
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
fi
