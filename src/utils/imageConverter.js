/**
 * 이미지 변환 유틸리티
 * HEIC 파일을 브라우저에서 지원하는 형식으로 변환
 */

/**
 * HEIC 파일인지 확인
 * @param {File} file - 확인할 파일
 * @returns {boolean} HEIC 파일 여부
 */
export const isHeicFile = (file) => {
  if (!file) return false
  
  const fileName = file.name.toLowerCase()
  const heicExtensions = ['.heic', '.heif']
  
  return heicExtensions.some(ext => fileName.endsWith(ext)) || 
         file.type === 'image/heic' || 
         file.type === 'image/heif'
}

/**
 * HEIC 파일을 JPEG로 변환
 * @param {File} heicFile - HEIC 파일
 * @returns {Promise<File>} 변환된 JPEG 파일
 */
export const convertHeicToJpeg = async (heicFile) => {
  try {
    // heic2any 라이브러리를 사용하여 변환
    const heic2any = await import('heic2any')
    
    const convertedBlob = await heic2any.default({
      blob: heicFile,
      toType: 'image/jpeg',
      quality: 0.8
    })
    
    // Blob을 File로 변환
    const convertedFile = new File([convertedBlob], 
      heicFile.name.replace(/\.(heic|heif)$/i, '.jpg'), 
      { type: 'image/jpeg' }
    )
    
    return convertedFile
  } catch (error) {
    console.error('HEIC 변환 실패:', error)
    throw new Error('HEIC 파일 변환에 실패했습니다. 다른 이미지 형식을 사용해주세요.')
  }
}

/**
 * 이미지를 브라우저에서 지원하는 형식으로 변환
 * @param {File} file - 원본 파일
 * @returns {Promise<File>} 변환된 파일
 */
export const convertImageForBrowser = async (file) => {
  if (!file) return file
  
  // HEIC 파일인 경우 JPEG로 변환
  if (isHeicFile(file)) {
    console.log('🔄 HEIC 파일 감지, JPEG로 변환 중...')
    return await convertHeicToJpeg(file)
  }
  
  // 다른 형식은 그대로 반환
  return file
}

/**
 * 파일이 이미지인지 확인
 * @param {File} file - 확인할 파일
 * @returns {boolean} 이미지 파일 여부
 */
export const isImageFile = (file) => {
  if (!file) return false
  
  const imageTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'image/heic', 'image/heif', 'image/avif', 'image/bmp', 'image/tiff', 'image/tif'
  ]
  
  const imageExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.heic', '.heif', '.avif', '.bmp', '.tiff', '.tif'
  ]
  
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  
  return imageTypes.includes(file.type) || imageExtensions.includes(fileExtension)
}

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @param {number} maxSize - 최대 파일 크기 (바이트)
 * @returns {Object} 검사 결과
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  const result = {
    isValid: true,
    error: null
  }
  
  if (!file) {
    result.isValid = false
    result.error = '파일이 선택되지 않았습니다.'
    return result
  }
  
  if (!isImageFile(file)) {
    result.isValid = false
    result.error = '이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF, WebP, HEIC, HEIF, AVIF, BMP, TIFF)'
    return result
  }
  
  if (file.size > maxSize) {
    result.isValid = false
    result.error = `파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB 이하로 선택해주세요.`
    return result
  }
  
  return result
}
