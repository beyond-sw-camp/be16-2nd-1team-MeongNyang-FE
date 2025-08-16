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
      
      // 백엔드 응답 구조에 따라 success 또는 isSuccess 확인
      const isSuccess = response.data.success || response.data.isSuccess
      console.log('성공 여부:', isSuccess)
      
      if (isSuccess) {
        pets.value = response.data.data || []
        console.log('설정된 pets:', pets.value)
        
        // 대표 반려동물이 설정되어 있지 않다면 첫 번째 반려동물을 대표로 설정
        if (!representativePet.value && pets.value.length > 0) {
          representativePet.value = pets.value[0]
          console.log('대표 반려동물 설정:', representativePet.value)
        }
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
      
      const response = await petAPI.register(petData, petImage)

      if (response.data.success) {
        // 등록 후 목록 새로고침
        await fetchPets()
        return { success: true, message: response.data.data }
      } else {
        setError(response.data.message || '반려동물 등록에 실패했습니다.')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('반려동물 등록 에러:', error)
      const errorMessage = error.response?.data?.message || '반려동물 등록 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updatePet = async (petId, petData, petImage = null) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await petAPI.update(petId, petData, petImage)

      if (response.data.success) {
        // 수정 후 목록 새로고침
        await fetchPets()
        return { success: true, message: response.data.data }
      } else {
        setError(response.data.message || '반려동물 수정에 실패했습니다.')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('반려동물 수정 에러:', error)
      const errorMessage = error.response?.data?.message || '반려동물 수정 중 오류가 발생했습니다.'
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
      
      if (response.data.success) {
        // 삭제 후 목록 새로고침
        await fetchPets()
        return { success: true, message: response.data.data }
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

  const setRepresentativePet = (pet) => {
    representativePet.value = pet
    // TODO: API 호출하여 대표 반려동물 설정 (백엔드 API가 있다면)
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
