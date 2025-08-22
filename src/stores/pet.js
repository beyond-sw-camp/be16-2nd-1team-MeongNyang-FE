import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { petAPI, speciesAPI } from '@/services/api'

export const usePetStore = defineStore('pet', () => {
  // State
  const pets = ref([])
  const species = ref([])
  const selectedPet = ref(null)
  const representativePet = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getPets = computed(() => pets.value)
  const getSpecies = computed(() => species.value)
  const getSelectedPet = computed(() => selectedPet.value)
  const getRepresentativePet = computed(() => representativePet.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)

  // Actions
  const setLoading = (value) => {
    loading.value = value
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Pet CRUD Actions
  const fetchPets = async () => {
    try {
      setLoading(true)
      clearError()
      console.log('=== fetchPets 시작 ===')
      
      const response = await petAPI.getList()
      console.log('API 응답:', response)
      console.log('응답 데이터:', response.data)
      
      // 백엔드 응답 구조: CommonRes<List<Pet>> - isSuccess 필드 사용
      const isSuccess = response.data.isSuccess
      console.log('성공 여부:', isSuccess)
      
      if (isSuccess) {
        // 백엔드 응답 구조에 맞게 pets 데이터 추출
        const petsData = response.data.data?.pets || response.data.data || []
        console.log('=== 펫 데이터 구조 분석 ===')
        console.log('전체 응답:', response.data)
        console.log('응답 data:', response.data.data)
        console.log('펫 배열:', petsData)
        console.log('펫 배열 타입:', Array.isArray(petsData) ? 'Array' : typeof petsData)
        
        if (Array.isArray(petsData) && petsData.length > 0) {
          console.log('첫 번째 펫 객체:', petsData[0])
          console.log('첫 번째 펫 ID:', petsData[0]?.id)
          console.log('첫 번째 펫 ID 타입:', typeof petsData[0]?.id)
          console.log('첫 번째 펫 키들:', Object.keys(petsData[0]))
          
          // 이미지 관련 필드 상세 분석
          const firstPet = petsData[0]
          console.log('=== 이미지 필드 분석 ===')
          console.log('firstPet.url:', firstPet.url)
          console.log('firstPet.petImage:', firstPet.petImage)
          console.log('firstPet.profileImage:', firstPet.profileImage)
          console.log('firstPet.image:', firstPet.image)
          console.log('firstPet.imageUrl:', firstPet.imageUrl)
          console.log('firstPet.profileUrl:', firstPet.profileUrl)
          console.log('=== 이미지 필드 분석 완료 ===')
        } else if (!Array.isArray(petsData)) {
          console.warn('⚠️ petsData가 배열이 아님:', petsData)
          console.log('petsData 구조:', petsData)
        }
        
        // ID가 없는 펫이 있는지 확인 (배열인 경우에만)
        if (Array.isArray(petsData)) {
          const petsWithoutId = petsData.filter(pet => !pet.id)
          if (petsWithoutId.length > 0) {
            console.warn('⚠️ ID가 없는 펫 발견:', petsWithoutId)
          }
        }
        
        pets.value = Array.isArray(petsData) ? petsData : []
        console.log('설정된 pets:', pets.value)
        
        // 대표 반려동물이 설정되어 있지 않다면 첫 번째 반려동물을 대표로 설정
        if (!representativePet.value && pets.value.length > 0) {
          representativePet.value = pets.value[0]
          console.log('대표 반려동물 설정:', representativePet.value)
        }
        console.log('=== 펫 데이터 구조 분석 완료 ===')
      } else {
        const errorMsg = response.data.message || '반려동물 목록을 불러오는데 실패했습니다.'
        console.log('API 에러:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('fetchPets 에러:', err)
      console.error('에러 응답:', err.response)
      const errorMessage = err.response?.data?.message || '반려동물 목록을 불러오는데 실패했습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
      console.log('=== fetchPets 완료 ===')
    }
  }

  const registerPet = async (petData, petImage = null) => {
    try {
      setLoading(true)
      clearError()
      
      console.log('=== registerPet 시작 ===')
      console.log('전송할 데이터:', petData)
      console.log('이미지 파일:', petImage)
      
      const response = await petAPI.register(petData, petImage)
      console.log('API 응답:', response)
      console.log('응답 데이터:', response.data)

      console.log('응답 데이터 분석:')
      console.log('- success 필드:', response.data.success)
      console.log('- isSuccess 필드:', response.data.isSuccess)
      console.log('- message 필드:', response.data.message)
      console.log('- data 필드:', response.data.data)
      console.log('- status 필드:', response.data.status)
      console.log('- 전체 응답 구조:', response.data)
      
      // 백엔드 응답 구조: CommonRes<String> - isSuccess 필드 사용
      const isSuccess = response.data.isSuccess
      
      if (isSuccess) {
        console.log('등록 성공! 목록 새로고침 시작')
        // 등록 후 목록 새로고침
        await fetchPets()
        console.log('목록 새로고침 완료')
        
        // 백엔드 응답 구조에 맞게 메시지 추출 (우선순위: data > message > status.message > 기본메시지)
        let successMessage = '반려동물이 등록되었습니다.'
        if (response.data.data) {
          successMessage = response.data.data
        } else if (response.data.message) {
          successMessage = response.data.message
        } else if (response.data.status?.message) {
          successMessage = response.data.status.message
        }
        
        console.log('추출된 성공 메시지:', successMessage)
        return { success: true, message: successMessage }
      } else {
        console.log('=== 등록 실패 분석 ===')
        console.log('백엔드 응답 전체:', response.data)
        console.log('response.data.status:', response.data.status)
        console.log('response.data.message:', response.data.message)
        console.log('response.data.error:', response.data.error)
        
        // 백엔드 응답 구조에 맞게 에러 메시지 추출 (우선순위: status.message > message > error > 기본메시지)
        let errorMessage = '반려동물 등록에 실패했습니다.'
        
        // 모든 가능한 에러 메시지 소스 확인
        const possibleMessages = [
          response.data.status?.message,
          response.data.message,
          response.data.error,
          response.data.data,
          response.data.reason,
          response.data.description
        ]
        
        console.log('가능한 에러 메시지들:', possibleMessages)
        
        // 첫 번째 유효한 메시지 사용
        for (const msg of possibleMessages) {
          if (msg && typeof msg === 'string' && msg.trim()) {
            errorMessage = msg
            console.log('사용할 에러 메시지:', errorMessage)
            break
          }
        }
        
        // 여전히 기본 메시지라면 HTTP 상태 코드 기반 메시지 생성
        if (errorMessage === '반려동물 등록에 실패했습니다.') {
          if (response.status === 400) {
            errorMessage = '잘못된 요청입니다. 입력 정보를 확인해주세요.'
          } else if (response.status === 403) {
            errorMessage = '권한이 없습니다. 로그인 상태를 확인해주세요.'
          } else if (response.status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          }
          console.log('HTTP 상태 코드 기반 에러 메시지:', errorMessage)
        }
        
        console.log('최종 에러 메시지:', errorMessage)
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      console.error('반려동물 등록 에러:', error)
      console.error('에러 응답:', error.response?.data)
      
      // 백엔드 에러 메시지 우선 사용
      let errorMessage = '반려동물 등록 중 오류가 발생했습니다.'
      
      if (error.response?.data) {
        const responseData = error.response.data
        console.log('백엔드 에러 응답 분석:', responseData)
        
        // 백엔드 응답 구조에 따른 에러 메시지 추출
        if (responseData.status?.message) {
          errorMessage = responseData.status.message
        } else if (responseData.message) {
          errorMessage = responseData.message
        } else if (responseData.error) {
          errorMessage = responseData.error
        }
        
        // HTTP 상태 코드별 추가 정보
        if (error.response.status === 403) {
          if (errorMessage.includes('Maximum upload size exceeded')) {
            errorMessage = '파일 크기가 너무 큽니다. 5MB 이하의 이미지를 선택해주세요.'
          } else {
            errorMessage = `권한 오류: ${errorMessage}`
          }
        } else if (error.response.status === 400) {
          errorMessage = `잘못된 요청: ${errorMessage}`
        } else if (error.response.status === 500) {
          errorMessage = `서버 오류: ${errorMessage}`
        }
      }
      
      console.log('최종 에러 메시지:', errorMessage)
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
      console.log('=== registerPet 완료 ===')
    }
  }



  const updatePet = async (petId, petData, petImage = null) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await petAPI.update(petId, petData, petImage)

      // 백엔드 응답 구조: CommonRes<String> - isSuccess 필드 사용
      if (response.data.isSuccess) {
        // 수정 후 목록 새로고침
        await fetchPets()
        return { success: true, message: response.data.data || '반려동물이 성공적으로 수정되었습니다.' }
      } else {
        setError(response.data.message || '반려동물 수정에 실패했습니다.')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('=== 반려동물 수정 에러 상세 분석 ===')
      console.error('에러 객체:', error)
      console.error('에러 타입:', error.constructor.name)
      console.error('에러 메시지:', error.message)
      console.error('에러 스택:', error.stack)
      
      if (error.response) {
        console.error('=== HTTP 에러 응답 상세 ===')
        console.error('HTTP 상태:', error.response.status)
        console.error('HTTP 상태 텍스트:', error.response.statusText)
        console.error('HTTP 헤더:', error.response.headers)
        console.error('HTTP 데이터:', error.response.data)
        console.error('HTTP 데이터 타입:', typeof error.response.data)
        console.error('HTTP 데이터 키들:', Object.keys(error.response.data || {}))
        
        if (error.response.data) {
          console.error('=== 백엔드 에러 응답 구조 분석 ===')
          console.error('isSuccess:', error.response.data.isSuccess)
          console.error('data:', error.response.data.data)
          console.error('message:', error.response.data.message)
          console.error('status:', error.response.data.status)
          
          if (error.response.data.status) {
            console.error('status.code:', error.response.data.status.code)
            console.error('status.message:', error.response.data.status.message)
          }
          console.error('=== 백엔드 에러 응답 구조 분석 완료 ===')
        }
        console.error('=== HTTP 에러 응답 상세 완료 ===')
      } else if (error.request) {
        console.error('=== 네트워크 에러 ===')
        console.error('요청 객체:', error.request)
        console.error('=== 네트워크 에러 완료 ===')
      } else {
        console.error('=== 기타 에러 ===')
        console.error('에러 설정:', error.config)
        console.error('=== 기타 에러 완료 ===')
      }
      console.error('=== 반려동물 수정 에러 상세 분석 완료 ===')
      
      // 백엔드 에러 메시지 우선 사용
      let errorMessage = '반려동물 수정 중 오류가 발생했습니다.'
      
      if (error.response?.data) {
        const responseData = error.response.data
        console.log('백엔드 에러 응답 분석:', responseData)
        
        // 백엔드 응답 구조에 따른 에러 메시지 추출
        if (responseData.status?.message) {
          errorMessage = responseData.status.message
        } else if (responseData.message) {
          errorMessage = responseData.message
        } else if (responseData.error) {
          errorMessage = responseData.error
        }
        
        // HTTP 상태 코드별 추가 정보
        if (error.response.status === 403) {
          if (errorMessage.includes('Maximum upload size exceeded')) {
            errorMessage = '파일 크기가 너무 큽니다. 5MB 이하의 이미지를 선택해주세요.'
          } else {
            errorMessage = `권한 오류: ${errorMessage}`
          }
        } else if (error.response.status === 400) {
          errorMessage = `잘못된 요청: ${errorMessage}`
        } else if (error.response.status === 500) {
          errorMessage = `서버 오류: ${errorMessage}`
        }
      }
      
      console.log('최종 에러 메시지:', errorMessage)
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deletePet = async (petId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await petAPI.delete(petId)
      
      // 백엔드 응답 구조: CommonRes<String> - isSuccess 필드 사용
      if (response.data.isSuccess) {
        // 삭제 후 목록 새로고침
        await fetchPets()
        return { success: true, message: response.data.data || '반려동물이 성공적으로 삭제되었습니다.' }
      } else {
        setError(response.data.message || '반려동물 삭제에 실패했습니다.')
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || '반려동물 삭제에 실패했습니다.'
      setError(errorMessage)
      console.error('Error deleting pet:', err)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Species Actions
  const fetchSpecies = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await speciesAPI.getList()
      if (response.data.isSuccess) {
        species.value = response.data.data || []
      } else {
        setError(response.data.message || '반려동물 종류 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.message || '반려동물 종류 목록을 불러오는데 실패했습니다.')
      console.error('Error fetching species:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchSpecies = async (searchParams) => {
    try {
      setLoading(true)
      clearError()
      // 백엔드에는 /species/search 엔드포인트가 없으므로 /species/list로 검색
      const response = await speciesAPI.getList()
      console.log('=== searchSpecies API 응답 ===')
      console.log('전체 응답:', response)
      console.log('response.data:', response.data)
      console.log('response.data.data:', response.data.data)
      
      if (response.data.isSuccess) {
        const allSpecies = response.data.data || []
        console.log('전체 종류 목록:', allSpecies)
        
        // 프론트엔드에서 검색어로 필터링
        if (searchParams.species) {
          const searchTerm = searchParams.species.toLowerCase()
          const filteredSpecies = allSpecies.filter(species => 
            species.species.toLowerCase().includes(searchTerm) ||
            species.petOrder.toLowerCase().includes(searchTerm)
          )
          console.log('필터링된 종류:', filteredSpecies)
          return filteredSpecies
        }
        return allSpecies
      } else {
        setError(response.data.message || '반려동물 종류 검색에 실패했습니다.')
        return []
      }
    } catch (err) {
      setError(err.response?.data?.message || '반려동물 종류 검색에 실패했습니다.')
      console.error('Error searching species:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Pet Selection Actions
  const selectPet = (pet) => {
    selectedPet.value = pet
  }

  const clearSelectedPet = () => {
    selectedPet.value = null
  }

  const setRepresentativePet = async (pet) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await petAPI.setMainPet(pet.id)
      
      // 백엔드 응답 구조: CommonRes<String> - isSuccess 필드 사용
      if (response.data.isSuccess) {
        representativePet.value = pet
        // 모든 펫의 isMain 상태 업데이트
        pets.value.forEach(p => {
          p.isMain = p.id === pet.id
        })
        return { success: true, message: '대표 반려동물이 설정되었습니다.' }
      } else {
        setError(response.data.message || '대표 반려동물 설정에 실패했습니다.')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('대표 반려동물 설정 에러:', error)
      const errorMessage = error.response?.data?.message || '대표 반려동물 설정 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Utility Actions
  const getPetById = (petId) => {
    return pets.value.find(pet => pet.id === petId)
  }

  const getSpeciesById = (speciesId) => {
    return species.value.find(species => species.id === speciesId)
  }

  const resetStore = () => {
    pets.value = []
    species.value = []
    selectedPet.value = null
    representativePet.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    pets,
    species,
    selectedPet,
    representativePet,
    loading,
    error,
    
    // Getters
    getPets,
    getSpecies,
    getSelectedPet,
    getRepresentativePet,
    isLoading,
    getError,
    
    // Actions
    setLoading,
    setError,
    clearError,
    fetchPets,
    registerPet,
    updatePet,
    deletePet,
    fetchSpecies,
    searchSpecies,
    selectPet,
    clearSelectedPet,
    setRepresentativePet,
    getPetById,
    getSpeciesById,
    resetStore
  }
})
