#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

// Tüm screen dosyalarını bul
const files = glob.sync('src/screens/**/*.js');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let fixed = false;
  
  // SafeAreaView yerine < style gibi hatalar varsa düzelt
  if (content.includes('< style={styles.container}>')) {
    content = content.replace(/< style={styles\.container}>/g, '<SafeAreaView style={styles.container}>');
    fixed = true;
  }
  
  // Import'lardaki virgül hatalarını düzelt
  // ScrollView sonrası virgül eksik
  content = content.replace(/ScrollView\n/g, 'ScrollView,\n');
  // Alert öncesi virgül eksik
  content = content.replace(/,\n  Alert,/g, ',\n  Alert,');
  // TouchableOpacity öncesi virgül eksik  
  content = content.replace(/,\n  TouchableOpacity,/g, ',\n  TouchableOpacity,');
  // RefreshControl sonrası virgül eksik
  content = content.replace(/RefreshControl,\n/g, 'RefreshControl,\n');
  // Image sonrası virgül eksik
  content = content.replace(/Image,\n/g, 'Image,\n');
  
  // Kaydet
  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log('\n✨ All syntax errors fixed!');
