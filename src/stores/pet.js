import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

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
      const response = await api.get('/pets/list')
      if (response.data.success) {
        pets.value = response.data.data || []
        // 대표 반려동물이 설정되어 있지 않다면 첫 번째 반려동물을 대표로 설정
        if (!representativePet.value && pets.value.length > 0) {
          representativePet.value = pets.value[0]
        }
      } else {
        setError(response.data.message || '반려동물 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.message || '반려동물 목록을 불러오는데 실패했습니다.')
      console.error('Error fetching pets:', err)
    } finally {
      setLoading(false)
    }
  }

  const registerPet = async (petData, petImage = null) => {
    try {
      setLoading(true)
      clearError()
      
      const formData = new FormData()
      
      // PetRegisterReq 데이터 추가
      Object.keys(petData).forEach(key => {
        if (petData[key] !== null && petData[key] !== undefined) {
          formData.append(key, petData[key])
        }
      })
      
      // 이미지가 있다면 추가
      if (petImage) {
        formData.append('petImg', petImage)
      }

      const response = await api.post('/pets/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        // 등록 후 목록 새로고침
        await fetchPets()
        return { success: true, message: response.data.data }
      } else {
        setError(response.data.message || '반려동물 등록에 실패했습니다.')
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || '반려동물 등록에 실패했습니다.'
      setError(errorMessage)
      console.error('Error registering pet:', err)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updatePet = async (petId, petData, petImage = null) => {
    try {
      setLoading(true)
      clearError()
      
      const formData = new FormData()
      
      // PetRegisterReq 데이터 추가
      Object.keys(petData).forEach(key => {
        if (petData[key] !== null && petData[key] !== undefined) {
          formData.append(key, petData[key])
        }
      })
      
      // 이미지가 있다면 추가
      if (petImage) {
        formData.append('petImg', petImage)
      }

      const response = await api.put(`/pets/${petId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        // 수정 후 목록 새로고침
        await fetchPets()
        return { success: true, message: response.data.data }
      } else {
        setError(response.data.message || '반려동물 수정에 실패했습니다.')
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || '반려동물 수정에 실패했습니다.'
      setError(errorMessage)
      console.error('Error updating pet:', err)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deletePet = async (petId) => {
    try {
      setLoading(true)
      clearError()
      
      const response = await api.delete(`/pets/${petId}`)
      
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
      const response = await api.get('/species/list')
      if (response.data.success) {
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
      const response = await api.get('/species/search', { params: searchParams })
      if (response.data.success) {
        return response.data.data || []
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
