const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Tüm screen dosyalarını bul
const files = glob.sync('src/screens/**/*.js');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // SafeAreaView'i react-native'den çıkar
  content = content.replace(
    /from 'react-native';/,
    (match) => {
      // Eğer SafeAreaView import edilmişse
      if (content.includes('SafeAreaView,')) {
        // SafeAreaView'i çıkar
        let updated = content.replace(/,?\s*SafeAreaView,?/g, '');
        // react-native import'una SafeAreaView'i react-native-safe-area-context'ten ekle
        updated = updated.replace(
          /from 'react-native';/,
          "from 'react-native';\nimport { SafeAreaView } from 'react-native-safe-area-context';"
        );
        fs.writeFileSync(file, updated, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        return match;
      }
      return match;
    }
  );
});

console.log('\n✨ All files fixed!');
