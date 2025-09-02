<template>
  <div class="pet-list">
    <!-- 이미지 크롭 모달 -->
    <ImageCropper
      v-model="showCropper"
      :image-url="cropperImageUrl"
      @crop="handleCrop"
    />
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
                      size="small" 
                      variant="tonal" 
                      :color="getSpeciesIconColor(representativePet.petOrder)"
                      :prepend-icon="getSpeciesIcon(representativePet.petOrder)"
                      class="info-chip"
                    >
                      {{ representativePet.species || '알 수 없음' }}
                    </v-chip>
                    
                    <v-chip 
                      size="small" 
                      variant="tonal" 
                      :color="getGenderColor(representativePet.gender)"
                      :prepend-icon="getGenderIcon(representativePet.gender)"
                      class="info-chip"
                    >
                      {{ getGenderLabel(representativePet.gender) }}
                    </v-chip>
                    
                    <v-chip 
                      size="small" 
                      variant="tonal" 
                      color="orange"
                      prepend-icon="mdi-cake-variant"
                      class="info-chip"
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
                    <div style="margin-left: auto; display: flex; gap: 8px;">
                      <v-btn
                        color="#E87D7D"
                        variant="flat"
                        prepend-icon="mdi-eye"
                        @click="viewPet(representativePet)"
                        size="small"
                        rounded="lg"
                        class="action-btn"
                      >
                        상세보기
                      </v-btn>
                      <v-btn
                        color="#E87D7D"
                        variant="flat"
                        prepend-icon="mdi-delete"
                        @click="confirmDelete(representativePet)"
                        size="small"
                        rounded="lg"
                        class="action-btn"
                      >
                        삭제
                      </v-btn>
                    </div>
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
            <div class="other-pets-grid" :class="getGridClass(otherPets.length)">
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
              <v-btn
                icon="mdi-close"
                variant="text"
                @click="closeForm"
                color="white"
                class="close-btn"
              />
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

    <!-- 삭제 확인 모달 - PetForm 스타일 적용 -->
    <v-dialog
      v-model="showDeleteConfirm"
      width="600"
      class="delete-dialog"
      @click:outside="showDeleteConfirm = false"
      :scrim="false"
      persistent
    >
      <v-card class="delete-modal-card" rounded="xl">
        <v-card-title class="delete-header">
          <div class="delete-title-section">
            <v-icon size="32" color="white">mdi-delete</v-icon>
            <span class="text-h5">반려동물 삭제</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="showDeleteConfirm = false"
            class="close-btn"
          />
        </v-card-title>
        
        <v-card-text class="delete-content">
          <div class="delete-icon-container">
            <div class="delete-icon-circle">
              <v-img
                v-if="petToDelete?.url"
                :src="petToDelete.url"
                :alt="petToDelete.name"
                class="delete-pet-image"
                cover
              />
              <v-icon v-else size="48" color="white">mdi-delete</v-icon>
            </div>
          </div>
          
          <div class="delete-message-section">
            <h3 class="delete-pet-name">{{ petToDelete?.name }}</h3>
            <p class="delete-description">
              이 반려동물을 삭제하면 복구할 수 없습니다.
            </p>
            <div class="delete-warning">
              <v-icon size="20" color="#FF9800" class="warning-icon">mdi-alert-circle</v-icon>
              <span>이 작업은 되돌릴 수 없습니다.</span>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="delete-actions">
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
        </v-card-actions>
      </v-card>
    </v-dialog>

      <!-- 반려동물 상세 모달 -->
      <v-dialog
        v-model="showDetailModal"
        max-width="1000"
        class="pet-detail-dialog"
        @click:outside="closeDetailModal"
        :scrim="false"
        persistent
      >
        <v-card class="pet-detail-card" rounded="xl">
          <v-card-title class="detail-header">
            <div class="detail-title">
              <v-icon size="32" color="white">mdi-paw</v-icon>
              <span class="text-h5">반려동물 정보</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="closeDetailModal"
              color="white"
              class="close-btn"
              size="large"
            />
          </v-card-title>
          <v-card-text class="detail-content">
            <div class="detail-layout">
              <div class="pet-image-detail">
                <div class="image-container">
                <v-img
                  v-if="imagePreviewUrl || selectedPet?.url"
                  :src="imagePreviewUrl || selectedPet?.url"
                  :alt="selectedPet?.name || '반려동물'"
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
              
                          <!-- 생일 필드 (이미지 밑) -->
            <div class="birthday-field-section">
              <div class="birthday-field">
                <label class="birthday-label">생일</label>
                <div class="birthday-value">
                  {{ isEditing ? (editingPet?.birthday ? formatBirthday(editingPet.birthday) : '생일을 선택하세요') : (selectedPet?.birthday ? formatBirthday(selectedPet.birthday) : '알 수 없음') }}
                </div>
              </div>
            </div>



                          <!-- 달력 섹션 - PetForm과 완전히 동일한 구조 -->
            <div class="calendar-section">
              <div class="date-picker-main">
                <!-- 메인 달력 화면 -->
                <div v-if="!showYearPicker && !showMonthPicker" class="main-calendar">
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
                  <div class="weekdays">
                    <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                </div>
                
                  <!-- 날짜 그리드 -->
                  <div class="calendar-grid">
                    <div
                      v-for="date in calendarDates"
                      :key="date.key"
                      class="calendar-day"
                      :class="{
                        'other-month': !date.isCurrentMonth,
                        'today': date.isToday,
                        'selected': date.isSelected,
                        'birthday': date.isBirthday,
                        'disabled': date.isDisabled
                      }"
                      @click="!date.isDisabled ? selectDate(date) : null"
                    >
                      {{ date.date }}
                    </div>
                </div>
                
                <!-- 날짜 선택 후 액션 버튼들 (수정 모드에서만) -->
                <div v-if="isEditing && !showYearPicker && !showMonthPicker" class="date-picker-actions">
                  <v-btn
                    v-show="selectedDate || editingPet?.birthday"
                    variant="text"
                    class="clear-btn"
                    @click="clearBirthdayFromPicker"
                  >
                    초기화
                  </v-btn>
                  <div class="right-buttons">
                    <v-btn
                      variant="text"
                      class="cancel-btn"
                      @click="cancelDateSelection"
                    >
                      <v-icon start size="18">mdi-close</v-icon>
                      취소
                    </v-btn>
                    <v-btn
                      class="confirm-btn"
                      color="#E87D7D"
                      @click="confirmDateSelection"
                    >
                      확인
                    </v-btn>
                  </div>
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
                    <span class="current-year clickable-year" @click="goToYearPicker">{{ currentDate.getFullYear() }}년</span>
                    <v-btn
                      icon="mdi-chevron-right"
                      variant="text"
                      @click="nextYear"
                      class="nav-btn"
                    />
                  </div>
                  
                  <div class="month-grid">
                    <div
                      v-for="month in [1,2,3,4,5,6,7,8,9,10,11,12]"
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
                

              </div>
            </div>

              </div>

            <div class="pet-details-detail">
              <div class="detail-section">
                <h4 class="section-title">기본 정보</h4>
                <div v-if="isEditing" class="form-fields-section compact-form-section">
                  <!-- 종류 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">반려동물 종류 *</label>
                      <v-autocomplete
                        v-model="editingPet.speciesId"
                        :items="speciesOptions"
                        item-title="species"
                        item-value="speciesId"
                      placeholder="종류를 검색하세요"
                        variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                        density="compact"
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

                  <!-- 이름 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">반려동물 이름 *</label>
                      <v-text-field
                        v-model="editingPet.name"
                      placeholder="반려동물 이름을 입력하세요"
                        variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                        density="compact"
                        maxlength="20"
                      />
                    </div>

                  <!-- 성별 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">성별 *</label>
                      <v-select
                        v-model="editingPet.gender"
                        :items="genderOptions"
                        item-title="title"
                        item-value="value"
                      placeholder="성별을 선택하세요"
                        variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                        density="compact"
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

                  <!-- 나이 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">나이 *</label>
                      <v-text-field
                        v-model="editingPet.age"
                        type="number"
                      :placeholder="editingPet.birthday ? '자동 계산됨' : '나이를 입력하세요'"
                        variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                        hide-details="auto"
                      density="compact"
                        min="0"
                        max="30"
                        :readonly="!!editingPet.birthday"
                        :disabled="!!editingPet.birthday"
                        :rules="!editingPet.birthday ? [v => v !== null && v !== undefined && v !== '' || '나이를 입력하세요'] : []"
                        required
                        ref="ageInput"
                      />
                    </div>

                  <!-- 몸무게 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">몸무게 (kg) *</label>
                      <v-text-field
                        v-model="editingPet.weight"
                        type="number"
                      placeholder="몸무게를 입력하세요"
                        variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                        density="compact"
                        min="0.1"
                        max="100"
                        step="0.1"
                      />
                    </div>


                  </div>

                <!-- 읽기 전용 모드 -->
                <div v-else class="form-fields-section compact-form-section">
                  <!-- 종류 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">반려동물 종류 *</label>
                    <v-text-field
                      :model-value="selectedPet?.species || '알 수 없음'"
                      variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                      density="compact"
                      readonly
                    />
                </div>

                  <!-- 이름 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">반려동물 이름 *</label>
                    <v-text-field
                      :model-value="selectedPet?.name || '알 수 없음'"
                      variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                      density="compact"
                      readonly
                    />
              </div>

                  <!-- 성별 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">성별 *</label>
                    <v-text-field
                      :model-value="getGenderLabel(selectedPet?.gender) || '알 수 없음'"
                      variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                      density="compact"
                      readonly
                    />
                  </div>

                  <!-- 나이 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">나이 *</label>
                    <v-text-field
                      :model-value="selectedPet?.age !== null && selectedPet?.age !== undefined ? selectedPet.age + '살' : '알 수 없음'"
                      variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                      density="compact"
                      readonly
                    />
                  </div>

                  <!-- 몸무게 -->
                  <div class="form-field compact-form-field">
                    <label class="field-label compact-label">몸무게 (kg) *</label>
                    <v-text-field
                      :model-value="selectedPet?.weight ? selectedPet.weight + 'kg' : '알 수 없음'"
                      variant="outlined"
                      rounded="lg"
                      class="form-input modern-input"
                      hide-details="auto"
                      density="compact"
                      readonly
                    />
                  </div>


                  

                </div>
              </div>
            </div>
            </div>
            
            <!-- 소개글 섹션 (아래쪽에 배치) -->
            <div class="introduction-detail compact-introduction">
              <h4 class="introduction-title compact-title">소개글</h4>
              <div class="introduction-content compact-content">
                <div v-if="isEditing" class="edit-field compact-edit-field">
                  <v-textarea
                    v-model="editingPet.introduce"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="edit-textarea modern-input modern-textarea"
                    placeholder="반려동물에 대한 소개를 입력해주세요"
                    rows="5"
                    no-resize
                  />
                </div>
                <p v-else-if="selectedPet?.introduce && selectedPet.introduce.trim() !== ''" class="introduction-text compact-text">
                  {{ selectedPet.introduce }}
                </p>
                <p v-else class="introduction-text no-introduction compact-text">
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
                  size="small"
                  rounded="lg"
                  class="edit-btn action-btn"
                >
                  수정
                </v-btn>
                <v-btn
                  color="error"
                  variant="flat"
                  prepend-icon="mdi-delete"
                  @click="confirmDeleteFromModal"
                  size="small"
                  rounded="lg"
                  class="delete-btn action-btn"
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
                  size="small"
                  rounded="lg"
                  class="cancel-btn action-btn"
                >
                  취소
                </v-btn>
                <v-btn
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-content-save"
                  @click="saveChanges"
                  :loading="saving"
                  size="small"
                  rounded="lg"
                  class="save-btn action-btn"
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
                v-show="selectedDate || editingPet?.birthday"
                variant="text"
                class="clear-btn"
                @click="clearBirthdayFromPicker"
              >
                초기화
              </v-btn>
              <div class="right-buttons">
                <v-btn
                  variant="text"
                  class="cancel-btn"
                  @click="cancelDateSelection"
                >
                  <v-icon start size="18">mdi-close</v-icon>
                  취소
                </v-btn>
                <v-btn
                  class="confirm-btn"
                  @click="confirmDateSelection"
                >
                  확인
                </v-btn>
              </div>
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
              <span class="current-year clickable-year" @click="goToYearPicker">{{ currentDate.getFullYear() }}년</span>
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
        max-width="1100"
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
import ImageCropper from '@/components/common/ImageCropper.vue'

