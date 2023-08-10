#!/bin/bash

# Set your GitHub username, repository name, and SSH private key path
USERNAME="la-strole"
REPO_NAME="pomodoro_timer"
SSH_PRIVATE_KEY_PATH="/home/zzz/.ssh/git"

# Set the source and target branches for the pull request
SOURCE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TARGET_BRANCH="main"

# Set the title and body of the pull request
PR_TITLE="PR $(git log -1 --pretty=format:"%s")"
PR_BODY="PR from la-strole"

# Set the comment text
COMMENT_TEXT="LGTM"

# Create a new pull request and retrieve the PR number
PR_RESPONSE=$(curl -X POST -H "Authorization: Bearer $(cat $SSH_PRIVATE_KEY_PATH.pub)" \
                -d '{"title": "'$PR_TITLE'", "body": "'$PR_BODY'", "head": "'$USERNAME':'$SOURCE_BRANCH'", "base": "'$TARGET_BRANCH'"}' \
                "https://api.github.com/repos/$USERNAME/$REPO_NAME/pulls")

# Extract the PR number from the response using jq (a command-line JSON processor)
PR_NUMBER=$(echo "$PR_RESPONSE" | jq -r '.number')

# Wait for test suite workflow finished
sleep 30

# Add a comment to the pull request using the PR number
curl -X POST -H "Authorization: Bearer $(cat $SSH_PRIVATE_KEY_PATH.pub)" \
     -d '{"body": "'"$COMMENT_TEXT"'"}' \
     "https://api.github.com/repos/$USERNAME/$REPO_NAME/issues/$PR_NUMBER/comments"
