/**
 * 이미지 리사이즈 유틸리티
 * 업로드된 이미지를 지정된 크기에 맞게 리사이즈하고 품질을 조정
 */

/**
 * 이미지를 지정된 크기로 리사이즈
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 이미지 품질 (0.1 ~ 1.0)
 * @returns {Promise<File>} 리사이즈된 이미지 파일
 */
export const resizeImage = (file, maxWidth = 1200, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 원본 이미지 크기
      const originalWidth = img.width
      const originalHeight = img.height
      
      // 비율 계산
      const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight)
      
      // 새로운 크기 계산 (비율 유지)
      const newWidth = Math.round(originalWidth * ratio)
      const newHeight = Math.round(originalHeight * ratio)
      
      // 캔버스 크기 설정
      canvas.width = newWidth
      canvas.height = newHeight
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // 캔버스를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          // 새로운 File 객체 생성
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          reject(new Error('이미지 리사이즈 실패'))
        }
      }, file.type, quality)
    }
    
    img.onerror = () => {
      reject(new Error('이미지 로드 실패'))
    }
    
    // File을 URL로 변환하여 이미지 로드
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 다중 이미지 리사이즈
 * @param {File[]} files - 원본 이미지 파일 배열
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 이미지 품질
 * @returns {Promise<File[]>} 리사이즈된 이미지 파일 배열
 */
export const resizeMultipleImages = async (files, maxWidth = 1200, maxHeight = 800, quality = 0.8) => {
  const resizedFiles = []
  
  for (const file of files) {
    try {
      const resizedFile = await resizeImage(file, maxWidth, maxHeight, quality)
      resizedFiles.push(resizedFile)
    } catch (error) {
      console.error('이미지 리사이즈 실패:', error)
      // 리사이즈 실패 시 원본 파일 사용
      resizedFiles.push(file)
    }
  }
  
  return resizedFiles
}

/**
 * 이미지 파일 크기 확인
 * @param {File} file - 이미지 파일
 * @returns {boolean} 이미지 파일 여부
 */
export const isImageFile = (file) => {
  return file.type.startsWith('image/')
}

/**
 * 이미지 파일 크기 제한 확인 (5MB)
 * @param {File} file - 이미지 파일
 * @returns {boolean} 크기 제한 내 여부
 */
export const isFileSizeValid = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}
