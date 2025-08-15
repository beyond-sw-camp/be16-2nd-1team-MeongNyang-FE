/**
 * 접근성 유틸리티 함수들
 * WCAG 2.1 가이드라인을 준수하는 접근성 기능들을 제공합니다.
 */

/**
 * 포커스 관리를 위한 유틸리티
 */
export const focusManagement = {
  /**
   * 요소에 포커스를 설정합니다.
   * @param {HTMLElement|string} element - 포커스할 요소 또는 선택자
   */
  focus(element) {
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (target && target.focus) {
      target.focus()
    }
  },

  /**
   * 요소에서 포커스를 제거합니다.
   * @param {HTMLElement|string} element - 포커스를 제거할 요소 또는 선택자
   */
  blur(element) {
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (target && target.blur) {
      target.blur()
    }
  },

  /**
   * 포커스 트랩을 설정합니다.
   * @param {HTMLElement} container - 포커스 트랩을 설정할 컨테이너
   */
  setFocusTrap(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    // 클린업 함수 반환
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  },

  /**
   * 포커스 이전 위치를 저장하고 복원합니다.
   */
  focusHistory: {
    previousElement: null,
    
    save() {
      this.previousElement = document.activeElement
    },
    
    restore() {
      if (this.previousElement && this.previousElement.focus) {
        this.previousElement.focus()
      }
    }
  }
}

/**
 * ARIA 속성 관리를 위한 유틸리티
 */
export const ariaUtils = {
  /**
   * 요소의 ARIA 라벨을 설정합니다.
   * @param {HTMLElement} element - 대상 요소
   * @param {string} label - ARIA 라벨
   */
  setLabel(element, label) {
    if (element) {
      element.setAttribute('aria-label', label)
    }
  },

  /**
   * 요소의 ARIA 설명을 설정합니다.
   * @param {HTMLElement} element - 대상 요소
   * @param {string} description - ARIA 설명
   */
  setDescription(element, description) {
    if (element) {
      element.setAttribute('aria-describedby', description)
    }
  },

  /**
   * 요소의 ARIA 상태를 설정합니다.
   * @param {HTMLElement} element - 대상 요소
   * @param {string} state - ARIA 상태 (expanded, hidden, selected 등)
   * @param {boolean} value - 상태 값
   */
  setState(element, state, value) {
    if (element) {
      element.setAttribute(`aria-${state}`, value.toString())
    }
  },

  /**
   * 요소의 ARIA 역할을 설정합니다.
   * @param {HTMLElement} element - 대상 요소
   * @param {string} role - ARIA 역할
   */
  setRole(element, role) {
    if (element) {
      element.setAttribute('role', role)
    }
  },

  /**
   * 요소의 ARIA 필수 속성을 설정합니다.
   * @param {HTMLElement} element - 대상 요소
   * @param {boolean} required - 필수 여부
   */
  setRequired(element, required) {
    if (element) {
      element.setAttribute('aria-required', required.toString())
    }
  },

  /**
   * 요소의 ARIA 무효 속성을 설정합니다.
   * @param {HTMLElement} element - 대상 요소
   * @param {boolean} invalid - 무효 여부
   */
  setInvalid(element, invalid) {
    if (element) {
      element.setAttribute('aria-invalid', invalid.toString())
    }
  }
}

/**
 * 키보드 네비게이션을 위한 유틸리티
 */
export const keyboardNavigation = {
  /**
   * 키보드 이벤트 핸들러를 생성합니다.
   * @param {Object} handlers - 키보드 핸들러 객체
   * @returns {Function} 이벤트 핸들러 함수
   */
  createHandler(handlers) {
    return (event) => {
      const handler = handlers[event.key]
      if (handler) {
        handler(event)
      }
    }
  },

  /**
   * Enter 키 핸들러를 생성합니다.
   * @param {Function} callback - 콜백 함수
   * @returns {Function} 이벤트 핸들러
   */
  onEnter(callback) {
    return (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        callback(event)
      }
    }
  },

  /**
   * Space 키 핸들러를 생성합니다.
   * @param {Function} callback - 콜백 함수
   * @returns {Function} 이벤트 핸들러
   */
  onSpace(callback) {
    return (event) => {
      if (event.key === ' ') {
        event.preventDefault()
        callback(event)
      }
    }
  },

  /**
   * Escape 키 핸들러를 생성합니다.
   * @param {Function} callback - 콜백 함수
   * @returns {Function} 이벤트 핸들러
   */
  onEscape(callback) {
    return (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        callback(event)
      }
    }
  },

  /**
   * 화살표 키 핸들러를 생성합니다.
   * @param {Object} callbacks - 화살표 키별 콜백 함수들
   * @returns {Function} 이벤트 핸들러
   */
  onArrowKeys(callbacks) {
    return (event) => {
      const handler = callbacks[event.key]
      if (handler) {
        event.preventDefault()
        handler(event)
      }
    }
  }
}

