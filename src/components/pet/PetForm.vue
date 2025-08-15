<template>
  <v-card class="pet-form">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ isEdit ? '반려동물 수정' : '반려동물 등록' }}</span>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="$emit('close')"
        aria-label="닫기"
      />
    </v-card-title>

    <v-card-text>
      <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
        <v-row>
          <!-- 반려동물 이미지 업로드 -->
          <v-col cols="12" class="text-center">
            <div class="image-upload-container">
              <v-avatar
                :image="previewImage || petData.url"
                :size="120"
                class="mb-3"
                color="grey-lighten-3"
              >
                <v-icon size="48" color="grey">mdi-paw</v-icon>
              </v-avatar>
              
              <div class="d-flex flex-column align-center gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                  @click="$refs.fileInput.click()"
                >
                  {{ previewImage || petData.url ? '이미지 변경' : '이미지 추가' }}
                </v-btn>
                
                <v-btn
                  v-if="previewImage || petData.url"
                  color="error"
                  variant="text"
                  size="small"
                  @click="clearImage"
                >
                  이미지 제거
                </v-btn>
              </div>
              
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageChange"
              />
            </div>
          </v-col>

          <!-- 반려동물 이름 -->
          <v-col cols="12" md="6">
            <FormField
              v-model="petData.name"
              label="반려동물 이름"
              placeholder="반려동물 이름을 입력하세요"
              :rules="[v => !!v || '반려동물 이름은 필수입니다']"
              required
              prepend-icon="mdi-paw"
            />
          </v-col>

          <!-- 반려동물 종류 -->
          <v-col cols="12" md="6">
            <SpeciesAutocomplete
              v-model="petData.speciesId"
              label="반려동물 종류"
              placeholder="반려동물 종류를 검색하세요"
              :rules="[v => !!v || '반려동물 종류는 필수입니다']"
              required
            />
          </v-col>

          <!-- 성별 -->
          <v-col cols="12" md="6">
            <FormField
              v-model="petData.gender"
              label="성별"
              placeholder="성별을 선택하세요"
              :rules="[v => !!v || '성별은 필수입니다']"
              required
              prepend-icon="mdi-gender-male-female"
            >
              <template #default>
                <v-select
                  v-model="petData.gender"
                  :items="genderOptions"
                  item-title="label"
                  item-value="value"
                  placeholder="성별 선택"
                  clearable
                  hide-details
                />
              </template>
            </FormField>
          </v-col>

          <!-- 나이 -->
          <v-col cols="12" md="6">
            <FormField
              v-model="petData.age"
              label="나이"
              type="number"
              placeholder="나이를 입력하세요"
              :rules="[
                v => !!v || '나이는 필수입니다',
                v => v >= 0 || '나이는 0 이상이어야 합니다',
                v => v <= 30 || '나이는 30 이하여야 합니다'
              ]"
              required
              prepend-icon="mdi-calendar"
            />
          </v-col>

          <!-- 몸무게 -->
          <v-col cols="12" md="6">
            <FormField
              v-model="petData.weight"
              label="몸무게 (kg)"
              type="number"
              placeholder="몸무게를 입력하세요"
              :rules="[
                v => !!v || '몸무게는 필수입니다',
                v => v > 0 || '몸무게는 0보다 커야 합니다',
                v => v <= 100 || '몸무게는 100kg 이하여야 합니다'
              ]"
              required
              prepend-icon="mdi-weight"
            />
          </v-col>

          <!-- 생일 -->
          <v-col cols="12" md="6">
            <FormField
              v-model="petData.birthday"
              label="생일"
              type="date"
              placeholder="생일을 선택하세요"
              :rules="[v => !!v || '생일은 필수입니다']"
              required
              prepend-icon="mdi-cake-variant"
            />
          </v-col>

          <!-- URL (선택사항) -->
          <v-col cols="12">
            <FormField
              v-model="petData.url"
              label="URL (선택사항)"
              placeholder="관련 URL을 입력하세요"
              :rules="[
                v => !v || /^https?:\/\/.+/.test(v) || '올바른 URL 형식을 입력하세요'
              ]"
              prepend-icon="mdi-link"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer />
      <v-btn
        variant="outlined"
        @click="$emit('close')"
        :disabled="loading"
      >
        취소
      </v-btn>
      <v-btn
        color="primary"
        @click="handleSubmit"
        :loading="loading"
        :disabled="!isValid"
      >
        {{ isEdit ? '수정' : '등록' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { usePetStore } from '@/stores/pet'
import FormField from '@/components/ui/molecules/FormField.vue'
import SpeciesAutocomplete from './SpeciesAutocomplete.vue'

export default {
  name: 'PetForm',
  components: {
    FormField,
    SpeciesAutocomplete
  },
  
  props: {
    pet: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'success'],
  
  setup(props, { emit }) {
    const petStore = usePetStore()
    const form = ref(null)
    const fileInput = ref(null)
    const isValid = ref(false)
    const previewImage = ref(null)
    
    // 폼 데이터 초기화
    const petData = reactive({
      name: '',
      age: null,
      gender: '',
      weight: null,
      url: '',
      birthday: '',
      speciesId: null
    })
    
    // 로딩 상태
    const loading = computed(() => petStore.isLoading)
    
    // 성별 옵션
    const genderOptions = [
      { value: 'MALE', label: '수컷' },
      { value: 'FEMALE', label: '암컷' }
    ]
    
    // 수정 모드일 때 기존 데이터 로드
    watch(() => props.pet, (newPet) => {
      if (newPet && props.isEdit) {
        Object.keys(petData).forEach(key => {
          if (newPet[key] !== undefined) {
            petData[key] = newPet[key]
          }
        })
      }
    }, { immediate: true })
    
    // 이미지 변경 처리
    const handleImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        // 파일 크기 검증 (5MB 이하)
        if (file.size > 5 * 1024 * 1024) {
          alert('이미지 크기는 5MB 이하여야 합니다.')
          return
        }
        
        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.')
          return
        }
        
        // 미리보기 생성
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    // 이미지 제거
    const clearImage = () => {
      previewImage.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      petData.url = ''
    }
    
    // 폼 제출 처리
    const handleSubmit = async () => {
      if (!form.value.validate()) {
        return
      }
      
      try {
        let result
        
        if (props.isEdit) {
          // 수정 모드
          result = await petStore.updatePet(props.pet.id, petData, fileInput.value?.files[0])
        } else {
          // 등록 모드
          result = await petStore.registerPet(petData, fileInput.value?.files[0])
        }
        
        if (result.success) {
          emit('success', result.message)
          emit('close')
        }
      } catch (error) {
        console.error('Pet form submission error:', error)
      }
    }
    
    // 컴포넌트 마운트 시 종류 목록 로드
    onMounted(async () => {
      if (petStore.getSpecies.length === 0) {
        await petStore.fetchSpecies()
      }
    })
    
    return {
      form,
      fileInput,
      isValid,
      petData,
      loading,
      previewImage,
      genderOptions,
      handleImageChange,
      clearImage,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.pet-form {
  max-width: 800px;
  margin: 0 auto;
}

.image-upload-container {
  padding: 24px;
  border: 2px dashed var(--v-border-color);
  border-radius: 12px;
  background-color: var(--v-theme-surface);
  transition: all 0.2s ease-in-out;
}

.image-upload-container:hover {
  border-color: var(--v-theme-primary);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pet-form {
    margin: 16px;
  }
  
  .image-upload-container {
    padding: 16px;
  }
}
</style>
