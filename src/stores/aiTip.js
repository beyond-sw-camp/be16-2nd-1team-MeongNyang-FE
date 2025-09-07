import { defineStore } from 'pinia'
import { getAIPetTip, getDefaultPetTip } from '@/services/perplexity'

export const useAITipStore = defineStore('aiTip', {
  state: () => ({
    // 현재 팁 데이터
    currentTip: {
      text: '[AI 새로고침] 버튼을 눌러 AI 반려동물 전문가의 오늘의 팁을 들어보세요!',
      source: '멍멍냥냥',
      timestamp: null,
      weather: null,
      temperature: null,
      isDefault: true
    },
    
    // 로딩 상태
    loading: false,
    error: null,
    
    // 캐시 설정
    cache: {
      lastUpdate: null,
      cacheKey: null,
      cacheDuration: 30 * 60 * 1000, // 30분 캐시
    },
    
    // 팁 히스토리 (최근 10개)
    tipHistory: []
  }),

  getters: {
    // 캐시가 유효한지 확인
    isCacheValid: (state) => {
      if (!state.cache.lastUpdate || !state.cache.cacheKey) return false
      const now = Date.now()
      return (now - state.cache.lastUpdate) < state.cache.cacheDuration
    },
    
    // 현재 캐시 키 생성
    getCacheKey: () => (weather, temperature, petType) => {
      const date = new Date().toDateString() // 날짜별 캐시
      return `${date}_${weather || 'no-weather'}_${temperature || 'no-temp'}_${petType || 'no-pet'}`
    },
    
    // 마지막 업데이트 시간 포맷
    lastUpdateFormatted: (state) => {
      if (!state.currentTip.timestamp) return null
      return new Date(state.currentTip.timestamp).toLocaleString('ko-KR')
    },
    
    // 팁이 AI로 생성된 것인지 확인
    isAITip: (state) => {
      return !state.currentTip.isDefault && state.currentTip.source.includes('AI')
    }
  },

  actions: {
    // AI 팁 가져오기 (캐싱 포함)
    async fetchAITip(options = {}) {
      const { weather = '', temperature = '', petType = '' } = options
      const cacheKey = this.getCacheKey(weather, temperature, petType)
      
      // 캐시가 유효하고 같은 조건이면 캐시된 데이터 사용
      if (this.isCacheValid && this.cache.cacheKey === cacheKey) {
        console.log('캐시된 AI 팁 사용:', this.currentTip)
        return this.currentTip
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log('새로운 AI 팁 요청:', options)
        const aiTip = await getAIPetTip({
          weather,
          temperature,
          petType
        })
        
        // 성공한 팁을 히스토리에 추가
        this.addToHistory(aiTip)
        
        // 현재 팁 업데이트
        this.currentTip = {
          ...aiTip,
          isDefault: false
        }
        
        // 캐시 업데이트
        this.cache = {
          lastUpdate: Date.now(),
          cacheKey,
          cacheDuration: this.cache.cacheDuration
        }
        
        console.log('AI 팁 업데이트 완료:', this.currentTip)
        return this.currentTip
        
      } catch (error) {
        console.warn('AI 팁 가져오기 실패, 기본 팁 사용:', error.message)
        this.error = error.message
        
        // AI 팁 실패 시 기본 팁 사용
        const defaultTip = getDefaultPetTip({
          weather,
          temperature
        })
        
        this.currentTip = {
          ...defaultTip,
          isDefault: true
        }
        
        return this.currentTip
        
      } finally {
        this.loading = false
      }
    },
    
    // 기본 팁으로 강제 설정
    setDefaultTip(options = {}) {
      const { weather = '', temperature = '' } = options
      const defaultTip = getDefaultPetTip({ weather, temperature })
      
      this.currentTip = {
        ...defaultTip,
        isDefault: true
      }
      
      // 캐시 초기화
      this.cache = {
        lastUpdate: null,
        cacheKey: null,
        cacheDuration: this.cache.cacheDuration
      }
    },
    
    // 팁 히스토리에 추가
    addToHistory(tip) {
      const historyItem = {
        ...tip,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
      
      this.tipHistory.unshift(historyItem)
      
      // 최대 10개까지만 유지
      if (this.tipHistory.length > 10) {
        this.tipHistory = this.tipHistory.slice(0, 10)
      }
    },
    
    // 특정 히스토리 팁을 현재 팁으로 설정
    setCurrentTipFromHistory(tipId) {
      const tip = this.tipHistory.find(t => t.id === tipId)
      if (tip) {
        this.currentTip = {
          ...tip,
          isDefault: false
        }
      }
    },
    
    // 캐시 강제 갱신
    forceRefresh() {
      this.cache = {
        lastUpdate: null,
        cacheKey: null,
        cacheDuration: this.cache.cacheDuration
      }
    },
    
    // 에러 상태 초기화
    clearError() {
      this.error = null
    },
    
    // 캐시 지속 시간 설정 (분 단위)
    setCacheDuration(minutes) {
      this.cache.cacheDuration = minutes * 60 * 1000
    },
    
    // 히스토리 초기화
    clearHistory() {
      this.tipHistory = []
    }
  }
})
