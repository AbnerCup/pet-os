import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'pets')

// Create example pet images
const createSampleImages = async () => {
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    
    // Sample base64 image (1x1 pixel, red color)
    const redPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAAQMAAAABkCAQAAAIdHR0cGRvPz8AAAWAJDwKjwAAABAAAAAADwKjwAAABEAAAALBQAADwK+wK2MDDAATa+4AAABDzXgABgQAAgCgMSAA=='
    
    // Save sample images for each pet
    const sampleImages = [
      {
        filename: '1_sample.jpg',
        data: redPixelBase64
      },
      {
        filename: '2_sample.jpg',
        data: redPixelBase64
      }
    ]
    
    for (const img of sampleImages) {
      const filepath = path.join(UPLOAD_DIR, img.filename)
      const buffer = Buffer.from(img.data, 'base64')
      await fs.writeFile(filepath, buffer)
      console.log(`Created sample image: ${img.filename}`)
    }
    
    console.log('Sample images created successfully')
  } catch (error) {
    console.error('Error creating sample images:', error)
  }
}

createSampleImages()