<template>
  <div class="pet-list">
    <div class="pet-container">
      <!-- 헤더 (배경 위에 직접) -->
      <div class="page-header">
            <h1 class="page-title">반려동물</h1>
            <p class="page-subtitle">우리 가족을 관리하고 추억을 기록하세요</p>
    </div>

      <!-- 통계 패널 (반려동물 추가 버튼 포함) -->
      <div class="stats-panel">
        <div class="stats-overview">
            <div class="stats-left">
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon>mdi-dog</v-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ getDogCount() }}</div>
                  <div class="stat-label">강아지</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon>mdi-cat</v-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ getCatCount() }}</div>
                  <div class="stat-label">고양이</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon>mdi-paw</v-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ pets.length }}</div>
                  <div class="stat-label">전체</div>
                </div>
              </div>
            </div>
            <div class="add-button-container">
              <v-btn
                color="#E87D7D"
                variant="flat"
                prepend-icon="mdi-plus"
                @click="showAddForm = true"
                size="large"
                rounded="xl"
                class="add-button"
              >
                              반려동물 추가
            </v-btn>
            

          </div>
        </div>
      </div>

    <!-- 콘텐츠 -->
        <div class="pets-section">
      <div class="container">
        <div v-if="pets.length > 0" class="pets-layout">
          <!-- 좌측: 대표동물 (전체 정보) -->
          <div class="representative-pet-section">
            <div v-if="representativePet" class="representative-pet-card">
              <div class="representative-header">
                <h3 class="representative-title">대표 반려동물</h3>
                <div class="representative-badge">
                  <v-icon color="amber" size="20">mdi-star</v-icon>
                  <span>대표</span>
            </div>
                  </div>
                  
              <!-- 대표동물 전체 정보 -->
              <div class="representative-content">
                <div class="pet-image-large">
                  <v-img
                    v-if="representativePet.url && representativePet.url.trim() !== ''"
                    :src="representativePet.url"
                    :alt="representativePet.name"
                    class="large-pet-image"
                    aspect-ratio="1"
                    cover
                  >
                    <template v-slot:error>
                      <div class="large-image-placeholder">
                        <v-icon :size="80" :color="getSpeciesIconColor(representativePet.petOrder)" :icon="getSpeciesIcon(representativePet.petOrder)" />
                        </div>
                    </template>
                  </v-img>
                  <div v-else class="large-image-placeholder">
                    <v-icon :size="80" :color="getSpeciesIconColor(representativePet.petOrder)" :icon="getSpeciesIcon(representativePet.petOrder)" />
                  </div>
                </div>
                
                <div class="pet-details-large">
                  <h2 class="pet-name-large">{{ representativePet.name }}</h2>
                  
                  <!-- 기본 정보 태그들 -->
                  <div class="pet-tags-large">
                    <v-chip 
                      size="medium" 
                      variant="tonal" 
                      :color="getSpeciesIconColor(representativePet.petOrder)"
                      :prepend-icon="getSpeciesIcon(representativePet.petOrder)"
                    >
                      {{ representativePet.species || '알 수 없음' }}
                    </v-chip>
                    
                    <v-chip 
                      size="medium" 
                      variant="tonal" 
                      :color="getGenderColor(representativePet.gender)"
                      :prepend-icon="getGenderIcon(representativePet.gender)"
                    >
                      {{ getGenderLabel(representativePet.gender) }}
                    </v-chip>
                    
                    <v-chip 
                      size="medium" 
                      variant="tonal" 
                      color="orange"
                      prepend-icon="mdi-cake-variant"
                    >
                      {{ representativePet.age }}살
                    </v-chip>
                        </div>
                  
                  <!-- 추가 정보 -->
                  <div class="additional-info-large">
                    <div class="info-row">
                      <v-icon size="20" color="grey-darken-1">mdi-weight</v-icon>
                      <span>{{ representativePet.weight || '알 수 없음' }}kg</span>
                    </div>
                    <div class="info-row">
                      <v-icon size="20" color="grey-darken-1">mdi-calendar</v-icon>
                      <span>{{ formatBirthday(representativePet.birthday) }}</span>
                    </div>
                    </div>

                  <!-- 소개글 -->
                  <div class="introduction-large">
                    <h4 class="introduction-title">소개글</h4>
                    <p v-if="representativePet.introduce" class="introduction-text">{{ representativePet.introduce }}</p>
                    <p v-else class="introduction-text no-introduction">소개글이 등록되지 않았습니다.</p>
                  </div>
                  
                  <!-- 액션 버튼들 -->
                  <div class="action-buttons-large">
                    <v-btn
                      color="#E87D7D"
                      variant="flat"
                      prepend-icon="mdi-eye"
                      @click="viewPet(representativePet)"
                      size="large"
                      rounded="xl"
                      class="view-details-btn"
                    >
                      상세보기
                    </v-btn>
                    <v-btn
                      color="#E87D7D"
                      variant="flat"
                      prepend-icon="mdi-delete"
                      @click="$emit('delete', representativePet)"
                      size="large"
                      rounded="xl"
                      class="delete-btn"
                    >
                      삭제
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 대표동물이 없을 때 -->
            <div v-else class="no-representative">
              <div class="no-representative-icon">
                <v-icon size="80" color="grey-lighten-1">mdi-star-outline</v-icon>
                            </div>
              <h3 class="no-representative-title">대표 반려동물을 설정해보세요</h3>
              <p class="no-representative-description">
                가장 소중한 가족 구성원을 대표로 설정하면 좌측에 전체 정보가 표시됩니다
              </p>
                          </div>
                        </div>
          
          <!-- 우측: 다른 동물들 (간단한 PetCard) -->
          <div class="other-pets-section">
            <h3 class="other-pets-title">등록된 다른 동물들</h3>
            <div class="other-pets-grid">
              <div
                v-for="pet in otherPets"
                :key="`pet-${pet.id}-${pet.url || 'no-image'}`"
                class="pet-card-wrapper"
              >
                <PetCard
                  :pet="pet"
                  :representative-pet="representativePet"
                  @set-representative="setAsRepresentative"
                  @view-details="viewPet"
                  @delete="confirmDelete"
                />
                    </div>
                  </div>
            
            <!-- 다른 동물이 없을 때 -->
            <div v-if="otherPets.length === 0" class="no-other-pets">
              <div class="no-other-pets-icon">
                <v-icon size="60" color="grey-lighten-1">mdi-paw-outline</v-icon>
                </div>
              <p class="no-other-pets-text">등록된 다른 반려동물이 없습니다</p>
              </div>
            </div>
          </div>
          
        <!-- 빈 상태 -->
        <div v-else-if="!loading" class="empty-state">
            <div class="empty-icon">
              <v-icon size="80" color="grey-lighten-1">mdi-paw-outline</v-icon>
            </div>
            <h3 class="empty-title">반려동물을 등록해보세요</h3>
            <p class="empty-description">
              소중한 가족 구성원을 등록하고 추억을 기록해보세요
            </p>
          <v-btn
            color="#E87D7D"
            variant="flat"
            prepend-icon="mdi-plus"
            @click="showAddForm = true"
            size="large"
            rounded="xl"
          >
            첫 반려동물 등록
          </v-btn>
        </div>
      </div>
    </div>

    <!-- 나머지 모달들은 기존과 동일 -->
            <!-- 펫 추가/수정 폼 모달 -->
        <v-dialog
          v-model="showAddForm"
          max-width="800"
          class="pet-form-dialog"
          @click:outside="closeForm"
          :scrim="false"
          persistent
        >
          <v-card class="pet-form-card" rounded="xl">
            <v-card-title class="form-header">
              <div class="form-title">
              <span class="text-h4">새 반려동물 등록</span>
              </div>
            </v-card-title>
            <v-card-text class="form-content">
              <PetForm
                :is-edit="false"
                @close="closeForm"
                @success="handleFormSuccess"
              />
            </v-card-text>
          </v-card>
        </v-dialog>

    <!-- 삭제 확인 모달 -->
    <ModalDialog
      v-model="showDeleteConfirm"
      title="반려동물 삭제"
      :max-width="500"
    >
      <div class="delete-confirm-content">
        <div class="delete-icon-container">
          <div class="delete-icon-circle">
            <v-icon size="48" color="white">mdi-delete</v-icon>
          </div>
        </div>
        <h3 class="delete-title">반려동물 삭제</h3>
        <p class="delete-message">
          <strong>"{{ petToDelete?.name }}"</strong>을(를) 삭제하면 복구할 수 없습니다.
        </p>
        <div class="delete-warning">
          <v-icon size="16" color="#FF9800" class="warning-icon">mdi-alert-circle</v-icon>
          <span>이 작업은 되돌릴 수 없습니다.</span>
        </div>
      </div>
      
      <template #actions>
        <div class="delete-actions">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="showDeleteConfirm = false"
            class="cancel-btn"
            size="large"
            rounded="lg"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deletePet"
            :loading="deleting"
            class="delete-btn"
            size="large"
            rounded="lg"
          >
            삭제
          </v-btn>
        </div>
      </template>
      </ModalDialog>

      <!-- 반려동물 상세 모달 -->
      <v-dialog
        v-model="showDetailModal"
        max-width="1400"
        class="pet-detail-dialog"
        @click:outside="closeDetailModal"
        :scrim="false"
        persistent
      >
        <v-card class="pet-detail-card" rounded="xl">
          <v-card-title class="detail-header">
            <div class="detail-title">
              <span class="text-h4">{{ selectedPet?.name }}</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="closeDetailModal"
              color="white"
              class="close-btn"
            />
          </v-card-title>
          <v-card-text class="detail-content">
            <div class="detail-layout">
              <div class="pet-image-detail">
                <div class="image-container">
                <v-img
                  v-if="imagePreviewUrl || selectedPet?.url"
                  :src="imagePreviewUrl || selectedPet?.url"
                  :alt="selectedPet.name"
                  class="detail-pet-image"
                  aspect-ratio="1"
                  cover
                >
                  <template v-slot:error>
                    <div class="detail-image-placeholder">
                      <v-icon :size="80" :color="getSpeciesIconColor(selectedPet?.petOrder)" :icon="getSpeciesIcon(selectedPet?.petOrder)" />
                    </div>
                  </template>
                </v-img>
                <div v-else class="detail-image-placeholder">
                  <v-icon :size="80" :color="getSpeciesIconColor(selectedPet?.petOrder)" :icon="getSpeciesIcon(selectedPet?.petOrder)" />
                </div>
                
                <!-- 이미지 변경 오버레이 (수정 모드일 때만, 호버 시 표시) -->
                <div v-if="isEditing" class="image-overlay" @click="handleImageChange">
                  <div class="camera-icon-container">
                    <v-icon class="camera-icon" size="32" color="white">mdi-camera</v-icon>
                    <span class="camera-text">사진 변경</span>
                  </div>
                </div>
              </div>
              
              <!-- 숨겨진 파일 입력 -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="onImageFileChange"
                style="display: none"
              />
              </div>

            <div class="pet-details-detail">
              <div class="detail-section">
                <h4 class="section-title">기본 정보</h4>
                <div class="info-grid">
                  <div class="info-item species-item">
                    <v-icon size="20" color="grey-darken-1">mdi-paw</v-icon>
                    <span class="info-label">종류</span>
                    <div v-if="isEditing" class="edit-field">
                      <v-autocomplete
                        v-model="editingPet.speciesId"
                        :items="speciesOptions"
                        item-title="species"
                        item-value="speciesId"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="edit-input rounded-input"
                        placeholder="종류 선택"
                        :model-value="editingPet.speciesId"
                        @update:model-value="(value) => {
                          console.log('🔍 종류 선택 변경:', {
                            newValue: value,
                            newValueType: typeof value,
                            selectedSpecies: speciesOptions.find(s => s.speciesId === value)
                          })
                          editingPet.speciesId = value
                          // petOrder도 함께 업데이트
                          const selectedSpecies = speciesOptions.find(s => s.speciesId === value)
                          if (selectedSpecies) {
                            editingPet.petOrder = selectedSpecies.petOrder
                            editingPet.species = selectedSpecies.species
                          }
                        }"
                      />
                    </div>
                    <span v-else class="info-value">{{ selectedPet?.species || '알 수 없음' }}</span>
                    <span class="species-detail">{{ selectedPet?.petOrder || '기타' }}</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-gender-male-female</v-icon>
                    <span class="info-label">성별</span>
                    <div v-if="isEditing" class="edit-field">
                      <v-select
                        v-model="editingPet.gender"
                        :items="genderOptions"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="edit-input rounded-input"
                        placeholder="성별 선택"
                        @update:model-value="(value) => {
                          console.log('🔍 성별 선택 변경:', {
                            newValue: value,
                            newValueType: typeof value,
                            newValueLabel: getGenderLabel(value),
                            isNeutered: value === 'NEUTRALITY'
                          })
                        }"
                      />
                    </div>
                    <span v-else class="info-value">{{ getGenderLabel(selectedPet?.gender) }}</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-cake-variant</v-icon>
                    <span class="info-label">나이</span>
                    <div v-if="isEditing" class="edit-field">
                      <v-text-field
                        v-model="editingPet.age"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="edit-input rounded-input"
                        placeholder="자동 계산됨"
                        min="0"
                        max="30"
                        readonly
                        :disabled="true"
                      />
                    </div>
                    <span v-else class="info-value">{{ selectedPet?.age !== null && selectedPet?.age !== undefined ? selectedPet.age + '살' : '알 수 없음' }}</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-weight</v-icon>
                    <span class="info-label">체중</span>
                    <div v-if="isEditing" class="edit-field">
                      <v-text-field
                        v-model="editingPet.weight"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="edit-input rounded-input"
                        placeholder="체중 입력"
                        min="0.1"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <span v-else class="info-value">{{ selectedPet?.weight || '알 수 없음' }}kg</span>
                  </div>
                  <div class="info-item">
                    <v-icon size="20" color="grey-darken-1">mdi-calendar</v-icon>
                    <span class="info-label">생일</span>
                    <div v-if="isEditing" class="edit-field">
                      <v-btn
                        :text="formatBirthday(editingPet.birthday) || '생일 선택'"
                        variant="outlined"
                        class="edit-input rounded-input date-btn"
                        @click="openDatePicker"
                        prepend-icon="mdi-calendar"
                        color="#E87D7D"
                      />
                    </div>
                    <span v-else class="info-value">{{ formatBirthday(selectedPet?.birthday) }}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            <!-- 소개글 섹션 (아래쪽에 배치) -->
            <div class="introduction-detail">
              <h4 class="introduction-title">소개글</h4>
              <div class="introduction-content">
                <div v-if="isEditing" class="edit-field">
                  <v-textarea
                    v-model="editingPet.introduce"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="edit-textarea rounded-textarea"
                    placeholder="반려동물에 대한 소개를 입력해주세요"
                    rows="4"
                    no-resize
                  />
                </div>
                <p v-else-if="selectedPet?.introduce && selectedPet.introduce.trim() !== ''" class="introduction-text">
                  {{ selectedPet.introduce }}
                </p>
                <p v-else class="introduction-text no-introduction">
                  소개글이 등록되지 않았습니다.
                </p>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="detail-actions">
            <!-- 수정 모드가 아닐 때 -->
            <template v-if="!isEditing">
              <v-btn
                color="#E87D7D"
                variant="flat"
                prepend-icon="mdi-pencil"
                @click="toggleEditMode"
                size="large"
                rounded="xl"
                class="edit-btn"
              >
                수정
              </v-btn>
              <v-btn
                color="error"
                variant="flat"
                prepend-icon="mdi-delete"
                @click="confirmDeleteFromModal"
                size="large"
                rounded="xl"
                class="delete-btn"
              >
                삭제
              </v-btn>
            </template>
            
            <!-- 수정 모드일 때 -->
            <template v-else>
              <v-btn
                color="grey"
                variant="flat"
                prepend-icon="mdi-close"
                @click="toggleEditMode"
                size="large"
                rounded="xl"
                class="cancel-btn"
              >
                취소
              </v-btn>
              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-content-save"
                @click="saveChanges"
                :loading="saving"
                size="large"
                rounded="xl"
                class="save-btn"
              >
                저장
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-dialog>

            <!-- 날짜 선택 모달 - 사진 형식대로 -->
      <v-dialog
        v-model="showDatePicker"
        max-width="400"
        @click:outside="showDatePicker = false"
        content-class="date-picker-dialog"
      >
        <v-card class="date-picker-card">
          <!-- 첫 화면: 일반 달력 -->
          <div v-if="!showYearPicker && !showMonthPicker" class="date-picker-main">
            <div class="date-picker-header">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                @click="previousMonth"
                class="nav-btn"
              />
              <span class="current-month-year" @click="showYearPicker = true">{{ currentDate.getFullYear() }}년 {{ currentDate.getMonth() + 1 }}월</span>
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                @click="nextMonth"
                class="nav-btn"
              />
            </div>
            
            <!-- 요일 헤더 -->
            <div class="weekdays-header">
              <div class="weekday">일</div>
              <div class="weekday">월</div>
              <div class="weekday">화</div>
              <div class="weekday">수</div>
              <div class="weekday">목</div>
              <div class="weekday">금</div>
              <div class="weekday">토</div>
            </div>
            
            <!-- 날짜 그리드 -->
            <div class="calendar-grid">
              <div
                v-for="date in calendarDates"
                :key="date.key"
                :class="['calendar-day', {
                  'other-month': !date.isCurrentMonth,
                  'selected': date.isSelected,
                  'today': date.isToday,
                  'disabled': date.isDisabled
                }]"
                @click="!date.isDisabled && selectDate(date)"
              >
                {{ date.day }}
              </div>
            </div>
            
            <div class="date-picker-actions">
              <v-btn
                variant="outlined"
                @click="cancelDateSelection"
                class="cancel-btn"
              >
                취소
              </v-btn>
              <v-btn
                color="#007bff"
                @click="confirmDateSelection"
                class="confirm-btn"
              >
                확인
              </v-btn>
            </div>
          </div>
          
          <!-- 연도 선택 화면 -->
          <div v-if="showYearPicker" class="year-picker">
            <div class="year-picker-header">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                @click="previousYearRange"
                class="nav-btn"
              />
              <span class="year-range" @click="showYearPicker = false; showMonthPicker = true">{{ yearRangeStart }} - {{ yearRangeEnd }}</span>
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                @click="nextYearRange"
                class="nav-btn"
              />
            </div>
            
            <div class="year-grid">
              <div
                v-for="year in yearRange"
                :key="year"
                :class="['year-cell', {
                  'selected': year === currentDate.getFullYear()
                }]"
                @click="selectYear(year)"
              >
                {{ year }}
              </div>
            </div>
            
            <div class="date-picker-actions">
              <v-btn
                variant="outlined"
                @click="backToMain"
                class="cancel-btn"
              >
                뒤로
              </v-btn>
              <v-btn
                color="#007bff"
                @click="confirmYearSelection"
                class="confirm-btn"
              >
                확인
              </v-btn>
            </div>
          </div>
          
          <!-- 월 선택 화면 -->
          <div v-if="showMonthPicker" class="month-picker">
            <div class="month-picker-header">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                @click="previousYear"
                class="nav-btn"
              />
              <span class="current-year">{{ currentDate.getFullYear() }}년</span>
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                @click="nextYear"
                class="nav-btn"
              />
            </div>
            
            <div class="month-grid">
              <div
                v-for="month in 12"
                :key="month"
                :class="['month-cell', {
                  'selected': month === selectedMonth
                }]"
                @click="selectMonth(month)"
              >
                {{ month }}월
              </div>
            </div>
            
            <div class="date-picker-actions">
              <v-btn
                variant="outlined"
                @click="backToMain"
                class="cancel-btn"
              >
                뒤로
              </v-btn>
              <v-btn
                color="#007bff"
                @click="confirmMonthSelection"
                class="confirm-btn"
              >
                확인
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-dialog>

      <!-- 반려동물 수정 폼 모달 -->
      <v-dialog
        v-model="showEditForm"
        max-width="1200"
        class="edit-form-dialog"
        @click:outside="closeEditForm"
        persistent
      >
        <v-card class="edit-form-card" rounded="xl">
          <v-card-title class="edit-form-header">
            <div class="edit-form-title">
              <span class="text-h4">{{ selectedPet?.name }} 수정</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="closeEditForm"
              color="white"
            />
          </v-card-title>
          <v-card-text class="edit-form-content">
            <PetForm
              :pet="selectedPet"
              :is-edit="true"
              @close="closeEditForm"
              @success="handlePetUpdate"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
            </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, shallowRef } from 'vue'
