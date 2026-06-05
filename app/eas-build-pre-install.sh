#!/bin/bash
set -e

if [ -n "$GOOGLE_SERVICE_INFO_PLIST" ]; then
  echo "Injecting GoogleService-Info.plist from EAS secret..."
  cp "$GOOGLE_SERVICE_INFO_PLIST" "$EXPO_PROJECT_ROOT/GoogleService-Info.plist"
  echo "Done."
else
  echo "WARNING: GOOGLE_SERVICE_INFO_PLIST secret not set — skipping injection."
fi

if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "Injecting google-services.json from EAS secret..."
  cp "$GOOGLE_SERVICES_JSON" "$EXPO_PROJECT_ROOT/google-services.json"
  echo "Done."
else
  echo "WARNING: GOOGLE_SERVICES_JSON secret not set — skipping injection."
fi
