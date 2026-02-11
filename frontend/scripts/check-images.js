const { execSync } = require('child_process')

const checkImages = () => {
  console.log('🔍 Verificando imágenes en la aplicación...')
  
  try {
    // Check sample images
    const result = execSync('find "C:\\Users\\Abner\\Desktop\\pet-os\\pet-os-completo\\public\\uploads\\pets" -name "*.jpg" -o -n')
    const imageFiles = result.stdout.trim().split('\n').filter(Boolean)
    
    console.log(`📁 Imágenes encontradas: ${imageFiles.length}`)
    imageFiles.forEach(file => {
      console.log(`   - ${file}`)
    })
    
    // Check if images are accessible via HTTP
    const testUrls = [
      'http://localhost:3003/uploads/pets/1_sample.jpg',
      'http://localhost:3003/uploads/pets/2_sample.jpg',
      'http://localhost:3003/uploads/pets/3_sample.jpg',
      'http://localhost:3003/uploads/pets/4_sample.jpg'
    ]
    
    console.log('\n🌐 Verificando acceso HTTP a las imágenes:')
    for (const url of testUrls) {
      try {
        const response = fetch(url)
        if (response.ok) {
          console.log(`   ✅ ${url} - ${response.status}`)
        } else {
          console.log(`   ❌ ${url} - ${response.status}`)
        }
      } catch (error) {
        console.log(`   ❌ ${url} - Error: ${error.message}`)
      }
    }
    
    console.log('\n🎯 Verificación de imágenes completada!')
    
  } catch (error) {
    console.error('❌ Error al verificar imágenes:', error)
  }
}

checkImages()