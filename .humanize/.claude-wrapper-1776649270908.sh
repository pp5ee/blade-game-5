#!/bin/sh
cd '/app/workspaces/398c189e-262d-40d4-ae27-0a8c8620c323' || exit 1
exec 'claude' '--dangerously-skip-permissions' '--print' '/humanize:start-rlcr-loop docs/plan.md --max 10 --yolo --codex-model gpt-5:high --full-review-round 5 --track-plan-file --push-every-round'
