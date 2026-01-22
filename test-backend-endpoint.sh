#!/bin/bash

# ============================================
# 📡 Glutasyon Backend Endpoint Test Script
# ============================================

echo "🚀 Glutasyon Backend Endpoint Testi Başlatılıyor..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backend URL
BACKEND_URL="https://glutasyon-backend-production.up.railway.app"

# Test 1: Health Check
echo "1️⃣  Health Check Test..."
echo "URL: $BACKEND_URL/api/health"
echo ""
curl -s "$BACKEND_URL/api/health" | python3 -m json.tool 2>/dev/null || echo "❌ Health endpoint bulunamadı veya çalışmıyor"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: Version Check
echo "2️⃣  Version Check Test..."
echo "URL: $BACKEND_URL/api/app/version"
echo ""
VERSION_RESPONSE=$(curl -s "$BACKEND_URL/api/app/version")

if [ $? -eq 0 ]; then
  echo "$VERSION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$VERSION_RESPONSE"
  
  # Version varsa success
  if echo "$VERSION_RESPONSE" | grep -q "latestVersion"; then
    echo ""
    echo "✅ Version endpoint başarıyla çalışıyor!"
  else
    echo ""
    echo "❌ Version endpoint yanıt veriyor ama format hatalı!"
  fi
else
  echo "❌ Version endpoint bulunamadı!"
  echo ""
  echo "🔧 Yapılması gerekenler:"
  echo "   1. Railway backend projesini aç"
  echo "   2. backend-endpoint-to-add.js dosyasındaki kodu ekle"
  echo "   3. Git commit & push yap"
  echo "   4. Railway otomatik deploy edecek"
  echo "   5. Bu scripti tekrar çalıştır"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: Restaurants Endpoint (Mevcut)
echo "3️⃣  Restaurants Endpoint Test (Mevcut)..."
echo "URL: $BACKEND_URL/api/restaurants"
echo ""
RESTAURANTS_RESPONSE=$(curl -s "$BACKEND_URL/api/restaurants")
if echo "$RESTAURANTS_RESPONSE" | grep -q "restaurants"; then
  RESTAURANT_COUNT=$(echo "$RESTAURANTS_RESPONSE" | grep -o '"id"' | wc -l)
  echo "✅ Restaurants endpoint çalışıyor"
  echo "📊 Toplam restoran sayısı: $RESTAURANT_COUNT"
else
  echo "❌ Restaurants endpoint yanıt vermiyor"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Test Tamamlandı!"
echo ""
echo "💡 Not: Version endpoint yoksa backend-endpoint-to-add.js dosyasına bakın"
echo ""