export default {
  name: 'PetList',
  components: {
    PetCard,
    PetForm,
    ImageCropper
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
    
    // 달력 관련 상태 - PetForm과 동일
    const currentDate = ref(new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"})))
    const selectedDate = ref(null)
    const showYearPicker = ref(false)
    const showMonthPicker = ref(false)
    const selectedMonth = ref(null)

    const yearRangeStart = ref(2017) // 2017년부터
    const yearRangeEnd = ref(2028)   // 2028년까지
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const editingPet = ref(null)
    const saving = ref(false)
    const showDatePicker = ref(false)
    
    // 달력 관련 변수들
    
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
    
    // 이미지 크롭 관련
    const showCropper = ref(false)
    const cropperImageUrl = ref('')
    
    // 생일 포맷팅 - 간단하게 표시
    const formatBirthday = (birthday) => {
      if (!birthday) return '알 수 없음'
      try {
        const date = new Date(birthday)
        if (isNaN(date.getTime())) return '알 수 없음'
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
      } catch (error) {
        return '알 수 없음'
      }
    }
    
    // 생일까지 남은 일수 계산
    const getBirthdayCountdown = (birthday) => {
      if (!birthday) return ''
      
      try {
        const today = new Date()
        const birthDate = new Date(birthday)
        
        // 올해 생일 날짜 계산
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
        
        // 만약 올해 생일이 지났다면 내년 생일로 계산
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1)
        }
        
        // 오늘이 생일인지 확인
        const todayStr = today.toDateString()
        const birthdayStr = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()).toDateString()
        
        if (todayStr === birthdayStr) {
          return '🎉 오늘이 생일입니다!'
        }
        
        // 남은 일수 계산
        const timeDiff = thisYearBirthday.getTime() - today.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
        
        if (daysDiff === 1) {
          return '내일이 생일입니다!'
        } else if (daysDiff <= 7) {
          return `생일까지 ${daysDiff}일 남았어요!`
        } else if (daysDiff <= 30) {
          return `생일까지 ${daysDiff}일`
        } else {
          return `생일까지 ${daysDiff}일`
        }
      } catch (error) {
        return ''
      }
    }
    
    // 생일 카운트다운 아이콘
    const getBirthdayCountdownIcon = (birthday) => {
      const countdown = getBirthdayCountdown(birthday)
      if (countdown.includes('오늘이 생일')) return 'mdi-cake-variant'
      if (countdown.includes('내일이 생일')) return 'mdi-gift'
      if (countdown.includes('7일') || countdown.includes('일 남았어요')) return 'mdi-calendar-heart'
      return 'mdi-calendar-clock'
    }
    
    // 생일 카운트다운 색상
    const getBirthdayCountdownColor = (birthday) => {
      const countdown = getBirthdayCountdown(birthday)
      if (countdown.includes('오늘이 생일')) return '#FF6B6B'
      if (countdown.includes('내일이 생일')) return '#FF8E53'
      if (countdown.includes('7일') || countdown.includes('일 남았어요')) return '#4ECDC4'
      return '#95A5A6'
    }
    
    // 달력 관련 함수들 - PetForm과 동일
    const yearRange = computed(() => {
      const years = []
      // 10년 범위 내에서 모든 연도 표시 (예: 2017-2025)
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
    
    const selectDate = (dateObj) => {
      if (!dateObj.isCurrentMonth || dateObj.isDisabled) return
      
      // 수정 모드가 아니면 selectedDate 설정하지 않음
      if (!isEditing.value) {
        console.log('📅 수정 모드가 아니므로 날짜 선택 무시')
        return
      }
      
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const selected = new Date(year, month, dateObj.date)
      
      console.log('📅 날짜 선택 전:', {
        selectedDateBefore: selectedDate.value,
        isEditing: isEditing.value
      })
      
      selectedDate.value = selected
      
      console.log('📅 날짜 선택 후:', {
        selectedDate: selected,
        selectedDateValue: selectedDate.value,
        isEditing: isEditing.value,
        dateObj: dateObj
      })
      
      // 강제로 반응형 업데이트 트리거
      nextTick(() => {
        console.log('📅 nextTick 후:', {
          selectedDate: selectedDate.value,
          isEditing: isEditing.value
        })
        
        // 강제로 DOM 업데이트 트리거
        const actionsDiv = document.querySelector('.date-picker-actions')
        if (actionsDiv) {
          console.log('📅 액션 버튼 div 발견:', actionsDiv)
        } else {
          console.log('📅 액션 버튼 div 없음')
          
          // 강제로 반응형 업데이트 트리거
          selectedDate.value = new Date(selected)
          console.log('📅 강제 재설정 후:', selectedDate.value)
        }
      })
    }
    

    
    const calendarDates = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const firstDayOfWeek = firstDay.getDay()
      const today = new Date()
      
      const dates = []
      
      // 이전 달의 마지막 날들
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month, -i)
        dates.push({
          date: date.getDate(),
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          key: `prev-${date.getDate()}`
        })
      }
      
      // 현재 달의 날들
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        const isToday = date.toDateString() === today.toDateString()
        const isSelected = selectedDate.value && date.toDateString() === selectedDate.value.toDateString()
        const isDisabled = date > today // 오늘 이후 날짜는 비활성화
        
        // 생일 날짜 확인 (editingPet이 있을 때만)
        let isBirthday = false
        if (editingPet.value && editingPet.value.birthday) {
          const birthdayDate = new Date(editingPet.value.birthday)
          isBirthday = date.toDateString() === birthdayDate.toDateString()
        }
        
        dates.push({
          date: day,
          isCurrentMonth: true,
          isToday,
          isSelected,
          isDisabled,
          isBirthday,
          key: `current-${day}`
        })
      }
      
      // 다음 달의 첫 날들 (42개 셀을 채우기 위해)
      const remainingCells = 42 - dates.length
      for (let day = 1; day <= remainingCells; day++) {
        dates.push({
          date: day,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          key: `next-${day}`
        })
      }
      
      return dates
    })
    
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
        '강아지': '#3B82F6',  // 파란색
        '고양이': '#8B5CF6',  // 보라색
        OTHER: '#6B7280'  // 회색
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
      
      // 이전 동물의 미리보기 이미지 초기화
      imagePreviewUrl.value = null
      
      // 달력을 오늘 날짜로 초기화 (상세보기 모드)
      currentDate.value = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
      selectedDate.value = null
      showYearPicker.value = false
      showMonthPicker.value = false
      console.log('📅 상세보기 진입 - 달력을 오늘 날짜로 초기화')
      
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
        
        // 달력을 오늘 날짜로 초기화 (상세보기 모드)
        currentDate.value = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
        selectedDate.value = null
        console.log('📅 모달 닫기 - 달력을 오늘 날짜로 초기화')
        
        // 임시 이미지 URL 정리
        if (selectedPet.value && selectedPet.value.tempImageUrl) {
          delete selectedPet.value.tempImageUrl
        }
        
        // 미리보기 URL 정리
        imagePreviewUrl.value = null
        
        editingPet.value = null
      }
      
      // 모달 닫기 애니메이션을 위해 약간의 지연 후 상태 초기화
      setTimeout(() => {
        selectedPet.value = null
      }, 300) // 300ms 지연 (CSS transition과 동일)
      
      showDetailModal.value = false
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
    
    // 원본 데이터 백업용
    const originalPetData = ref(null)
    
    // 수정 모드 토글
    const toggleEditMode = () => {
      if (isEditing.value) {
        // 수정 모드 취소
        isEditing.value = false
        
        // 달력을 오늘 날짜로 초기화 (상세보기 모드)
        currentDate.value = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
        selectedDate.value = null
        console.log('📅 상세보기 모드 - 달력을 오늘 날짜로 초기화')
        
        // 임시 이미지 URL 정리
        if (selectedPet.value && selectedPet.value.tempImageUrl) {
          delete selectedPet.value.tempImageUrl
        }
        
        // 미리보기 URL 정리
        imagePreviewUrl.value = null
        
        editingPet.value = null
        originalPetData.value = null
      } else {
        // 수정 모드 시작 - DB에 저장된 데이터를 제대로 가져오기
        isEditing.value = true
        
        // selectedPet이 있는지 확인
        if (!selectedPet.value) {
          console.error('❌ 선택된 펫이 없습니다')
          showSnackbar('펫을 선택해주세요.', 'error')
          return
        }
        
        // 달력을 DB에 저장된 생일 날짜로 초기화
        const pet = selectedPet.value
        if (pet.birthday) {
          const birthdayDate = new Date(pet.birthday)
          currentDate.value = birthdayDate
          selectedDate.value = birthdayDate
          console.log('📅 달력을 생일 날짜로 초기화:', birthdayDate)
        } else {
          // 생일이 없으면 현재 날짜로 초기화
          currentDate.value = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
          selectedDate.value = null
          console.log('📅 생일이 없어서 현재 날짜로 초기화')
        }
        
        // 원본 데이터 백업
        originalPetData.value = {
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
        
        // DB에 저장된 실제 데이터를 정확히 매핑
        editingPet.value = { ...originalPetData.value }
        
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
        
        // 크롭 모달 열기
        cropperImageUrl.value = URL.createObjectURL(file)
        showCropper.value = true
        
      } catch (error) {
        console.error('❌ 이미지 변경 실패:', error)
        showSnackbar('이미지 변경에 실패했습니다.', 'error')
      }
      
      // 파일 입력 초기화
      event.target.value = ''
    }
    
    // 이미지 크롭 완료 처리
    const handleCrop = ({ blob, url }) => {
      console.log('🎯 handleCrop 호출됨:', { blob, url })
      
      if (!editingPet.value || !selectedPet.value) {
        console.error('❌ 편집 데이터가 없습니다')
        return
      }
      
      // 크롭된 이미지를 editingPet에 저장
      editingPet.value.imageFile = blob
      editingPet.value.previewImage = url
      
      console.log('✅ 크롭된 이미지 저장됨:', {
        blob: blob,
        blobType: typeof blob,
        blobSize: blob?.size,
        url: url,
        editingPetImageFile: editingPet.value.imageFile
      })
      
      // 즉시 미리보기 반영
      imagePreviewUrl.value = url
      
      showCropper.value = false
      
      // 원본 URL 정리
      if (cropperImageUrl.value) {
        URL.revokeObjectURL(cropperImageUrl.value)
        cropperImageUrl.value = ''
      }
      
      showSnackbar('이미지가 크롭되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.', 'success')
    }
    
    // 변경사항 저장
    const saveChanges = async () => {
      if (!editingPet.value) {
        console.error('❌ 편집 데이터가 없습니다')
        showSnackbar('편집할 데이터가 없습니다.', 'error')
        return
      }
      
      // 필수 필드 검증 (나이는 0도 허용)
      if (!editingPet.value.name || editingPet.value.age === null || editingPet.value.age === undefined || editingPet.value.age === '' || !editingPet.value.gender || !editingPet.value.weight) {
        console.error('❌ 필수 필드가 누락되었습니다:', editingPet.value)
        
        // 구체적인 오류 메시지 제공
        if (!editingPet.value.name) {
          showSnackbar('이름을 입력해주세요.', 'error')
        } else if (editingPet.value.age === null || editingPet.value.age === undefined || editingPet.value.age === '') {
          showSnackbar('나이를 입력해주세요.', 'error')
          // 나이 입력 필드에 포커스
          setTimeout(() => {
            const ageInput = document.querySelector('.info-item .edit-field input[type="number"]')
            if (ageInput) {
              ageInput.focus()
            }
          }, 100)
        } else if (!editingPet.value.gender) {
          showSnackbar('성별을 선택해주세요.', 'error')
        } else if (!editingPet.value.weight) {
          showSnackbar('체중을 입력해주세요.', 'error')
        } else {
          showSnackbar('필수 정보를 모두 입력해주세요.', 'error')
        }
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
        console.log('🔍 저장할 이미지 파일:', {
          imageFile: imageFile,
          imageFileType: typeof imageFile,
          imageFileSize: imageFile?.size,
          imageFileName: imageFile?.name
        })
        
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
          
          // 미리보기 URL을 새로고침된 이미지로 업데이트
          if (refreshedPet.url) {
            imagePreviewUrl.value = refreshedPet.url
          }
        }
        
        // 수정 모드 종료
        isEditing.value = false
        
        // 임시 이미지 URL 정리
        if (selectedPet.value && selectedPet.value.tempImageUrl) {
          delete selectedPet.value.tempImageUrl
        }
        
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
        // 상세보기 모달은 닫지 않음 - 삭제 확인 모달이 위에 표시됨
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
          // 삭제 완료 후 상세보기 모달도 닫기
          closeDetailModal()
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
    

    
    const selectMonth = (month) => {
      // 월을 선택하면 해당 월의 달력으로 이동
      selectedMonth.value = month
      const year = currentDate.value.getFullYear()
      currentDate.value = new Date(year, month - 1, 1)
      showMonthPicker.value = false
      showYearPicker.value = false
    }
    
    const selectYear = (year) => {
      // 연도 선택 즉시 월 선택 화면으로 전환
      currentDate.value = new Date(year, currentDate.value.getMonth(), 1)
      showYearPicker.value = false
      showMonthPicker.value = true
    }
    
    const backToMain = () => {
      showYearPicker.value = false
      showMonthPicker.value = false
      selectedMonth.value = null
    }
    
    const goToYearPicker = () => {
      showMonthPicker.value = false
      showYearPicker.value = true
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
    
    const previousYearRange = () => {
      yearRangeStart.value -= 10
      yearRangeEnd.value -= 10
    }
    
    const nextYearRange = () => {
      yearRangeStart.value += 10
      yearRangeEnd.value += 10
    }
    
    const clearBirthdayFromPicker = () => {
      if (editingPet.value) {
        editingPet.value.birthday = null
        editingPet.value.age = null  // 나이도 초기화
      }
      selectedDate.value = null
      showSnackbar('생일이 초기화되었습니다. 나이를 직접 입력해주세요.', 'warning')
    }
    
    const cancelDateSelection = () => {
      // 원본 데이터로 롤백
      if (originalPetData.value && editingPet.value) {
        editingPet.value.birthday = originalPetData.value.birthday
        editingPet.value.age = originalPetData.value.age
      }
      selectedDate.value = null
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
        
        selectedDate.value = null
        showSnackbar('생일이 선택되었습니다.', 'success')
      }
    }
    

    

    
    // 생일 삭제
    const clearBirthday = () => {
      editingPet.value.birthday = null
      editingPet.value.age = null
      showSnackbar('생일이 삭제되었습니다. 나이를 직접 입력할 수 있습니다.', 'info')
    }
    
    // 오늘 날짜 포맷팅
    const formatTodayDate = () => {
      const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
      return today.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
    
    // 생일까지 남은 일수 계산
    const getDaysUntilBirthday = (birthday) => {
      if (!birthday) return 0
      
      const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
      today.setHours(0, 0, 0, 0)
      
      const birthDate = new Date(birthday)
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      
      // 올해 생일이 이미 지났으면 내년 생일로 계산
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
      }
      
      const diffTime = nextBirthday.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
    }
    
    // 100일 단위 마크 계산
    const getHundredDayMarks = (birthday) => {
      if (!birthday) return []
      
      const daysUntilBirthday = getDaysUntilBirthday(birthday)
      const marks = []
      
      // 100일, 200일, 300일 단위로 마크 추가
      for (let i = 100; i <= daysUntilBirthday; i += 100) {
        marks.push(i)
      }
      
      return marks
    }
    
    // 카드 개수에 따른 그리드 클래스 반환
    const getGridClass = (count) => {
      if (count === 1) return 'grid-single'
      if (count === 2) return 'grid-double'
      if (count === 3) return 'grid-triple'
      return 'grid-multiple'
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
        originalPetData,
        saving,
        showDatePicker,
        // 달력 관련 변수들
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
      getBirthdayCountdown,
      getBirthdayCountdownIcon,
      getBirthdayCountdownColor,
        calculateAge,
      // 달력 관련
      currentDate,
      selectedDate,
      weekdays,
      calendarDates,
      previousMonth,
      nextMonth,
      selectDate,

      getSpeciesIcon,
      getSpeciesIconColor,
      getGenderColor,
      getGenderIcon,
      getGenderLabel,
        getCurrentImageUrl,
        imagePreviewUrl,
        showCropper,
        cropperImageUrl,
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
        handleCrop,
        saveChanges,
        handleDateSelection,
        // 달력 관련 함수들
        yearRange,
        previousYear,
        nextYear,
        selectMonth,
        selectYear,
        backToMain,
        goToYearPicker,
        confirmYearSelection,
        confirmMonthSelection,
        previousYearRange,
        nextYearRange,
        clearBirthdayFromPicker,
        cancelDateSelection,
        confirmDateSelection,
        clearBirthday,
        formatTodayDate,
        getDaysUntilBirthday,
        getHundredDayMarks,
        confirmDeleteFromModal,
              confirmDelete,
      deletePet,
      closeForm,
      handleFormSuccess,
      getGridClass
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
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}

.large-image-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  position: relative;
}

/* 대표동물 설정 버튼 오버레이 */
.representative-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.representative-set-btn {
  background: #FFD700 !important;
  color: #B8860B !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease !important;
}

.representative-set-btn:hover {
  background: #FFED4E !important;
  transform: scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
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

/* 글자가 터지는 문제 해결 */
.pet-tags-large .v-chip {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  gap: 16px;
  margin-top: auto;
  align-items: center;
  justify-content: center;
  width: 100%;
}



/* 공통 액션 버튼 스타일 - PetCard와 동일 */
.action-btn {
  flex: 1;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  height: 40px;
  min-width: 120px;
  text-transform: none;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #E87D7D, #FF6B6B) !important;
  color: white !important;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

/* 카드 개수에 따른 일관된 레이아웃 */
.other-pets-grid.grid-single {
  grid-template-columns: 1fr;
  max-width: 400px;
}

.other-pets-grid.grid-double {
  grid-template-columns: repeat(2, 1fr);
  max-width: 800px;
}

.other-pets-grid.grid-triple {
  grid-template-columns: repeat(3, 1fr);
  max-width: 1200px;
}

.other-pets-grid.grid-multiple {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  max-width: 1200px;
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
    gap: 16px;
  }
  
  .other-pets-grid.grid-single {
    max-width: 350px;
  }
  
  .other-pets-grid.grid-double {
    max-width: 700px;
  }
  
  .other-pets-grid.grid-triple {
    grid-template-columns: repeat(2, 1fr);
    max-width: 700px;
  }
  
  .other-pets-grid.grid-multiple {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    max-width: 1000px;
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
  
  .other-pets-grid.grid-single,
  .other-pets-grid.grid-double,
  .other-pets-grid.grid-triple,
  .other-pets-grid.grid-multiple {
    grid-template-columns: 1fr;
    max-width: 100%;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  flex: 1;
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
  -webkit-appearance: none !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-track,
.form-content::-webkit-scrollbar-track,
.pet-form-card .form-content::-webkit-scrollbar-track {
  background: #f8f9fa !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
  -webkit-appearance: none !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-thumb,
.form-content::-webkit-scrollbar-thumb,
.pet-form-card .form-content::-webkit-scrollbar-thumb {
  background: #E87D7D !important;
  border-radius: 6px !important;
  border: 1px solid #f8f9fa !important;
  -webkit-appearance: none !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-thumb:hover,
.form-content::-webkit-scrollbar-thumb:hover,
.pet-form-card .form-content::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B !important;
  -webkit-appearance: none !important;
}

.pet-form-dialog .form-content::-webkit-scrollbar-corner,
.form-content::-webkit-scrollbar-corner,
.pet-form-card .form-content::-webkit-scrollbar-corner {
  background: #f8f9fa !important;
  -webkit-appearance: none !important;
}

/* 사파리 전용 등록 폼 스크롤바 스타일 */
@supports (-webkit-appearance: none) {
  .pet-form-dialog .form-content::-webkit-scrollbar,
  .form-content::-webkit-scrollbar,
  .pet-form-card .form-content::-webkit-scrollbar {
    width: 10px !important;
    height: 10px !important;
    -webkit-appearance: none !important;
  }
  
  .pet-form-dialog .form-content::-webkit-scrollbar-track,
  .form-content::-webkit-scrollbar-track,
  .pet-form-card .form-content::-webkit-scrollbar-track {
    background: #f8f9fa !important;
    border-radius: 6px !important;
    margin: 2px 0 !important;
    -webkit-appearance: none !important;
  }
  
  .pet-form-dialog .form-content::-webkit-scrollbar-thumb,
  .form-content::-webkit-scrollbar-thumb,
  .pet-form-card .form-content::-webkit-scrollbar-thumb {
    background: #E87D7D !important;
    border-radius: 6px !important;
    border: 1px solid #f8f9fa !important;
    -webkit-appearance: none !important;
  }
  
  .pet-form-dialog .form-content::-webkit-scrollbar-thumb:hover,
  .form-content::-webkit-scrollbar-thumb:hover,
  .pet-form-card .form-content::-webkit-scrollbar-thumb:hover {
    background: #FF6B6B !important;
    -webkit-appearance: none !important;
  }
}

/* Firefox 스크롤바 */
.pet-form-dialog .form-content,
.form-content,
.pet-form-card .form-content {
  scrollbar-width: thin !important;
  scrollbar-color: #E87D7D #f8f9fa !important;
}

/* 삭제 확인 모달 - PetForm 스타일 적용 */
.delete-dialog {
  z-index: 3000 !important;
}

.delete-dialog .v-overlay__content {
  z-index: 3000 !important;
}

.delete-dialog .v-overlay__content {
  width: 600px !important;
  max-width: 600px !important;
}

.delete-modal-card {
  width: 600px !important;
  min-width: 600px !important;
  max-width: 600px !important;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.delete-header {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.delete-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delete-title-section .text-h5 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.delete-content {
  padding: 48px 60px;
  text-align: center;
  background: white;
}

.delete-icon-container {
  margin-bottom: 32px;
}

.delete-icon-circle {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(244, 67, 54, 0.3);
  overflow: hidden;
}

.delete-pet-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.delete-message-section {
  margin-bottom: 32px;
}

.delete-pet-name {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  margin-top: 0;
}

.delete-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 24px;
}

.delete-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff3e0;
  color: #e65100;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid #ffcc02;
  font-size: 14px;
  font-weight: 600;
  max-width: 300px;
  margin: 0 auto;
}

.warning-icon {
  flex-shrink: 0;
}

.delete-actions {
  padding: 24px 32px 32px;
  display: flex;
  gap: 16px;
  justify-content: center;
  background: #f8f9fa;
}

.cancel-btn {
  min-width: 120px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.delete-btn {
  min-width: 120px;
  font-weight: 600;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .delete-modal-card {
    margin: 16px;
    border-radius: 16px;
  }
  
  .delete-header {
    padding: 20px 24px;
  }
  
  .delete-title-section .text-h5 {
    font-size: 20px;
  }
  
  .delete-content {
    padding: 32px 24px;
  }
  
  .delete-pet-name {
    font-size: 24px;
  }
  
  .delete-actions {
    padding: 20px 24px 24px;
    flex-direction: column;
  }
  
  .cancel-btn,
  .delete-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .delete-modal-card {
    margin: 8px;
    border-radius: 12px;
  }
  
  .delete-header {
    padding: 16px 20px;
  }
  
  .delete-content {
    padding: 24px 20px;
  }
  
  .delete-icon-circle {
    width: 80px;
    height: 80px;
  }
  
  .delete-pet-name {
    font-size: 20px;
  }
}

/* 반려동물 상세 모달 */
.pet-detail-dialog {
  z-index: 1000;
}

.pet-detail-dialog .v-dialog {
  max-height: 90vh;
  margin: 20px;
  transition: all 0.3s ease-in-out; /* 모달 닫기 애니메이션 개선 */
}

.pet-detail-card {
  border-radius: 20px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out; /* 카드 닫기 애니메이션 개선 */
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

.detail-title .text-h5 {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}



.close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: all 0.3s ease !important;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.close-btn:active {
  transform: scale(0.95) !important;
}

.detail-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.detail-layout {
  display: flex;
  gap: 24px;
  align-items: stretch; /* flex-start에서 stretch로 변경하여 높이 맞춤 */
  margin-bottom: 24px;
}

.pet-image-detail {
  flex-shrink: 0;
  width: 350px; /* 280px에서 350px로 증가 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* center에서 flex-start로 변경 */
  align-items: center;
  min-height: 500px; /* 기본정보 영역과 높이 맞춤 */
  user-select: none; /* 텍스트 선택 비활성화 */
  -webkit-user-select: none; /* Safari에서 텍스트 선택 비활성화 */
  -moz-user-select: none; /* Firefox에서 텍스트 선택 비활성화 */
  -ms-user-select: none; /* IE/Edge에서 텍스트 선택 비활성화 */
}

/* 생일 카운트다운 섹션 */
.birthday-countdown-section {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.birthday-countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 200px;
}

.countdown-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* 생일 필드 스타일 */
.birthday-field-section {
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0; /* 패딩 제거하여 달력과 정확히 맞춤 */
}

.birthday-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
  box-sizing: border-box; /* 패딩을 포함한 전체 너비 계산 */
  max-width: none; /* 200px 제한 제거 */
  transition: all 0.2s ease;
  position: relative;
}



.birthday-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.birthday-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: center;
}



/* 달력 스타일 - PetForm과 완전히 동일 */
.calendar-section {
  margin-top: 16px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  max-height: 500px; /* 400px에서 500px로 증가 */
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
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.year-range:hover {
  background: #ffe6e6 !important;
  color: #d32f2f;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4열로 복원 */
  gap: 8px;
  margin-bottom: 20px;
}

.year-cell {
  padding: 16px 12px; /* 12px 8px에서 16px 12px로 증가 */
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  border: 1px solid transparent;
  font-size: 16px; /* 폰트 크기 추가 */
}

.year-cell:hover {
  background: #ffe6e6 !important;
  color: #d32f2f;
  border-color: #f44336;
}

.year-cell.selected {
  background: #ffe6e6 !important;
  color: #d32f2f !important;
  border-color: #f44336;
  font-weight: 600;
}

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

.current-year {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.clickable-year {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clickable-year:hover {
  background: #ffe6e6 !important;
  color: #d32f2f;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.month-cell {
  padding: 16px 8px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  border: 1px solid transparent;
}

.month-cell:hover {
  background: #ffe6e6 !important;
  color: #d32f2f;
  border-color: #f44336;
}

.month-cell.selected {
  background: #ffe6e6 !important;
  color: #d32f2f !important;
  border-color: #f44336;
  font-weight: 600;
}

.date-picker-actions {
  padding: 16px 20px;
  background: white !important;
  border-top: 1px solid #e0e0e0;
  display: flex !important;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  position: relative;
  min-height: 60px;
  z-index: 10;
}

.reset-link {
  color: #E87D7D;
  cursor: pointer;
  font-weight: 600; /* 500에서 600으로 증가 */
  font-size: 14px; /* 12px에서 14px로 증가 */
  text-decoration: none;
  transition: color 0.2s ease;
  position: absolute;
  left: 20px;
  padding: 4px 8px;
}

.reset-link:hover {
  color: #d32f2f;
  text-decoration: underline;
}

.cancel-btn {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  color: #666 !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-weight: 500 !important;
  font-size: 14px !important; /* 13px에서 14px로 증가 */
  box-shadow: none !important;
  min-width: 60px !important;
}

.cancel-btn:hover {
  background: #f5f5f5 !important;
  border-color: #ccc !important;
}

.confirm-btn {
  background: #E87D7D !important;
  color: white !important;
  border-radius: 6px !important;
  padding: 6px 16px !important;
  font-weight: 500 !important;
  font-size: 14px !important; /* 13px에서 14px로 증가 */
  box-shadow: none !important;
  min-width: 70px !important;
}

.confirm-btn:hover {
  background: #d32f2f !important;
}

.date-picker-main {
  padding: 20px; /* 16px에서 20px로 증가 */
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.date-picker-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.nav-btn {
  color: #666 !important;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: #E87D7D !important;
  background: rgba(232, 125, 125, 0.1) !important;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 13px; /* 12px에서 13px로 증가 */
  font-weight: 600;
  color: #666;
  padding: 8px 2px; /* 6px에서 8px로 증가 */
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px; /* 12px에서 13px로 증가 */
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid transparent;
  background: white;
  min-height: 32px; /* 28px에서 32px로 증가 */
}

.calendar-day:not(.other-month) {
  cursor: pointer;
}

.calendar-day:hover {
  background: #ffe6e6 !important;
  border-color: #f44336;
  color: #d32f2f;
  transform: scale(1.05);
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.today {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
  font-weight: 600;
}

.calendar-day.birthday {
  background: #fff3e0;
  border-color: #ff9800;
  color: #f57c00;
  font-weight: 600;
}

.calendar-day.birthday::after {
  content: '🎂';
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
}

.calendar-day.today.birthday {
  background: linear-gradient(135deg, #e3f2fd, #fff3e0);
  border-color: #2196f3;
  color: #1976d2;
}

.calendar-day.selected {
  background: #ffe6e6 !important;
  color: #d32f2f !important;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
  border-color: #f44336;
  font-weight: 600;
}

.calendar-day.disabled {
  color: #ccc !important;
  background: #f5f5f5 !important;
  cursor: not-allowed !important;
  opacity: 0.5;
}

.calendar-day.disabled:hover {
  background: #f5f5f5 !important;
  color: #ccc !important;
  transform: none !important;
  border-color: transparent !important;
}

.pet-details-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 500px; /* 달력 높이와 맞춤 */
}

.detail-pet-image {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  user-select: none; /* 이미지 선택 비활성화 */
  -webkit-user-select: none; /* Safari에서 이미지 선택 비활성화 */
  -moz-user-select: none; /* Firefox에서 이미지 선택 비활성화 */
  -ms-user-select: none; /* IE/Edge에서 이미지 선택 비활성화 */
  pointer-events: none; /* 클릭 이벤트 비활성화 */
  transition: opacity 0.3s ease-in-out; /* 이미지 페이드 아웃 애니메이션 */
}

.detail-image-placeholder {
  width: 220px;
  height: 220px;
  border-radius: 50%;
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
  padding: 28px; /* 24px에서 28px로 증가 */
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  flex: 1; /* 남은 공간을 모두 차지 */
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
  grid-template-columns: repeat(2, 1fr); /* 2열 균등 분할 */
  gap: 16px;
  align-items: start;
  max-width: 500px;
  margin: 0 auto;
}

/* 종류는 첫 줄 전체 너비 */
.info-grid .species-item { 
  grid-column: 1 / -1; 
  margin-bottom: 8px;
}

/* 반응형 - 모바일에서는 1열로 */
@media (max-width: 768px) {
  .info-grid { 
    grid-template-columns: 1fr; 
    gap: 16px;
  }
  .info-grid .species-item { 
    grid-column: 1 / 1; 
    margin-bottom: 8px;
  }
}

/* 나머지 항목들은 2열로 정렬 */
.info-grid .info-item:not(.species-item) {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 200px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  text-align: center;
  min-width: 200px;
}

/* 종류 항목은 특별한 레이아웃 */
.species-item {
  background: linear-gradient(135deg, #fef7f7, #fef2f2) !important;
  border-color: #E87D7D !important;
  padding: 20px 80px 20px 20px !important;
  text-align: center;
}

.species-item .info-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex: 1;
  text-align: center;
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
  flex: 1; /* 남은 공간을 모두 차지 */
}

.introduction-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
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
  padding: 20px;
}

/* 이미지 변경 오버레이 */
.image-container {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease-in-out; /* 이미지 컨테이너 애니메이션 */
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
  border-radius: 50%;
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

/* 생일 정보 (사진 아래) */
.birthday-info {
  margin-top: 20px;
  width: 100%;
}

.birthday-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  min-width: 320px;
}

.birthday-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #E87D7D;
}

/* 생일 카운트다운 */
.birthday-countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.countdown-text {
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}



/* 편집 필드 스타일 - 등록 모달과 동일한 디자인 */
.edit-field {
  flex: 1;
  min-width: 120px;
  position: relative;
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

/* 현대적인 입력 필드 스타일 - 2번째 사진처럼 깔끔하게 */
.modern-input :deep(.v-field) {
  background: #ffffff !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  border: 2px solid #e5e7eb !important;
  transition: all 0.2s ease !important;
}

.modern-input :deep(.v-field--focused) {
  background: #ffffff !important;
  border-color: #E87D7D !important;
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.1) !important;
}

.modern-input :deep(.v-field:hover) {
  background: #ffffff !important;
  border-color: #d1d5db !important;
}

.modern-input :deep(.v-field__input) {
  padding: 8px 12px !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: #111827 !important;
  font-weight: 500 !important;
}

.modern-input :deep(.v-field__input::placeholder) {
  color: #9ca3af !important;
  opacity: 1 !important;
  font-weight: 400 !important;
}

.modern-input :deep(.v-field__prepend-inner) {
  padding-right: 8px !important;
  color: #6b7280 !important;
}

.modern-input :deep(.v-field--focused .v-field__prepend-inner) {
  color: #E87D7D !important;
}

.modern-input :deep(.v-field--disabled) {
  background: #f9fafb !important;
  border-color: #e5e7eb !important;
  opacity: 0.6 !important;
}

.modern-input :deep(.v-field--disabled .v-field__input) {
  color: #9ca3af !important;
}

/* 액션 버튼 크기 통일 */
.action-btn {
  min-width: 100px !important;
  height: 40px !important;
}

/* 입력 필드 높이 조정 */
.modern-input :deep(.v-field) {
  min-height: 44px !important;
}

/* 컴팩트한 기본정보 영역 */
.compact-info-grid {
  gap: 12px !important;
  max-width: 400px !important;
}

/* 1열 레이아웃 */
.compact-info-grid.single-column {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  max-width: none !important;
}

.compact-info-item {
  padding: 8px 0 !important;
}

/* PetForm 스타일 적용 */
.form-fields-section {
  display: flex;
  flex-direction: column;
  gap: 28px; /* 24px에서 28px로 증가 */
  padding: 0 0 28px; /* 24px에서 28px로 증가 */
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 8px에서 10px로 증가 */
}

.field-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.compact-form-field {
  margin-bottom: 16px;
}

.compact-label {
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
}

.compact-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 1열 레이아웃에서 각 항목 스타일 */
.compact-info-grid.single-column .compact-info-item {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 12px 16px !important;
  background: #f8fafc !important;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  margin-bottom: 4px !important;
}

.compact-info-grid.single-column .compact-info-item .info-label {
  min-width: 60px !important;
  font-weight: 500 !important;
  color: #374151 !important;
}

.compact-info-grid.single-column .compact-info-item .info-value {
  flex: 1 !important;
  font-weight: 500 !important;
  color: #111827 !important;
}

.compact-info-grid.single-column .compact-info-item .edit-field {
  flex: 1 !important;
  margin: 0 !important;
}

.compact-label {
  font-size: 13px !important;
  margin-bottom: 4px !important;
}

.compact-value {
  font-size: 14px !important;
}

.compact-edit-field {
  margin-top: 4px !important;
}

/* 입력 필드 너비 제한 (소개글 제외) */
.compact-edit-field .modern-input:not(.modern-textarea) {
  max-width: 350px !important;
}

/* 컴팩트한 소개글 영역 */
.compact-introduction {
  margin-top: 16px !important;
}

.compact-title {
  font-size: 16px !important;
  margin-bottom: 8px !important;
}

.compact-content {
  margin-top: 8px !important;
}

.compact-text {
  font-size: 14px !important;
  line-height: 1.4 !important;
}

/* 현대적인 날짜 입력 필드 - v-text-field로 통일 */

.rounded-input {
  border-radius: 8px !important;
}

.rounded-input .v-field {
  border-radius: 8px !important;
}

/* 날짜 선택 버튼 - v-text-field로 통일되어 더 이상 사용하지 않음 */

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

.clickable-year {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clickable-year:hover {
  background: #ffe6e6 !important;
  color: #d32f2f;
  transform: scale(1.05);
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
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
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

.year-range:hover {
  background: #ffe6e6;
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
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  position: relative;
}

.right-buttons {
  display: flex;
  gap: 12px;
}

.date-picker-actions .clear-btn {
  color: #E87D7D !important;
  font-weight: 600;
  background: transparent !important;
  box-shadow: none !important;
  padding: 8px 12px;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.cancel-btn {
  border: 2px solid #e0e0e0 !important;
  color: #666 !important;
  background: white !important;
  border-radius: 50px !important;
  font-weight: 500;
  padding: 8px 24px;
  min-width: 80px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.confirm-btn {
  background: #E87D7D !important;
  color: white;
  border-radius: 50px !important; /* 알약 모양 */
  box-shadow: none !important;
  font-weight: 600;
  padding: 10px 22px;
  min-width: 90px;
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
  -webkit-appearance: none;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
  -webkit-appearance: none;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #E87D7D;
  border-radius: 4px;
  -webkit-appearance: none;
  border: 1px solid #f1f5f9;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #FF6B6B;
  -webkit-appearance: none;
}

/* 사파리 전용 스크롤바 스타일 */
@supports (-webkit-appearance: none) {
  .detail-content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    -webkit-appearance: none;
  }
  
  .detail-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
    -webkit-appearance: none;
  }
  
  .detail-content::-webkit-scrollbar-thumb {
    background: #E87D7D;
    border-radius: 4px;
    -webkit-appearance: none;
    border: 1px solid #f1f5f9;
  }
  
  .detail-content::-webkit-scrollbar-thumb:hover {
    background: #FF6B6B;
    -webkit-appearance: none;
  }
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

/* 생일 입력 컨테이너 */
.birthday-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.birthday-input-container .date-btn {
  flex: 1;
}

/* clear-birthday-btn 스타일 제거됨 - X 버튼 제거로 인해 불필요 */

/* 액션 버튼 오른쪽 정렬 및 크기 조정 */
.v-card-actions {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 8px !important;
  padding: 16px !important;
}

.edit-btn, .delete-btn, .cancel-btn, .save-btn {
  min-width: 70px !important;
  height: 32px !important;
  font-size: 0.8rem !important;
  padding: 0 12px !important;
  flex-shrink: 0 !important;
}

/* Vuetify 기본 스타일 강제 덮어쓰기 */
.v-card-actions .v-btn {
  min-width: 70px !important;
  height: 32px !important;
  font-size: 0.8rem !important;
  padding: 0 12px !important;
}

/* 모든 액션 버튼 강제 덮어쓰기 */
.v-card-actions .edit-btn,
.v-card-actions .delete-btn,
.v-card-actions .cancel-btn,
.v-card-actions .save-btn {
  min-width: 80px !important;
  height: 36px !important;
  font-size: 0.85rem !important;
  padding: 0 16px !important;
  width: auto !important;
  max-width: 80px !important;
}

/* 대표 반려동물 버튼 강제 덮어쓰기 */
.action-buttons-large .action-btn {
  min-width: 80px !important;
  height: 36px !important;
  font-size: 0.85rem !important;
  padding: 0 16px !important;
  width: auto !important;
  max-width: 80px !important;
}

/* Vuetify 기본 스타일 완전 덮어쓰기 */
.action-buttons-large .v-btn {
  min-width: 80px !important;
  height: 36px !important;
  font-size: 0.85rem !important;
  padding: 0 16px !important;
  width: auto !important;
  max-width: 80px !important;
}

/* 대표 반려동물 버튼들을 오른쪽에 정렬 */
.action-buttons-large {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 8px !important;
  margin-left: auto !important;
  width: 100% !important;
}

/* 추가로 버튼들을 오른쪽으로 밀어내기 */
.action-buttons-large .action-btn:first-child {
  margin-left: auto !important;
}
</style>

