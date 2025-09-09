/**
 * Perplexity API 서비스
 * 반려동물 관련 AI 팁을 가져오는 서비스
 */

import apiClient from "./api"

/**
 * Perplexity API를 통해 반려동물 관련 팁을 가져옵니다
 * @param {Object} options - API 요청 옵션
 * @param {string} options.weather - 현재 날씨 정보
 * @param {string} options.temperature - 현재 온도
 * @param {string} options.petType - 반려동물 종류 (선택사항)
 * @returns {Promise<Object>} AI가 생성한 팁 정보
 */
export async function getAIPetTip(options = {}) {

  const { weather = '', temperature = '', petType = '' } = options

  try {
    const response = await apiClient.post('/pplx/pet-tip', {
      weather,
      temperature,
      petType
    })

    const data = response.data.data
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Perplexity API 응답 형식이 올바르지 않습니다.')
    }

    let tipText = data.choices[0].message.content.trim()
    
    // 참조 번호 제거 ([1], [2], [3] 등)
    tipText = tipText.replace(/\[\d+\]/g, '')
    
    // 기타 불필요한 표시 제거
    tipText = tipText.replace(/\[출처[^\]]*\]/g, '')
    tipText = tipText.replace(/\[참고[^\]]*\]/g, '')
    tipText = tipText.replace(/\[인용[^\]]*\]/g, '')
    
    // 연속된 공백 정리
    tipText = tipText.replace(/\s+/g, ' ').trim()
    
    // 문장 끝 정리 (마침표가 없으면 추가)
    if (tipText && !tipText.endsWith('.') && !tipText.endsWith('!') && !tipText.endsWith('?')) {
      tipText += '.'
    }
    
    return {
      text: tipText,
      source: 'AI 반려동물 전문가',
      timestamp: new Date().toISOString(),
      weather: weather,
      temperature: temperature
    }
  } catch (error) {
    console.error('백엔드 호출 실패:', error)
    throw error
  }
}

/**
 * 기본 반려동물 팁을 반환합니다 (API 실패 시 fallback)
 * @param {Object} options - 날씨 정보
 * @returns {Object} 기본 팁 정보
 */
export function getDefaultPetTip(options = {}) {
  const { weather = '', temperature = '' } = options
  
  let tipText = ''
  let tipSource = '반려동물 전문가'

  if (temperature && parseFloat(temperature) > 30) {
    tipText = '오늘은 매우 더운 날씨입니다. 반려동물과의 산책은 아침 일찍이나 저녁 늦게 하는 것이 좋습니다. 충분한 물을 준비하세요!'
  } else if (temperature && parseFloat(temperature) > 25) {
    tipText = '따뜻한 날씨입니다. 반려동물과 산책할 때는 그늘진 곳을 이용하고, 중간중간 휴식을 취해주세요.'
  } else if (temperature && parseFloat(temperature) < 0) {
    tipText = '추운 날씨입니다. 반려동물의 발가락과 귀를 보호하고, 실내 활동을 늘려주세요.'
  } else if (weather && weather.includes('비')) {
    tipText = '비가 오는 날입니다. 실내에서 반려동물과 함께 놀아주거나, 비가 그친 후 산책하세요.'
  } else if (weather && weather.includes('눈')) {
    tipText = '눈이 오는 날입니다. 반려동물의 발에 눈이 달라붙지 않도록 주의하고, 따뜻한 옷을 입혀주세요.'
  } else {
    tipText = '좋은 날씨입니다. 반려동물과 함께 산책하며 즐거운 시간을 보내세요!'
  }

  return {
    text: tipText,
    source: tipSource,
    timestamp: new Date().toISOString(),
    weather: weather,
    temperature: temperature,
    isDefault: true
  }
}
