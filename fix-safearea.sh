#!/bin/bash

# React Native SafeAreaView'i react-native-safe-area-context ile değiştir
find src -name "*.js" -type f -exec sed -i '' \
  -e 's/from '\''react-native'\'';/from '\''react-native'\'';\nimport { SafeAreaView } from '\''react-native-safe-area-context'\'';/g' \
  -e 's/SafeAreaView,//g' \
  {} +

echo "✅ SafeAreaView importları düzeltildi"