import { usePetStore } from '@/stores/pet'
import { useSnackbar } from '@/composables/useSnackbar'
import PetCard from './PetCard.vue'
import PetForm from './PetForm.vue'
import ModalDialog from '@/components/ui/organisms/ModalDialog.vue'

export default {
  name: 'PetList',
  components: {
    PetCard,
    PetForm,
    ModalDialog
  },
  emits: ['set-representative', 'view-details', 'delete'],
  setup() {
    const petStore = usePetStore()
    const { showSnackbar } = useSnackbar()
    
    const showAddForm = ref(false)
    const showDeleteConfirm = ref(false)
    const petToDelete = ref(null)
    const deleting = ref(false)
    const showDetailModal = ref(false)
    const selectedPet = shallowRef(null)
    const showEditForm = ref(false)
    const isEditing = ref(false)
    const editingPet = ref(null)
    const saving = ref(false)
    const showDatePicker = ref(false)
    
    // 달력 관련 변수들
    const currentDate = ref(new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"})))
    const selectedDate = ref(null)
    const showYearPicker = ref(false)
    const showMonthPicker = ref(false)
    const selectedMonth = ref(null)
    const yearRangeStart = ref(2017)
    const yearRangeEnd = ref(2028)
    
    // 등록 화면과 동일한 옵션들
    const speciesOptions = computed(() => {
      const species = petStore.getSpecies
      return species || []
    })
    const genderOptions = [
      { title: '수컷', value: 'MALE' },
      { title: '암컷', value: 'FEMALE' },
      { title: '중성', value: 'NEUTRALITY' }
    ]

    // 반려동물 데이터
    const pets = computed(() => petStore.pets)
    const loading = computed(() => petStore.loading)
    
    // 대표 반려동물 (PetStore에서 관리)
    const representativePet = computed(() => petStore.representativePet)
    
    // 대표가 아닌 다른 동물들
    const otherPets = computed(() => {
      if (!representativePet.value) return pets.value
      return pets.value.filter(pet => pet.id !== representativePet.value.id)
    })
    
    // 강아지/고양이 수 계산
    const getDogCount = () => pets.value.filter(pet => pet.petOrder === '강아지').length
    const getCatCount = () => pets.value.filter(pet => pet.petOrder === '고양이').length
    
    // 현재 이미지 URL 반환 (미리보기 우선) - computed로 변경
    const getCurrentImageUrl = computed(() => {
      console.log('🔄 getCurrentImageUrl 호출됨:', {
        editingPetPreview: editingPet.value?.previewImage,
        selectedPetTemp: selectedPet.value?.tempImageUrl,
        selectedPetUrl: selectedPet.value?.url,
        isEditing: isEditing.value
      })
      
      // 수정 모드에서 미리보기 이미지가 있으면 우선 표시
      if (editingPet.value?.previewImage) {
        console.log('📸 미리보기 이미지 사용:', editingPet.value.previewImage)
        return editingPet.value.previewImage
      }
      
      // 임시 이미지 URL이 있으면 표시
      if (selectedPet.value?.tempImageUrl) {
        console.log('📸 임시 이미지 URL 사용:', selectedPet.value.tempImageUrl)
        return selectedPet.value.tempImageUrl
      }
      
      // 기존 이미지 URL이 있으면 표시
      if (selectedPet.value?.url && selectedPet.value.url.trim() !== '') {
        console.log('📸 기존 이미지 URL 사용:', selectedPet.value.url)
        return selectedPet.value.url
      }
      
      console.log('📸 이미지 없음')
      return null
    })
    
    // 이미지 미리보기 URL을 위한 별도 ref
    const imagePreviewUrl = ref(null)
    
    // 생일 포맷팅
    const formatBirthday = (birthday) => {
      if (!birthday) return '알 수 없음'
      try {
        const date = new Date(birthday)
        if (isNaN(date.getTime())) return '알 수 없음'
        return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`
      } catch (error) {
        return '알 수 없음'
      }
    }
    
    // 나이 계산 함수 (더 정확한 계산)
    const calculateAge = (birthday) => {
      if (!birthday) return null
      
      // 현재 날짜를 명시적으로 설정 (브라우저 시간에 의존하지 않음)
      const today = new Date()
      const birthDate = new Date(birthday)
      
      // 날짜 파싱 확인
      if (isNaN(birthDate.getTime())) {
        console.error('❌ 잘못된 생일 형식:', birthday)
        return null
      }
      
      // 미래 날짜 체크
      if (birthDate > today) {
        console.warn('⚠️ 미래 날짜가 입력되었습니다:', birthday)
        return 0
      }
      
      // 더 정확한 나이 계산
      let age = today.getFullYear() - birthDate.getFullYear()
      
      // 생일이 지나지 않았으면 1살 빼기
      const currentMonth = today.getMonth()
      const birthMonth = birthDate.getMonth()
      const currentDay = today.getDate()
      const birthDay = birthDate.getDate()
      
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        age--
      }
      
      console.log('📅 나이 계산 상세:', {
        birthday,
        today: today.toISOString().split('T')[0],
        todayYear: today.getFullYear(),
        birthDate: birthDate.toISOString().split('T')[0],
        birthYear: birthDate.getFullYear(),
        currentMonth,
        birthMonth,
        currentDay,
        birthDay,
        rawAge: today.getFullYear() - birthDate.getFullYear(),
        calculatedAge: age,
        isBirthdayPassed: !(currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)),
        expectedAge: 2025 - 2019 // 2025년 기준으로 6살이어야 함
      })
      
      // 0살도 허용
      return Math.max(0, age)
    }
    
    // 종 아이콘 관련 함수들
    const getSpeciesIcon = (petOrder) => {
      const icons = {
        DOG: 'mdi-dog',
        CAT: 'mdi-cat',
        OTHER: 'mdi-paw'
      }
      return icons[petOrder] || 'mdi-paw'
    }
    
    const getSpeciesIconColor = (petOrder) => {
      const colors = {
        DOG: '#E87D7D',
        CAT: '#FF6B6B',
        OTHER: '#6B7280'
      }
      return colors[petOrder] || '#6B7280'
    }
    
    const getGenderColor = (gender) => {
      const colors = {
        MALE: '#3B82F6',
        FEMALE: '#EC4899',
        NEUTRALITY: '#6B7280'
      }
      return colors[gender] || '#6B7280'
    }
    
    const getGenderIcon = (gender) => {
      const icons = {
        MALE: 'mdi-gender-male',
        FEMALE: 'mdi-gender-female',
        NEUTRALITY: 'mdi-gender-male-female'
      }
      return icons[gender] || 'mdi-gender-male-female'
    }
    
    const getGenderLabel = (gender) => {
      const labels = {
        MALE: '수컷',
        FEMALE: '암컷',
        NEUTRALITY: '중성'
      }
      return labels[gender] || '알 수 없음'
    }
    
    // 대표 반려동물 설정
    const setAsRepresentative = async (pet) => {
      try {
        await petStore.setRepresentativePet(pet)
        showSnackbar('대표 반려동물이 변경되었습니다.', 'success')
      } catch (error) {
        showSnackbar('대표 반려동물 설정에 실패했습니다.', 'error')
      }
    }
    
    // 반려동물 상세보기
    const viewPet = (pet) => {
      console.log('🔍 viewPet 함수 호출됨:', pet)
      selectedPet.value = pet
      showDetailModal.value = true
      console.log('🔍 모달 상태:', { selectedPet: selectedPet.value, showDetailModal: showDetailModal.value })
    }
    
    // 모달 닫기
    const closeDetailModal = () => {
      // 수정 모드일 때 취소 처리
      if (isEditing.value) {
        // 수정 모드 취소
        isEditing.value = false
        
        // 임시 이미지 URL 정리
        if (selectedPet.value && selectedPet.value.tempImageUrl) {
          delete selectedPet.value.tempImageUrl
        }
        
        // 미리보기 URL 정리
        imagePreviewUrl.value = null
        
        editingPet.value = null
      }
      
      showDetailModal.value = false
      selectedPet.value = null
    }
    
    // 펫 업데이트 처리
    const handlePetUpdate = async (updatedPet) => {
      try {
        console.log('🔄 펫 수정 시작:', updatedPet)
        
        // 펫 정보 업데이트
        await petStore.updatePet(updatedPet)
        
        // 성공 메시지
        console.log('✅ 펫 수정 완료')
        
        // 수정 폼 모달 닫기
        showEditForm.value = false
        
        // 상세보기 모달도 닫기
        closeDetailModal()
        
        // 펫 목록 새로고침
        await petStore.fetchPets()
        
        // selectedPet 업데이트 (상세보기 모달에서 수정된 정보 반영)
        if (selectedPet.value && selectedPet.value.id === updatedPet.id) {
          selectedPet.value = { ...selectedPet.value, ...updatedPet }
        }
        
        // 성공 알림 표시
        showSnackbar('반려동물 정보가 성공적으로 수정되었습니다.', 'success')
        
      } catch (error) {
        console.error('❌ 펫 수정 실패:', error)
        showSnackbar('펫 정보 수정에 실패했습니다.', 'error')
      }
    }
    
    // 펫 삭제 처리
    const handlePetDelete = async (petId) => {
      try {
        await petStore.deletePet(petId)
        showSnackbar('반려동물이 삭제되었습니다.', 'success')
        closeDetailModal()
      } catch (error) {
        showSnackbar('반려동물 삭제에 실패했습니다.', 'error')
      }
    }
    
    // 수정 폼 열기
    const openEditForm = () => {
      console.log('🔄 수정 폼 열기 시작')
      console.log('selectedPet:', selectedPet.value)
      console.log('showEditForm 현재값:', showEditForm.value)
      
      if (!selectedPet.value) {
        console.error('❌ selectedPet이 없습니다!')
        showSnackbar('펫 정보를 찾을 수 없습니다.', 'error')
        return
      }
      
      showEditForm.value = true
      
      console.log('✅ showEditForm 설정됨:', showEditForm.value)
      console.log('수정 폼 모달 열림 완료')
      
      // 모달이 열렸는지 확인
      setTimeout(() => {
        console.log('⏰ 모달 상태 재확인:', {
          showEditForm: showEditForm.value,
          showDetailModal: showDetailModal.value
        })
      }, 100)
    }
    
    // 수정 폼 닫기
    const closeEditForm = () => {
      // 수정 중인 데이터가 있으면 초기화
      if (editingPet.value) {
        editingPet.value = null
      }
      
      // 미리보기 URL 정리
      imagePreviewUrl.value = null
      
      showEditForm.value = false
    }
    
    // 수정 모드 토글
    const toggleEditMode = () => {
      if (isEditing.value) {
        // 수정 모드 취소
        isEditing.value = false
        
        // 임시 이미지 URL 정리
        if (selectedPet.value && selectedPet.value.tempImageUrl) {
          delete selectedPet.value.tempImageUrl
        }
        
        // 미리보기 URL 정리
        imagePreviewUrl.value = null
        
        editingPet.value = null
      } else {
        // 수정 모드 시작 - DB에 저장된 데이터를 제대로 가져오기
        isEditing.value = true
        
        // selectedPet이 있는지 확인
        if (!selectedPet.value) {
          console.error('❌ 선택된 펫이 없습니다')
          showSnackbar('펫을 선택해주세요.', 'error')
          return
        }
        
        const pet = selectedPet.value
        
        // DB에 저장된 실제 데이터를 정확히 매핑
        editingPet.value = {
          id: pet.id,
          name: pet.name || '',
          age: pet.age || 0,
          gender: pet.gender || 'FEMALE',
          weight: pet.weight || 1.0,
          url: pet.url || '',
          birthday: pet.birthday || null,
          introduce: pet.introduce || '',
          species: pet.species || '',
          petOrder: pet.petOrder || '',
          // DB에 저장된 종류 ID - species 필드에서 speciesId 찾기
          speciesId: (() => {
            if (pet.speciesId) {
              return pet.speciesId
            }
            const speciesName = pet.species
            if (speciesName && speciesOptions.value.length > 0) {
              const foundSpecies = speciesOptions.value.find(s => s.species === speciesName)
              return foundSpecies ? foundSpecies.speciesId : null
            }
            return null
          })()
        }
        
        // 생일이 있으면 나이를 다시 계산
        if (editingPet.value.birthday) {
          const recalculatedAge = calculateAge(editingPet.value.birthday)
          if (recalculatedAge !== null) {
            editingPet.value.age = recalculatedAge
            console.log('🔄 수정 모드 - 생일 기반 나이 재계산:', {
              birthday: editingPet.value.birthday,
              originalAge: pet.age,
              recalculatedAge: recalculatedAge
            })
          }
        }
        
        console.log('🔍 수정 모드 시작 - DB 데이터 매핑:', {
          original: pet,
          editing: editingPet.value,
          speciesId: editingPet.value.speciesId,
          gender: editingPet.value.gender,
          age: editingPet.value.age,
          weight: editingPet.value.weight,
          birthday: editingPet.value.birthday,
          introduce: editingPet.value.introduce
        })
      }
    }
    
    // 날짜 선택 관련
    const openDatePicker = () => {
      // DB에 저장된 날짜가 있으면 해당 날짜로 달력 이동
      if (editingPet.value?.birthday) {
        const savedDate = new Date(editingPet.value.birthday)
        currentDate.value = new Date(savedDate.getFullYear(), savedDate.getMonth(), 1)
        selectedDate.value = savedDate
        console.log('📅 달력 열기 - DB 날짜로 이동:', savedDate)
      }
      showDatePicker.value = true
    }
    
    const handleDateSelection = (date) => {
      // 날짜가 선택되면 editingPet에 저장하고 모달 닫기
      if (date) {
        editingPet.value.birthday = date
        console.log('📅 선택된 날짜:', date)
        showDatePicker.value = false
        showSnackbar('생일이 선택되었습니다.', 'success')
      }
    }
    
    // 사진 변경 관련
    const fileInput = ref(null)
    
    const handleImageChange = () => {
      fileInput.value?.click()
    }
    
    const onImageFileChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        console.log('📸 이미지 변경 시작:', file.name, file.size)
        
        // 파일 크기 체크 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          showSnackbar('파일 크기는 5MB 이하여야 합니다.', 'error')
          return
        }
        
        // 수정 모드가 아닐 때는 바로 이미지 변경
        if (!isEditing.value) {
          showSnackbar('수정 모드에서만 이미지를 변경할 수 있습니다.', 'info')
          return
        }
        
        // editingPet과 selectedPet이 있는지 확인
        if (!editingPet.value || !selectedPet.value) {
          console.error('❌ 편집 데이터가 없습니다')
          showSnackbar('편집 데이터를 불러올 수 없습니다.', 'error')
          return
        }
        
        // 이미지 파일을 editingPet에 저장 (바로 저장하지 않음)
        editingPet.value.imageFile = file
        editingPet.value.previewImage = URL.createObjectURL(file)
        
        console.log('📸 이미지 파일이 수정 모드에 저장됨:', {
          fileName: file.name,
          fileSize: file.size,
          previewUrl: editingPet.value.previewImage
        })
        
        // 즉시 미리보기 반영을 위해 별도 ref에 설정
        imagePreviewUrl.value = editingPet.value.previewImage
        
        console.log('📸 이미지 미리보기 설정 완료:', {
          editingPetPreview: editingPet.value.previewImage,
          imagePreviewUrl: imagePreviewUrl.value
        })
        
        showSnackbar('이미지가 선택되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.', 'success')
        
      } catch (error) {
        console.error('❌ 이미지 변경 실패:', error)
        showSnackbar('이미지 변경에 실패했습니다.', 'error')
      }
      
      // 파일 입력 초기화
      event.target.value = ''
    }
    
    // 변경사항 저장
    const saveChanges = async () => {
      if (!editingPet.value) {
        console.error('❌ 편집 데이터가 없습니다')
        showSnackbar('편집할 데이터가 없습니다.', 'error')
        return
      }
      
      // 필수 필드 검증 (나이는 0도 허용)
      if (!editingPet.value.name || editingPet.value.age === null || editingPet.value.age === undefined || !editingPet.value.gender || !editingPet.value.weight) {
        console.error('❌ 필수 필드가 누락되었습니다:', editingPet.value)
        showSnackbar('필수 정보를 모두 입력해주세요.', 'error')
        return
      }
      
      saving.value = true
      try {
        console.log('💾 수정사항 저장 시작:', editingPet.value)
        
        // PetRegisterReq 데이터 구성
        const petRegisterReq = {
          name: editingPet.value.name,
          age: editingPet.value.age,
          gender: editingPet.value.gender,
          weight: editingPet.value.weight,
          url: selectedPet.value?.url || '',
          birthday: editingPet.value.birthday,
          introduce: editingPet.value.introduce,
          speciesId: editingPet.value.speciesId
        }
        
        console.log('🔍 저장할 데이터 상세:', {
          gender: editingPet.value.gender,
          genderType: typeof editingPet.value.gender,
          genderLabel: getGenderLabel(editingPet.value.gender),
          petRegisterReq
        })
        

        

        

        
        // DB에 펫 정보 업데이트 - 이미지 파일이 있으면 함께 전송
        const imageFile = editingPet.value.imageFile || null
        const updatedPet = await petStore.updatePet(editingPet.value.id, petRegisterReq, imageFile)
        console.log('✅ DB에 펫 정보 업데이트 완료:', updatedPet)
        

        
        
        
        // 펫 목록 새로고침
        await petStore.fetchPets()
        
        // 새로고침된 펫 목록에서 업데이트된 펫 찾기
        const refreshedPet = petStore.pets.find(p => p.id === editingPet.value.id)
        if (refreshedPet) {
          // selectedPet을 새로고침된 정보로 완전히 교체
          selectedPet.value = { ...refreshedPet }
          console.log('🔄 selectedPet을 새로고침된 정보로 교체 완료:', selectedPet.value)
          

        }
        
        // 수정 모드 종료
        isEditing.value = false
        
        // 임시 이미지 URL 정리
        if (selectedPet.value && selectedPet.value.tempImageUrl) {
          delete selectedPet.value.tempImageUrl
        }
        
        // 미리보기 URL 정리
        imagePreviewUrl.value = null
        
        editingPet.value = null
        
        // DOM 업데이트 보장
        await nextTick()
        
        showSnackbar('반려동물 정보가 성공적으로 수정되었습니다.', 'success')
        console.log('🎉 수정 완료 - 상세보기에 반영됨')
        
      } catch (error) {
        console.error('❌ 수정 실패:', error)
        const errorMessage = error.response?.data?.status?.message || error.message
        showSnackbar(`수정 중 오류가 발생했습니다: ${errorMessage}`, 'error')
      } finally {
        saving.value = false
      }
    }
    
    // 모달에서 삭제 확인
    const confirmDeleteFromModal = () => {
      if (selectedPet.value) {
        petToDelete.value = selectedPet.value
        showDeleteConfirm.value = true
        closeDetailModal() // 상세보기 모달 닫기
      }
    }
    
    // 삭제 확인
    const confirmDelete = (pet) => {
      petToDelete.value = pet
      showDeleteConfirm.value = true
    }
    
    // 반려동물 삭제
    const deletePet = async () => {
      if (!petToDelete.value) return
      
      try {
        deleting.value = true
        await petStore.deletePet(petToDelete.value.id)
          showSnackbar('반려동물이 삭제되었습니다.', 'success')
          showDeleteConfirm.value = false
          petToDelete.value = null
      } catch (error) {
        showSnackbar('반려동물 삭제에 실패했습니다.', 'error')
      } finally {
        deleting.value = false
      }
    }
    
    // 폼 관련
    const closeForm = () => {
      // 등록 폼에서 입력된 데이터가 있으면 초기화
      // PetForm 컴포넌트 내부에서 처리되므로 여기서는 모달만 닫기
      showAddForm.value = false
    }
    
    const handleFormSuccess = () => {
      showAddForm.value = false
      showSnackbar('반려동물이 성공적으로 등록되었습니다.', 'success')
    }
    
    // 컴포넌트 마운트 시 반려동물 데이터 로드
    onMounted(async () => {
      console.log('🔄 PetList 컴포넌트 마운트 시작')
      
      // species 데이터 가져오기
      await petStore.fetchSpecies()
      console.log('📥 species 데이터 가져오기 완료')
      
      if (pets.value.length === 0) {
        console.log('📥 반려동물 데이터 로드 시작')
        await petStore.fetchPets()
        console.log('📥 반려동물 데이터 로드 완료')
      }
      
      console.log('🔍 현재 상태 확인:')
      console.log('- pets.value.length:', pets.value.length)
      console.log('- representativePet.value:', representativePet.value)
      console.log('- pets.value:', pets.value)
      
      // 대표 반려동물이 설정되지 않은 경우 첫 번째 펫을 대표로 설정
      if (!representativePet.value && pets.value.length > 0) {
        console.log('⭐ 첫 번째 펫을 대표로 설정')
        await petStore.setRepresentativePet(pets.value[0])
        console.log('⭐ 대표 반려동물 설정 완료')
      }
      
      console.log('🔄 PetList 컴포넌트 마운트 완료')
    })
    
    // 달력 관련 함수들
    const yearRange = computed(() => {
      const years = []
      for (let i = yearRangeStart.value; i <= yearRangeEnd.value; i++) {
        years.push(i)
      }
      return years
    })
    
    const previousYear = () => {
      const newDate = new Date(currentDate.value)
      newDate.setFullYear(newDate.getFullYear() - 1)
      currentDate.value = newDate
    }
    
    const nextYear = () => {
      const newDate = new Date(currentDate.value)
      newDate.setFullYear(newDate.getFullYear() + 1)
      currentDate.value = newDate
    }
    
    const previousMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() - 1)
      currentDate.value = newDate
    }
    
    const nextMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + 1)
      currentDate.value = newDate
    }
    
    const calendarDates = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const dates = []
      const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
      today.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
      
      // 6주(42일) 또는 마지막 날짜까지 표시
      const totalDays = Math.max(42, startDate.getDate() + lastDay.getDate() + (6 - Math.ceil((startDate.getDate() + lastDay.getDate()) / 7)) * 7)
      
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
        date.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
        
        dates.push({
          key: i,
          day: date.getDate(),
          date: date,
          isCurrentMonth: date.getMonth() === month,
          isSelected: selectedDate.value && date.toDateString() === selectedDate.value.toDateString(),
          isToday: date.toDateString() === today.toDateString(),
          isDisabled: date > today // 오늘 이후 날짜는 비활성화
        })
      }
      
      return dates
    })
    
    const selectDate = (date) => {
      selectedDate.value = date.date
    }
    
    const previousYearRange = () => {
      yearRangeStart.value -= 12
      yearRangeEnd.value -= 12
    }
    
    const nextYearRange = () => {
      yearRangeStart.value += 12
      yearRangeEnd.value += 12
    }
    
    const selectMonth = (month) => {
      selectedMonth.value = month
      showMonthPicker.value = true
    }
    
    const selectYear = (year) => {
      currentDate.value = new Date(year, currentDate.value.getMonth(), 1)
      showYearPicker.value = false
    }
    
    const backToMain = () => {
      showYearPicker.value = false
      showMonthPicker.value = false
      selectedMonth.value = null
    }
    
    const confirmYearSelection = () => {
      showYearPicker.value = false
    }
    
    const confirmMonthSelection = () => {
      if (selectedMonth.value) {
        currentDate.value = new Date(currentDate.value.getFullYear(), selectedMonth.value - 1, 1)
        showMonthPicker.value = false
        selectedMonth.value = null
      }
    }
    
    const cancelDateSelection = () => {
      showDatePicker.value = false
      showYearPicker.value = false
      showMonthPicker.value = false
      selectedDate.value = null
      selectedMonth.value = null
    }
    
    const confirmDateSelection = () => {
      if (editingPet.value && selectedDate.value) {
        editingPet.value.birthday = selectedDate.value.toISOString().substr(0, 10)
        
        // 생일 변경 시 나이 자동 계산
        if (editingPet.value.birthday) {
          const age = calculateAge(editingPet.value.birthday)
          editingPet.value.age = age
          console.log('📅 생일 변경으로 나이 자동 계산:', { birthday: editingPet.value.birthday, age })
        }
        
        showDatePicker.value = false
        showYearPicker.value = false
        showMonthPicker.value = false
        selectedDate.value = null
        selectedMonth.value = null
        showSnackbar('생일이 선택되었습니다.', 'success')
      }
    }
    
          return {
        showAddForm,
        showDeleteConfirm,
        petToDelete,
        deleting,
        showDetailModal,
        selectedPet,
        showEditForm,
        isEditing,
        editingPet,
        saving,
        showDatePicker,
        // 달력 관련 변수들
        currentDate,
        selectedDate,
        showYearPicker,
        showMonthPicker,
        selectedMonth,
        yearRangeStart,
        yearRangeEnd,
        speciesOptions,
        genderOptions,
        fileInput,
        pets,
        loading,
        representativePet,
        otherPets,
        getDogCount,
        getCatCount,
        formatBirthday,
        calculateAge,
        getSpeciesIcon,
        getSpeciesIconColor,
        getGenderColor,
        getGenderIcon,
        getGenderLabel,
        getCurrentImageUrl,
        imagePreviewUrl,
        setAsRepresentative,
        viewPet,
        closeDetailModal,
        openEditForm,
        handlePetUpdate,
        handlePetDelete,
        closeEditForm,
        toggleEditMode,
        handleImageChange,
        onImageFileChange,
        saveChanges,
        openDatePicker,
        handleDateSelection,
        // 달력 관련 함수들
        yearRange,
        previousYear,
        nextYear,
        previousMonth,
        nextMonth,
        calendarDates,
        selectDate,
        previousYearRange,
        nextYearRange,
        selectMonth,
        selectYear,
        backToMain,
        confirmYearSelection,
        confirmMonthSelection,
        cancelDateSelection,
        confirmDateSelection,
        confirmDeleteFromModal,
        confirmDelete,
        deletePet,
        closeForm,
        handleFormSuccess
      }
  }
}
</script>

<style scoped>
.pet-list {
  min-height: 100vh;
  background: var(--v-theme-surface-light);
}

.pet-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

/* 페이지 헤더 (배경 위에 직접) */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
}

/* 통계 패널 */
.stats-panel {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin: 0 auto 32px auto;
  min-height: 120px;
  display: flex;
  align-items: center;
  max-width: 1120px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.stats-left {
  display: flex;
  gap: 40px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .v-icon {
  color: white;
  font-size: 28px;
}

.stat-info {
  text-align: left;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 4px;
}

/* 반려동물 추가 버튼 */
.add-button-container {
  display: flex;
  align-items: center;
}

.add-button {
  background: #E87D7D !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}



/* 반려동물 레이아웃 */
.pets-section {
  padding: 0;
}

.pets-layout {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 상단: 대표동물 섹션 */
.representative-pet-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  width: 100%;
}

.representative-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.representative-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.representative-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.representative-content {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.pet-image-large {
  flex-shrink: 0;
}

.large-pet-image {
  width: 240px;
  height: 240px;
  border-radius: 20px;
  overflow: hidden;
}

.large-image-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 20px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
}

.pet-details-large {
  flex: 1;
  display: flex;
    flex-direction: column;
    gap: 16px;
}

.pet-name-large {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.pet-tags-large {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.additional-info-large {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 1rem;
}

.introduction-large {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #E87D7D;
}

.introduction-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.introduction-text {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.introduction-text.no-introduction {
  color: #9ca3af;
  font-style: italic;
}

.action-buttons-large {
  display: flex;
  gap: 12px;
  margin-top: auto;
  align-items: center;
}

.view-details-btn {
  background: #E87D7D !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
  background: linear-gradient(135deg, #FF6B6B, #E87D7D) !important;
}

/* 대표동물이 없을 때 */
.no-representative {
  text-align: center;
  padding: 60px 20px;
}

.no-representative-icon {
  margin-bottom: 20px;
}

.no-representative-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.no-representative-description {
  color: #9ca3af;
  line-height: 1.5;
  margin: 0;
}

/* 하단: 다른 동물들 섹션 */
.other-pets-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.other-pets-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.other-pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.pet-card-wrapper {
  width: 100%;
}

/* 다른 동물이 없을 때 */
.no-other-pets {
  text-align: center;
  padding: 40px 20px;
}

.no-other-pets-icon {
  margin-bottom: 16px;
}

.no-other-pets-text {
  color: #9ca3af;
  margin: 0;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.empty-description {
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .other-pets-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .representative-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .pet-image-large {
    margin-bottom: 20px;
  }
  
  .action-buttons-large {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .stats-overview {
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }
  
  .representative-pet-section,
  .other-pets-section {
    padding: 20px;
  }
  
  .large-pet-image,
  .large-image-placeholder {
    width: 180px;
    height: 180px;
  }
  
  .pet-name-large {
    font-size: 1.5rem;
  }
}

/* 모달 스타일 */
.pet-form-dialog {
  z-index: 1000;
}

.pet-form-dialog .v-dialog {
  max-height: 90vh;
  margin: 20px;
  overflow: hidden !important;
}

.pet-form-card {
  border-radius: 20px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
}

.form-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  flex-shrink: 0;
}

.form-title {
  text-align: center;
}

.form-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 등록 폼 스크롤바 - 빨간색 커스텀 스타일 (최강제 적용) */
.pet-form-dialog .form-content::-webkit-scrollbar,
.form-content::-webkit-scrollbar,
.pet-form-card .form-content::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-track,
.form-content::-webkit-scrollbar-track,
.pet-form-card .form-content::-webkit-scrollbar-track {
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-thumb,
.form-content::-webkit-scrollbar-thumb,
.pet-form-card .form-content::-webkit-scrollbar-thumb {
  background: #E87D7D !important;
  border-radius: 6px !important;
  border: 1px solid #f8f9fa !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-thumb:hover,
.form-content::-webkit-scrollbar-thumb:hover,
.pet-form-card .form-content::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-corner,
.form-content::-webkit-scrollbar-corner,
.pet-form-card .form-content::-webkit-scrollbar-corner {
  background: #f8f9fa !important;
}

/* Firefox 스크롤바 */
.pet-form-dialog .form-content,
.form-content,
.pet-form-card .form-content {
  scrollbar-width: thin !important;
  scrollbar-color: #E87D7D #f8f9fa !important;
}

/* 삭제 확인 모달 */
.delete-confirm-content {
  text-align: center;
  padding: 32px 24px;
  background: white;
  border-radius: 16px;
}

.delete-icon-container {
  margin-bottom: 24px;
}

.delete-icon-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.delete-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  margin-top: 0;
}

.delete-message {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.delete-message strong {
  color: #333;
  font-weight: 600;
}

.delete-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff3e0;
  color: #e65100;
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid #ffcc02;
  font-size: 0.9rem;
  font-weight: 500;
}

.warning-icon {
  flex-shrink: 0;
}

.delete-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.cancel-btn {
  min-width: 100px;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #bdbdbd;
  background: #f5f5f5;
}

.delete-btn {
  min-width: 100px;
  font-weight: 600;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
  transition: all 0.2s ease;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

/* 반려동물 상세 모달 */
.pet-detail-dialog {
  z-index: 1000;
}

.pet-detail-dialog .v-dialog {
  max-height: 90vh;
  margin: 20px;
}

.pet-detail-card {
  border-radius: 20px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.detail-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-title .text-h4 {
  font-size: 2.5rem !important;
  font-weight: 700 !important;
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}



.close-btn {
  color: white !important;
}

.detail-content {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.detail-layout {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  margin-bottom: 32px;
}

.pet-image-detail {
  flex-shrink: 0;
}

.pet-details-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pet-image-detail {
  flex-shrink: 0;
}

.detail-pet-image {
  width: 500px;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.detail-image-placeholder {
  width: 500px;
  height: 500px;
  border-radius: 20px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
}

.pet-details-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: start;
}

/* 종류 항목은 전체 너비 사용 */
.info-grid .species-item {
  grid-column: 1 / -1;
  margin-bottom: 8px;
}

/* 나머지 항목들은 2열로 정렬 */
.info-grid .info-item:not(.species-item) {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  text-align: center;
}

/* 종류 항목은 특별한 레이아웃 */
.species-item {
  background: linear-gradient(135deg, #fef7f7, #fef2f2) !important;
  border-color: #E87D7D !important;
  padding: 24px 80px 24px 24px !important;
}

.species-item .info-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex: 1;
  text-align: center;
}

.species-item .species-detail {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #E87D7D;
  font-weight: 600;
  background: rgba(232, 125, 125, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 10;
}

.info-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #E87D7D;
}

.info-label {
  font-weight: 600;
  color: #64748b;
  min-width: 60px;
  font-size: 14px;
  text-align: center;
}

.info-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
  text-align: center;
}

/* 종 정보 특별 스타일 */
.species-item .v-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}



.detail-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 1rem;
}

.introduction-detail {
  background: #f8fafc;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.introduction-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.introduction-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  border-radius: 2px;
}

.introduction-text {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.no-introduction {
  font-style: italic;
  color: #9ca3af;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 24px;
}

/* 이미지 변경 오버레이 */
.image-container {
  position: relative;
  display: inline-block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
}

.image-overlay:hover {
  background: rgba(0, 0, 0, 0.6);
  opacity: 1;
}

.camera-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
}

.camera-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.camera-text {
  font-size: 0.875rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 편집 필드 스타일 - 모던하고 세련된 디자인 */
.edit-field {
  flex: 1;
  min-width: 120px;
  position: relative;
}

/* 입력창 기본 스타일 - 완전히 새로운 디자인 */
.edit-input {
  width: 100%;
  border-radius: 8px !important;
  background: #f9fafb !important;
  border: 1px solid #d1d5db !important;
  box-shadow: none !important;
  transition: all 0.15s ease !important;
  position: relative;
}

.edit-input:hover {
  background: #ffffff !important;
  border-color: #9ca3af !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.edit-input:focus-within {
  background: #ffffff !important;
  border-color: #E87D7D !important;
  box-shadow: 0 0 0 2px rgba(232, 125, 125, 0.2) !important;
}

.edit-input .v-field {
  border-radius: 8px !important;
  background: transparent !important;
  min-height: 40px !important;
}

.edit-input .v-field__outline {
  border-color: transparent !important;
}

.edit-input .v-field__input {
  padding: 10px 14px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1f2937 !important;
  line-height: 1.4 !important;
}

.edit-input .v-field__input::placeholder {
  color: #6b7280 !important;
  font-weight: 400 !important;
}

/* 드롭다운 화살표 스타일 */
.edit-input .v-field__append-inner {
  color: #9ca3af !important;
}

.edit-input .v-field__append-inner .v-icon {
  font-size: 14px !important;
  transition: color 0.15s ease !important;
}

.edit-input:hover .v-field__append-inner .v-icon {
  color: #E87D7D !important;
}

.rounded-input {
  border-radius: 8px !important;
}

.rounded-input .v-field {
  border-radius: 8px !important;
}

/* 날짜 선택 버튼 */
.date-btn {
  width: 100% !important;
  height: 40px !important;
  border-radius: 8px !important;
  background: linear-gradient(145deg, #ffffff, #f8fafc) !important;
  border: 2px solid #e2e8f0 !important;
  color: #1f2937 !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.date-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 125, 125, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.date-btn:hover {
  border-color: #E87D7D !important;
  background: linear-gradient(145deg, #fef2f2, #fdf2f8) !important;
  box-shadow: 
    0 8px 25px -5px rgba(232, 125, 125, 0.25),
    0 4px 10px -3px rgba(232, 125, 125, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
  transform: translateY(-2px) !important;
  color: #E87D7D !important;
}

.date-btn:hover::before {
  opacity: 1;
}

.date-btn .v-btn__content {
  gap: 8px !important;
}

.date-btn .v-icon {
  color: #E87D7D !important;
  transition: transform 0.2s ease !important;
}

.date-btn:hover .v-icon {
  color: #E87D7D !important;
}

/* 텍스트 영역 */
.edit-textarea {
  width: 100%;
  border-radius: 16px !important;
  background: linear-gradient(145deg, #ffffff, #f8fafc) !important;
  border: 2px solid #e2e8f0 !important;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.edit-textarea::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 125, 125, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.edit-textarea:hover {
  border-color: #E87D7D !important;
  box-shadow: 
    0 8px 25px -5px rgba(232, 125, 125, 0.25),
    0 4px 10px -3px rgba(232, 125, 125, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
  transform: translateY(-2px) !important;
}

.edit-textarea:hover::before {
  opacity: 1;
}

.edit-textarea:focus-within {
  border-color: #E87D7D !important;
  box-shadow: 
    0 0 0 3px rgba(232, 125, 125, 0.1),
    0 8px 25px -5px rgba(232, 125, 125, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
  transform: translateY(-1px) !important;
}

.edit-textarea .v-field {
  border-radius: 16px !important;
  background: transparent !important;
  min-height: 120px !important;
}

.edit-textarea .v-field__outline {
  border-color: transparent !important;
}

.edit-textarea .v-field__input {
  padding: 18px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1f2937 !important;
  line-height: 1.6 !important;
  resize: vertical !important;
}

.edit-textarea .v-field__input::placeholder {
  color: #9ca3af !important;
  font-weight: 400 !important;
}

.rounded-textarea {
  border-radius: 16px !important;
}

.rounded-textarea .v-field {
  border-radius: 16px !important;
}

/* 비활성화된 입력창 스타일 */
.edit-input.v-input--disabled,
.edit-textarea.v-input--disabled {
  background: linear-gradient(145deg, #f9fafb, #f3f4f6) !important;
  border-color: #e5e7eb !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
}

.edit-input.v-input--disabled:hover,
.edit-textarea.v-input--disabled:hover {
  transform: none !important;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}



/* 수정 모드 버튼 스타일 */
.cancel-btn {
  background: #6b7280 !important;
  color: white !important;
}

.save-btn {
  background: #10b981 !important;
  color: white !important;
}

/* 사진과 동일한 달력 스타일 */
.date-picker-dialog {
  background: transparent !important;
  box-shadow: none !important;
}

.date-picker-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

/* 첫 화면 스타일 */
.date-picker-main {
  padding: 20px;
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0;
}

.nav-btn {
  color: #666 !important;
  border-radius: 50% !important;
  transition: all 0.2s ease;
  background: transparent !important;
  min-width: 32px;
  height: 32px;
  padding: 0 !important;
  margin: 0 8px;
  border: none !important;
  box-shadow: none !important;
}

.nav-btn:hover {
  background: #ffe6e6 !important;
  color: #d32f2f !important;
  transform: none !important;
}

.current-year {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.month-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: white;
}

.month-cell:hover {
  background: #ffe6e6 !important;
  border-color: #f44336;
  transform: scale(1.05);
  color: #d32f2f;
}

.month-cell.selected {
  background: #ffe6e6 !important;
  color: #d32f2f !important;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
  transform: scale(1.05);
  border-color: #f44336;
}

/* 연도 선택 화면 */
.year-picker {
  padding: 20px;
}

.year-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0;
}

.year-range {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.year-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: white;
}

.year-cell:hover {
  background: #ffe6e6 !important;
  border-color: #f44336;
  transform: scale(1.05);
  color: #d32f2f;
}

.year-cell.selected {
  background: #ffe6e6 !important;
  color: #d32f2f !important;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
  transform: scale(1.05);
  border-color: #f44336;
}

/* 월 선택 화면 */
.month-picker {
  padding: 20px;
}

.month-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0;
}

/* 일반 달력 스타일 */
.date-picker-main {
  padding: 20px;
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0;
}

.current-month-year {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.current-month-year:hover {
  background: #ffe6e6 !important;
  color: #d32f2f;
  border-color: #f44336;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: white;
}

.calendar-day:hover {
  background: #ffe6e6 !important;
  border-color: #f44336;
  color: #d32f2f;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.selected {
  background: #ffe6e6 !important;
  color: #d32f2f !important;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
  border-color: #f44336;
  font-weight: 600;
}

.calendar-day.today {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
  font-weight: 600;
}

.calendar-day.disabled {
  color: #ccc !important;
  cursor: not-allowed !important;
  background: #f8f9fa !important;
  border-color: #e9ecef !important;
}

.calendar-day.disabled:hover {
  background: #f8f9fa !important;
  border-color: #e9ecef !important;
  transform: none !important;
}

/* 공통 액션 버튼 */
.date-picker-actions {
  padding: 16px 20px;
  background: white !important;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.cancel-btn {
  border-color: #495057;
  color: #495057 !important;
  background: white !important;
  border-radius: 20px !important;
  font-weight: 600;
  padding: 10px 20px;
  min-width: 80px;
  border: 1px solid #495057;
}

.confirm-btn {
  color: white;
  background: #f44336 !important;
  border-radius: 20px !important;
  font-weight: 500;
  padding: 10px 20px;
  min-width: 80px;
  border: none;
}

/* 수정 폼 모달 */
.edit-form-dialog {
  z-index: 1000;
}

.edit-form-dialog .v-dialog {
  max-height: 90vh;
  margin: 20px;
}

.edit-form-card {
  border-radius: 20px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.edit-form-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.edit-form-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-form-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 수정 폼 스크롤바 */
.edit-form-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.edit-form-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.edit-form-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  border-radius: 10px;
  border: 2px solid #f1f5f9;
}

.edit-form-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #FF6B6B, #E87D7D);
}

.edit-form-content::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* Firefox 스크롤바 */
.edit-form-content {
  scrollbar-width: thin;
  scrollbar-color: #E87D7D #f1f5f9;
}

/* 모달 내부 콘텐츠 영역 스크롤바 - 빨간색 커스텀 스타일 */
.form-content::-webkit-scrollbar,
.edit-form-content::-webkit-scrollbar,
.detail-content::-webkit-scrollbar,
.form-content .step-content::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
}

.form-content::-webkit-scrollbar-track,
.edit-form-content::-webkit-scrollbar-track,
.detail-content::-webkit-scrollbar-track,
.form-content .step-content::-webkit-scrollbar-track {
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
}

.form-content::-webkit-scrollbar-thumb,
.edit-form-content::-webkit-scrollbar-thumb,
.detail-content::-webkit-scrollbar-thumb,
.form-content .step-content::-webkit-scrollbar-thumb {
  background: #E87D7D !important;
  border-radius: 6px !important;
  border: 1px solid #f8f9fa !important;
}

.form-content::-webkit-scrollbar-thumb:hover,
.edit-form-content::-webkit-scrollbar-thumb:hover,
.detail-content::-webkit-scrollbar-thumb:hover,
.form-content .step-content::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B !important;
}

.form-content::-webkit-scrollbar-corner,
.edit-form-content::-webkit-scrollbar-corner,
.detail-content::-webkit-scrollbar-corner,
.form-content .step-content::-webkit-scrollbar-corner {
  background: #f8f9fa !important;
}

/* 모달 내부 콘텐츠 영역의 Firefox 스크롤바 */
.form-content,
.edit-form-content {
  scrollbar-width: thin;
  scrollbar-color: #E87D7D rgba(241, 245, 249, 0.3);
}

/* 등록 폼 내부 step-content의 Firefox 스크롤바 */
.form-content .step-content {
  scrollbar-width: thin;
  scrollbar-color: #E87D7D #f8f9fa;
}

/* 등록 폼 전체 스크롤바 강제 적용 */
.form-content {
  overflow-y: auto !important;
}

.form-content .step-content {
  overflow-y: auto !important;
}

/* 모든 스크롤바를 빨간색으로 강제 적용 */
.pet-form-dialog *::-webkit-scrollbar,
.pet-form-card *::-webkit-scrollbar,
.form-content *::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
}

.pet-form-dialog *::-webkit-scrollbar-track,
.pet-form-card *::-webkit-scrollbar-track,
.form-content *::-webkit-scrollbar-track {
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
}

.pet-form-dialog *::-webkit-scrollbar-thumb,
.pet-form-card *::-webkit-scrollbar-thumb,
.form-content *::-webkit-scrollbar-thumb {
  background: #E87D7D !important;
  border-radius: 6px !important;
  border: 1px solid #f8f9fa !important;
}

.pet-form-dialog *::-webkit-scrollbar-thumb:hover,
.pet-form-card *::-webkit-scrollbar-thumb:hover,
.form-content *::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B !important;
}

.pet-form-dialog *::-webkit-scrollbar-corner,
.pet-form-card *::-webkit-scrollbar-corner,
.form-content *::-webkit-scrollbar-corner {
  background: #f8f9fa !important;
}

/* PetForm 내부 스크롤바 비활성화 */
.form-content .pet-form-container .step-content::-webkit-scrollbar {
  display: none !important;
}

.form-content .pet-form-container .step-content {
  scrollbar-width: none !important;
}

/* 상세보기 모달 Firefox 스크롤바 강화 */
.detail-content {
  scrollbar-width: auto;
  scrollbar-color: #E87D7D rgba(241, 245, 249, 0.2);
}

/* 모달 열릴 때 바디 스크롤 완전 차단 */
.pet-form-dialog.v-dialog--active,
.edit-form-dialog.v-dialog--active,
.pet-detail-dialog.v-dialog--active {
  overflow: hidden !important;
}

.pet-form-dialog.v-dialog--active ~ .v-overlay,
.edit-form-dialog.v-dialog--active ~ .v-overlay,
.pet-detail-dialog.v-dialog--active ~ .v-overlay {
  overflow: hidden !important;
}

/* 모달 자체 스크롤 차단 */
.pet-form-dialog .v-dialog,
.edit-form-dialog .v-dialog,
.pet-detail-dialog .v-dialog {
  overflow: hidden !important;
}

/* 모달 카드 스크롤 차단 */
.pet-form-card,
.edit-form-card,
.pet-detail-card {
  overflow: hidden !important;
}

/* 전역 바디 스크롤 차단 (모달 열릴 때) */
body.v-dialog--active {
  overflow: hidden !important;
  padding-right: 0 !important;
}

/* 전역 스크롤바 숨김 */
html {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar {
  display: none;
}

body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

body::-webkit-scrollbar {
  display: none;
}

/* 모달 전체 스크롤바 숨김 */
.pet-form-dialog .v-dialog::-webkit-scrollbar,
.edit-form-dialog .v-dialog::-webkit-scrollbar,
.pet-detail-dialog .v-dialog::-webkit-scrollbar {
  display: none;
}

.pet-form-card::-webkit-scrollbar,
.edit-form-card::-webkit-scrollbar,
.pet-detail-card::-webkit-scrollbar {
  display: none;
}

/* 상세보기 모달 스크롤바 - 간단한 빨간색 스타일 */
.detail-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #E87D7D;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B;
}

/* 텍스트 영역 스크롤바 - 간단한 빨간색 스타일 */
.edit-textarea::-webkit-scrollbar {
  width: 6px;
}

.edit-textarea::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.edit-textarea::-webkit-scrollbar-thumb {
  background: #E87D7D;
  border-radius: 4px;
}

.edit-textarea::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B;
}
</style>