/**
 * 색상 대비를 확인하는 유틸리티
 */
export const colorContrast = {
  /**
   * 두 색상 간의 대비 비율을 계산합니다.
   * @param {string} color1 - 첫 번째 색상 (hex)
   * @param {string} color2 - 두 번째 색상 (hex)
   * @returns {number} 대비 비율
   */
  calculateContrastRatio(color1, color2) {
    const luminance1 = this.getLuminance(color1)
    const luminance2 = this.getLuminance(color2)
    
    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)
    
    return (lighter + 0.05) / (darker + 0.05)
  },

  /**
   * 색상의 상대 휘도를 계산합니다.
   * @param {string} color - hex 색상
   * @returns {number} 상대 휘도
   */
  getLuminance(color) {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
    
    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB
  },

  /**
   * 대비 비율이 WCAG 기준을 만족하는지 확인합니다.
   * @param {number} ratio - 대비 비율
   * @param {string} level - WCAG 레벨 ('AA' 또는 'AAA')
   * @param {string} size - 텍스트 크기 ('normal' 또는 'large')
   * @returns {boolean} 기준 만족 여부
   */
  meetsWCAG(ratio, level = 'AA', size = 'normal') {
    const thresholds = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 }
    }
    
    const threshold = thresholds[level]?.[size] || 4.5
    return ratio >= threshold
  }
}

/**
 * 스크린 리더 지원을 위한 유틸리티
 */
export const screenReader = {
  /**
   * 스크린 리더 전용 텍스트를 생성합니다.
   * @param {string} text - 스크린 리더용 텍스트
   * @returns {HTMLElement} 스크린 리더 전용 요소
   */
  createScreenReaderText(text) {
    const element = document.createElement('span')
    element.className = 'sr-only'
    element.textContent = text
    element.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `
    return element
  },

  /**
   * 요소에 스크린 리더 전용 텍스트를 추가합니다.
   * @param {HTMLElement} element - 대상 요소
   * @param {string} text - 스크린 리더용 텍스트
   */
  addScreenReaderText(element, text) {
    const srText = this.createScreenReaderText(text)
    element.appendChild(srText)
  },

  /**
   * 라이브 리전을 생성합니다.
   * @param {string} id - 라이브 리전 ID
   * @param {string} politeness - 정중함 레벨 ('polite' 또는 'assertive')
   * @returns {HTMLElement} 라이브 리전 요소
   */
  createLiveRegion(id, politeness = 'polite') {
    const element = document.createElement('div')
    element.id = id
    element.setAttribute('aria-live', politeness)
    element.setAttribute('aria-atomic', 'true')
    element.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    return element
  },

  /**
   * 라이브 리전에 메시지를 추가합니다.
   * @param {string} id - 라이브 리전 ID
   * @param {string} message - 메시지
   */
  announceMessage(id, message) {
    let liveRegion = document.getElementById(id)
    if (!liveRegion) {
      liveRegion = this.createLiveRegion(id)
      document.body.appendChild(liveRegion)
    }
    
    liveRegion.textContent = message
  }
}

/**
 * 접근성 검증을 위한 유틸리티
 */
export const accessibilityValidator = {
  /**
   * 요소의 접근성을 검증합니다.
   * @param {HTMLElement} element - 검증할 요소
   * @returns {Object} 검증 결과
   */
  validateElement(element) {
    const issues = []
    
    // 이미지 alt 속성 확인
    const images = element.querySelectorAll('img')
    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          type: 'error',
          element: img,
          message: `이미지 ${index + 1}에 alt 속성이 없습니다.`
        })
      }
    })
    
    // 폼 라벨 확인
    const inputs = element.querySelectorAll('input, select, textarea')
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id')
      const label = id ? document.querySelector(`label[for="${id}"]`) : null
      
      if (!label && !input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
        issues.push({
          type: 'error',
          element: input,
          message: `입력 필드 ${index + 1}에 라벨이 없습니다.`
        })
      }
    })
    
    // 색상 대비 확인
    const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
    textElements.forEach((textElement) => {
      const style = window.getComputedStyle(textElement)
      const color = style.color
      const backgroundColor = style.backgroundColor
      
      if (color && backgroundColor) {
        const ratio = colorContrast.calculateContrastRatio(color, backgroundColor)
        if (!colorContrast.meetsWCAG(ratio)) {
          issues.push({
            type: 'warning',
            element: textElement,
            message: `텍스트 대비가 WCAG 기준을 만족하지 않습니다. (비율: ${ratio.toFixed(2)})`
          })
        }
      }
    })
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

export default {
  focusManagement,
  ariaUtils,
  keyboardNavigation,
  colorContrast,
  screenReader,
  accessibilityValidator
}
