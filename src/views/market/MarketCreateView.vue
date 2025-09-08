<template>
  <div class="market-create-page">
    <!-- 메인 컨테이너 -->
    <v-container class="create-container">
      <!-- 폼 컨테이너 -->
      <!-- 목록으로 버튼 -->
      <div class="back-btn-wrapper">
        <button @click="$router.push('/market')" class="back-btn">
          <v-icon icon="mdi-arrow-left" size="20" />
          목록으로
        </button>
      </div>

      <div class="form-container">
        <v-form ref="formRef" v-model="valid" @submit.prevent="submitForm">
          <!-- 상품 이미지 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">상품 이미지</h3>
            </div>

            <div class="image-upload-section">
              <!-- 메인 업로드 영역 -->
              <div
                class="main-upload-area"
                :class="{ 'has-images': imageUrls.length > 0 }"
              >
                <!-- 파일 입력 -->
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept="image/*"
                  class="hidden-file-input"
                  @change="handleImageChange"
                />

                <!-- 이미지가 없을 때 업로드 안내 -->
                <div
                  v-if="imageUrls.length === 0"
                  class="upload-content"
                  @click="triggerFileInput"
                >
                  <div class="upload-icon">
                    <v-icon icon="mdi-cloud-upload" size="48" color="white" />
                  </div>
                  <h4 class="upload-title">사진을 업로드하세요</h4>
                  <p class="upload-subtitle">최대 10장까지 등록 가능합니다</p>
                  <div class="upload-hint">
                    <v-icon icon="mdi-information" size="16" color="#7f8c8d" />
                    <span>클릭하여 이미지 선택</span>
                  </div>
                </div>

                <!-- 이미지가 있을 때 슬라이더 -->
                <div v-else class="image-slider-container">
                  <!-- 이미지 슬라이더 -->
                  <div class="image-slider">
                    <div
                      v-for="(url, index) in imageUrls"
                      :key="index"
                      class="slide"
                      :class="{ active: index === currentSlide }"
                      :style="{
                        transform: `translateX(${(index - currentSlide) * 100}%)`,
                      }"
                    >
                      <img :src="url" class="slide-image" alt="상품 이미지" />

                      <!-- 대표 이미지 표시 -->
                      <div
                        class="main-image-checkbox"
                        @click.stop="setMainImage(index)"
                      >
                        <div
                          class="checkbox"
                          :class="{ checked: index === mainImageIndex }"
                        >
                          <span
                            v-if="index === mainImageIndex"
                            class="check-mark"
                            >✓</span
                          >
                        </div>
                      </div>

                      <!-- 이미지 제거 버튼 -->
                      <button
                        @click.stop="removeImage(index)"
                        class="remove-image-btn"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <!-- 네비게이션 버튼 -->
                  <div class="slider-nav">
                    <button
                      @click="previousSlide"
                      :disabled="currentSlide === 0"
                      class="nav-btn prev-btn"
                    >
                      <v-icon icon="mdi-chevron-left" size="24" />
                    </button>

                    <div class="slide-indicators">
                      <div
                        v-for="(url, index) in imageUrls"
                        :key="index"
                        class="indicator"
                        :class="{ active: index === currentSlide }"
                        @click="goToSlide(index)"
                      ></div>
                    </div>

                    <button
                      @click="nextSlide"
                      :disabled="currentSlide === imageUrls.length - 1"
                      class="nav-btn next-btn"
                    >
                      <v-icon icon="mdi-chevron-right" size="24" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 기본 정보 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">기본 정보</h3>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">상품명 *</label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="상품명을 입력해주세요"
                  class="form-input"
                  required
                  @input="handleTitleInput"
                  @change="handleTitleChange"
                />
              </div>

              <div class="form-field">
                <label class="field-label">카테고리 *</label>
                <select
                  v-model="form.category"
                  class="form-select"
                  required
                  @change="handleCategoryChange"
                >
                  <!-- <option value="" disabled>카테고리를 선택해주세요</option> -->
                  <option
                    v-for="category in categoryOptions"
                    :key="category.value"
                    :value="category.value"
                  >
                    {{ category.label }}
                  </option>
                </select>

                <!-- 카테고리가 선택된 경우 -->
                <div
                  v-if="
                    form.category &&
                    form.category !== null &&
                    form.category !== ''
                  "
                  class="category-selected"
                >
                  <div class="selected-category-content">
                    <v-icon icon="mdi-check-circle" size="20" color="#E87D7D" />
                    <span class="selected-text"
                      >선택된 카테고리:
                      <strong>{{
                        categoryOptions.find((c) => c.value === form.category)
                          ?.label
                      }}</strong></span
                    >
                    <span class="debug-info">({{ form.category }})</span>
                  </div>
                </div>

                <!-- 카테고리가 선택되지 않은 경우 -->
                <div
                  v-if="
                    !form.category ||
                    form.category === null ||
                    form.category === ''
                  "
                  class="category-hint"
                >
                  <v-icon icon="mdi-information" size="16" color="#6c757d" />
                  <span>카테고리를 선택해주세요</span>
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">가격 *</label>
                <div class="price-input-container">
                  <input
                    v-model="form.price"
                    type="number"
                    placeholder="가격을 입력해주세요"
                    class="form-input price-input"
                    required
                    min="0"
                    step="1"
                    @input="handlePriceInput"
                    @change="handlePriceChange"
                  />
                  <span class="price-unit">원</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 상세 설명 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">상세 설명</h3>
            </div>

            <div class="description-section">
              <textarea
                v-model="form.description"
                placeholder="상품의 상태, 특징, 거래 조건 등을 자세히 설명해주세요..."
                class="form-textarea"
                rows="6"
                required
                @input="handleDescriptionInput"
                @change="handleDescriptionChange"
              ></textarea>

              <div class="description-hint">
                <v-icon icon="mdi-lightbulb" size="16" color="#E87D7D" />
                <span
                  >구체적이고 정확한 정보를 제공하면 더 빠른 거래가
                  가능합니다</span
                >
              </div>
            </div>
          </div>

          <!-- 지역 정보 섹션 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">거래 지역</h3>
            </div>

            <div class="region-section">
              <!-- 지도 기반 위치 선택 -->
              <div class="map-selection-section">
                <div class="map-header">
                  <div class="map-icon">
                    <v-icon
                      icon="mdi-map-marker-radius"
                      size="28"
                      color="#E87D7D"
                    />
                  </div>
                  <div class="map-title-content">
                    <h4 class="section-subtitle">지도에서 거래 장소 선택</h4>
                    <p class="map-description">
                      지도를 클릭하거나 핀을 드래그하여 정확한 거래 장소를
                      지정하세요
                    </p>
                  </div>
                </div>

                <div class="map-container">
                  <div class="map-wrapper">
                    <div id="location-map" class="location-map"></div>
                    <div v-if="!mapLoaded" class="map-overlay">
                      <div class="map-status">
                        <v-icon
                          icon="mdi-crosshairs-gps"
                          size="16"
                          color="#E87D7D"
                        />
                        <span
                          >지도를 클릭하거나 핀을 드래그하여 위치를
                          설정하세요</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="map-controls">
                    <button
                      type="button"
                      @click="moveToCurrentLocation"
                      class="map-btn primary-btn"
                    >
                      <v-icon icon="mdi-crosshairs-gps" size="18" />
                      내 위치로
                    </button>
                    <button
                      @click="resetMapLocation"
                      class="map-btn secondary-btn"
                    >
                      <v-icon icon="mdi-refresh" size="18" />
                      위치 초기화
                    </button>
                  </div>
                </div>

                <!-- 선택된 위치 정보 -->
                <div v-if="selectedLocation" class="location-info">
                  <div class="info-header">
                    <div class="info-icon">
                      <v-icon
                        icon="mdi-map-marker-check"
                        size="20"
                        color="white"
                      />
                    </div>
                    <span>선택된 거래 장소</span>
                  </div>
                  <div class="info-content">
                    <div class="address-display">
                      <v-icon icon="mdi-map-marker" size="16" color="#E87D7D" />
                      <p class="address-text">{{ selectedLocation.address }}</p>
                    </div>
                    <div class="coordinate-display">
                      <v-icon
                        icon="mdi-crosshairs-gps"
                        size="16"
                        color="#7f8c8d"
                      />
                      <p class="coordinate-text">
                        위도: {{ selectedLocation.lat.toFixed(6) }}, 경도:
                        {{ selectedLocation.lng.toFixed(6) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="map-hint">
                  <div class="hint-icon">
                    <v-icon icon="mdi-lightbulb-on" size="18" color="#E87D7D" />
                  </div>
                  <div class="hint-content">
                    <span class="hint-title">사용 팁</span>
                    <span class="hint-text"
                      >지도에서 핀을 드래그하여 정확한 위치를 조정할 수
                      있습니다. 클릭으로도 위치를 변경할 수 있어요!</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="action-section">
            <button
              type="button"
              @click="$router.push('/market')"
              class="cancel-btn"
            >
              <v-icon icon="mdi-close" size="18" />
              취소
            </button>

            <button
              type="submit"
              :disabled="!valid || loading"
              class="submit-btn"
            >
              <v-icon v-if="!loading" icon="mdi-check" size="18" />
              <div v-else class="loading-spinner-small"></div>
              {{ loading ? "등록 중..." : "등록하기" }}
            </button>
          </div>
        </v-form>
      </div>
    </v-container>

    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
      class="custom-snackbar"
    >
      <div class="snackbar-content">
        <v-icon :icon="snackbar.icon" size="20" class="snackbar-icon" />
        <span class="snackbar-message">{{ snackbar.message }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { marketAPI } from "@/services/api";

export default {
  name: "MarketCreateView",
  setup() {
    const router = useRouter();

    const form = reactive({
      title: "",
      category: null, // null로 초기화하여 명확하게 구분
      price: null,
      description: "",
    });

    // 폼 초기화 후 상태 확인
    console.log("폼 초기 상태:", {
      title: form.title,
      category: form.category,
      price: form.price,
      description: form.description,
    });

    // 폼 데이터 변경 감지를 위한 watcher 추가
    const logFormChanges = () => {
      console.log("=== 폼 데이터 변경 감지 ===");
      console.log("form.title:", `"${form.title}"`);
      console.log("form.category:", form.category);
      console.log("form.price:", form.price);
      console.log("form.description:", `"${form.description}"`);
      console.log("========================");
    };

    // 가격 입력 처리 함수
    const handlePriceInput = (event) => {
      const value = event.target.value;
      console.log("가격 입력 이벤트:", value, "타입:", typeof value);

      // 빈 문자열이면 null로 설정
      if (value === "" || value === null || value === undefined) {
        form.price = null;
      } else {
        // 숫자로 변환
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
          form.price = numValue;
        } else {
          form.price = null;
        }
      }

      console.log("가격 처리 후:", form.price);
      validateForm();
    };

    const handlePriceChange = (event) => {
      const value = event.target.value;
      console.log("가격 변경 이벤트:", value, "타입:", typeof value);

      // 최종 값 검증 및 설정
      if (value === "" || value === null || value === undefined) {
        form.price = null;
      } else {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
          form.price = numValue;
        } else {
          form.price = null;
        }
      }

      console.log("가격 최종 설정:", form.price);
      logFormChanges();
      validateForm();
    };

    // 제목 입력 처리 함수
    const handleTitleInput = (event) => {
      const value = event.target.value;
      console.log("제목 입력 이벤트:", value, "타입:", typeof value);

      // 값 설정
      form.title = value;

      console.log("제목 처리 후:", form.title);
      validateForm();
    };

    const handleTitleChange = (event) => {
      const value = event.target.value;
      console.log("제목 변경 이벤트:", value, "타입:", typeof value);

      // 최종 값 설정
      form.title = value;

      console.log("제목 최종 설정:", form.title);
      logFormChanges();
      validateForm();
    };

    // 설명 입력 처리 함수
    const handleDescriptionInput = (event) => {
      const value = event.target.value;
      console.log("설명 입력 이벤트:", value, "타입:", typeof value);

      // 값 설정
      form.description = value;

      console.log("설명 처리 후:", form.description);
      validateForm();
    };

    const handleDescriptionChange = (event) => {
      const value = event.target.value;
      console.log("설명 변경 이벤트:", value, "타입:", typeof value);

      // 최종 값 설정
      form.description = value;

      console.log("설명 최종 설정:", form.description);
      logFormChanges();
      validateForm();
    };

    // 폼 validation 함수
    const validateForm = () => {
      // 문자열 필드는 공백 제거 후 검사
      const hasTitle = form.title && form.title.trim().length > 0;
      const hasCategory = !!form.category;
      // 가격은 0보다 큰 숫자인지 확인
      const hasPrice =
        form.price !== null && form.price !== undefined && form.price > 0;
      const hasDescription =
        form.description && form.description.trim().length > 0;
      const hasLocation = !!selectedLocation.value;

      console.log("=== 폼 유효성 검사 ===");
      console.log("제목:", `"${form.title}"`, "→", hasTitle);
      console.log("카테고리:", form.category, "→", hasCategory);
      console.log("가격:", form.price, "→", hasPrice);
      console.log("설명:", `"${form.description}"`, "→", hasDescription);
      console.log("위치:", selectedLocation.value, "→", hasLocation);

      valid.value =
        hasTitle && hasCategory && hasPrice && hasDescription && hasLocation;

      console.log("최종 유효성:", valid.value);
      console.log("========================");
    };

    const formRef = ref(null);
    const valid = ref(false);
    const loading = ref(false);
    const images = ref([]);
    const imageUrls = ref([]);
    const mainImageIndex = ref(0);
    const currentSlide = ref(0);

    // 지도 관련 상태
    const map = ref(null);
    const marker = ref(null);
    const selectedLocation = ref(null);
    const mapLoaded = ref(false);

    // 스낵바 상태
    const snackbar = reactive({
      show: false,
      message: "",
      color: "success",
      icon: "mdi-check-circle",
    });

    // 카테고리 옵션
    const categoryOptions = ref([
      { label: "장난감", value: "TOY" },
      { label: "사료", value: "FEED" },
      { label: "의류", value: "CLOTH" },
      { label: "기타", value: "OTHER" },
    ]);

    // 카테고리 선택
    const selectCategory = (category) => {
      try {
        console.log("=== 카테고리 선택 시작 ===");
        console.log("선택할 카테고리:", category);
        console.log("선택 전 form.category:", form.category);

        // 유효한 카테고리인지 확인
        const validCategory = categoryOptions.value.find(
          (c) => c.value === category
        );
        if (!validCategory) {
          console.error("유효하지 않은 카테고리:", category);
          return;
        }

        // 카테고리 값 설정 (간단하게)
        form.category = category;

        console.log("선택 후 form.category:", form.category);

        // 스낵바 테스트
        snackbar.message = `카테고리 "${validCategory.label}"가 선택되었습니다!`;
        snackbar.color = "success";
        snackbar.icon = "mdi-check-circle";
        snackbar.show = true;

        // 폼 유효성 검사
        validateForm();
      } catch (error) {
        console.error("카테고리 선택 중 오류 발생:", error);
      }
    };

    // 카테고리 변경 처리
    const handleCategoryChange = (event) => {
      const value = event.target.value;
      console.log("카테고리 변경 이벤트:", value, "타입:", typeof value);

      // 값 설정
      form.category = value;

      console.log("카테고리 처리 후:", form.category);

      // 유효한 카테고리인지 확인
      const validCategory = categoryOptions.value.find(
        (c) => c.value === value
      );
      if (validCategory) {
        // 스낵바 표시
        snackbar.message = `카테고리 "${validCategory.label}"가 선택되었습니다!`;
        snackbar.color = "success";
        snackbar.icon = "mdi-check-circle";
        snackbar.show = true;
      }

      // 폼 유효성 검사
      validateForm();
    };

    // 파일 입력 트리거
    const triggerFileInput = () => {
      const fileInput = document.querySelector(".hidden-file-input");
      if (fileInput) {
        fileInput.click();
      }
    };

    // 이미지 변경 처리
    const handleImageChange = (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // 기존 URL 정리
      imageUrls.value.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn("Error revoking URL:", e);
        }
      });

      // 파일 유효성 검사 및 URL 생성
      const validFiles = Array.from(files).filter((file) => {
        if (!file || !(file instanceof File)) return false;
        if (!file.type.startsWith("image/")) return false;
        return true;
      });

      if (validFiles.length === 0) {
        console.error("유효한 이미지 파일을 선택해주세요");
        return;
      }

      // 파일과 URL 모두 저장
      images.value = validFiles;
      try {
        imageUrls.value = validFiles.map((file) => URL.createObjectURL(file));
        if (mainImageIndex.value >= imageUrls.value.length) {
          mainImageIndex.value = 0;
        }
        currentSlide.value = 0;
      } catch (error) {
        console.error("Error creating object URLs:", error);
        imageUrls.value = [];
        images.value = [];
        mainImageIndex.value = 0;
      }
    };

    // 이미지 제거
    const removeImage = (index) => {
      try {
        if (imageUrls.value[index]) {
          URL.revokeObjectURL(imageUrls.value[index]);
        }
        imageUrls.value.splice(index, 1);
        images.value.splice(index, 1);
        if (mainImageIndex.value >= imageUrls.value.length) {
          mainImageIndex.value = Math.max(0, imageUrls.value.length - 1);
        }
        if (currentSlide.value >= imageUrls.value.length) {
          currentSlide.value = Math.max(0, imageUrls.value.length - 1);
        }
      } catch (error) {
        console.error("Error removing image:", error);
      }
    };

    // 대표 이미지 설정
    const setMainImage = (index) => {
      mainImageIndex.value = index;
    };

    // 슬라이더 관련 함수들
    const nextSlide = () => {
      if (currentSlide.value < imageUrls.value.length - 1) {
        currentSlide.value++;
      }
    };

    const previousSlide = () => {
      if (currentSlide.value > 0) {
        currentSlide.value--;
      }
    };

    const goToSlide = (index) => {
      currentSlide.value = index;
    };

    // 카카오맵 API 로딩 대기
    const waitForKakaoMap = () => {
      return new Promise((resolve, reject) => {
        if (typeof window.kakao !== "undefined" && window.kakao.maps) {
          resolve();
          return;
        }

        const apiKey = process.env.VUE_APP_KAKAO_MAP_API_KEY;

        // API 키가 없는 경우 에러 처리
        if (!apiKey || apiKey === "your_kakao_map_api_key_here") {
          reject(
            new Error(
              "카카오맵 API 키가 설정되지 않았습니다. .env 파일에 VUE_APP_KAKAO_MAP_API_KEY를 설정해주세요."
            )
          );
          return;
        }

        console.log(
          "카카오맵 스크립트 로딩 시작:",
          `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`
        );

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;

        script.onload = () => {
          console.log("카카오맵 스크립트 로딩 성공!");
          // autoload=false 이므로 반드시 load() 실행해야 함
          window.kakao.maps.load(() => {
            console.log("카카오맵 API 초기화 완료!");
            resolve();
          });
        };
        script.onerror = (error) => {
          console.error("카카오맵 스크립트 로딩 실패:", error);
          reject(
            new Error("카카오맵 스크립트 로드 실패. API 키를 확인해주세요.")
          );
        };

        document.head.appendChild(script);
      });
    };

    // 지도 관련 함수들
    const initMap = () => {
      if (typeof window.kakao === "undefined") {
        console.warn("Kakao Map API not loaded");
        return;
      }

      try {
        const mapContainer = document.getElementById("location-map");
        if (!mapContainer) return;

        // 사용자 위치를 가져와서 지도 중심 설정
        getUserLocation()
          .then((userLocation) => {
            const mapOption = {
              center: new window.kakao.maps.LatLng(
                userLocation.lat,
                userLocation.lng
              ),
              level: 3,
            };

            map.value = new window.kakao.maps.Map(mapContainer, mapOption);

            // 마커 생성
            marker.value = new window.kakao.maps.Marker({
              position: mapOption.center,
              draggable: true,
            });

            // 마커를 지도에 표시
            marker.value.setMap(map.value);

            // 마커 드래그 이벤트
            window.kakao.maps.event.addListener(
              marker.value,
              "dragend",
              function () {
                const position = marker.value.getPosition();
                updateLocationFromCoordinates(
                  position.getLat(),
                  position.getLng()
                );
              }
            );

            // 지도 클릭 이벤트
            window.kakao.maps.event.addListener(
              map.value,
              "click",
              function (mouseEvent) {
                const latlng = mouseEvent.latLng;
                marker.value.setPosition(latlng);
                updateLocationFromCoordinates(latlng.getLat(), latlng.getLng());
              }
            );

            // 초기 위치 정보 설정
            updateLocationFromCoordinates(userLocation.lat, userLocation.lng);

            console.log("Map initialized successfully with user location");
            mapLoaded.value = true;
          })
          .catch((error) => {
            console.warn(
              "사용자 위치를 가져올 수 없어 기본 위치(서울시청)로 설정합니다:",
              error
            );
            // 기본 위치로 설정
            const mapOption = {
              center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울시청
              level: 3,
            };

            map.value = new window.kakao.maps.Map(mapContainer, mapOption);

            marker.value = new window.kakao.maps.Marker({
              position: mapOption.center,
              draggable: true,
            });

            marker.value.setMap(map.value);

            // 마커 드래그 이벤트
            window.kakao.maps.event.addListener(
              marker.value,
              "dragend",
              function () {
                const position = marker.value.getPosition();
                updateLocationFromCoordinates(
                  position.getLat(),
                  position.getLng()
                );
              }
            );

            // 지도 클릭 이벤트
            window.kakao.maps.event.addListener(
              map.value,
              "click",
              function (mouseEvent) {
                const latlng = mouseEvent.latLng;
                marker.value.setPosition(latlng);
                updateLocationFromCoordinates(latlng.getLat(), latlng.getLng());
              }
            );

            console.log("Map initialized successfully with default location");
            mapLoaded.value = true;
          });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    const updateLocationFromCoordinates = (lat, lng) => {
      if (typeof window.kakao === "undefined") return;

      const geocoder = new window.kakao.maps.services.Geocoder();
      const coords = new window.kakao.maps.LatLng(lat, lng);

      geocoder.coord2Address(
        coords.getLng(),
        coords.getLat(),
        function (result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name;
            selectedLocation.value = {
              address: address,
              lat: lat,
              lng: lng,
            };

            console.log("=== 위치 정보 업데이트 ===");
            console.log(
              "새로운 selectedLocation.value:",
              selectedLocation.value
            );
            validateForm(); // 위치 정보 업데이트 후 폼 유효성 검사
            console.log("위치 업데이트 후 valid.value:", valid.value);
            console.log("========================");
          }
        }
      );
    };

    // 사용자 현재 위치 가져오기
    const getUserLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            console.log("사용자 위치 획득:", location);
            resolve(location);
          },
          (error) => {
            console.error("위치 정보 획득 실패:", error);
            let errorMessage = "위치 정보를 가져올 수 없습니다.";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "위치 권한이 거부되었습니다.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "위치 정보를 사용할 수 없습니다.";
                break;
              case error.TIMEOUT:
                errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5분
          }
        );
      });
    };

    // GPS 버튼 클릭 시 현재 위치로 이동
    const moveToCurrentLocation = () => {
      getUserLocation()
        .then((userLocation) => {
          if (map.value && marker.value) {
            const newCenter = new window.kakao.maps.LatLng(
              userLocation.lat,
              userLocation.lng
            );
            map.value.setCenter(newCenter);
            marker.value.setPosition(newCenter);
            updateLocationFromCoordinates(userLocation.lat, userLocation.lng);
            console.log("현재 위치로 이동했습니다:", userLocation);
          }
        })
        .catch((error) => {
          alert("현재 위치를 가져올 수 없습니다: " + error.message);
        });
    };

    const resetMapLocation = () => {
      if (map.value && marker.value) {
        const center = new window.kakao.maps.LatLng(37.5665, 126.978);
        map.value.setCenter(center);
        marker.value.setPosition(center);
        selectedLocation.value = null;

        console.log("=== 위치 초기화 ===");
        console.log("selectedLocation.value:", selectedLocation.value);
        validateForm();
        console.log("초기화 후 valid.value:", valid.value);
        console.log("==================");

        console.log("위치가 초기화되었습니다");
      }
    };

    // 컴포넌트 마운트 후 지도 초기화
    onMounted(() => {
      // 초기 폼 유효성 검사
      nextTick(() => {
        validateForm();
      });

      // 카카오맵 API 로드 및 초기화
      waitForKakaoMap()
        .then(() => {
          console.log("카카오맵 로딩 완료, 지도 초기화 시작");
          initMap();
        })
        .catch((error) => {
          console.error("카카오맵 로딩 실패:", error);
          // 지도 컨테이너에 에러 메시지 표시
          const mapContainer = document.getElementById("location-map");
          if (mapContainer) {
            mapContainer.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6c757d; padding: 20px; text-align: center; background: #f8f9fa; border-radius: 12px;">
                <div style="font-size: 48px; margin-bottom: 16px; color: #E87D7D;">🗺️</div>
                <p style="margin: 0 0 8px 0; font-size: 1rem; font-weight: 600; color: #2c3e50;">지도를 불러올 수 없습니다</p>
                <small style="color: #adb5bd; font-size: 0.85rem; line-height: 1.4;">${error.message}</small>
                <div style="margin-top: 12px; padding: 8px 16px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; color: #856404; font-size: 0.8rem;">
                  💡 카카오 개발자 콘솔에서 API 키를 발급받아 .env 파일에 설정해주세요
                </div>
              </div>
            `;
          }
        });
    });

    // 폼 제출
    const submitForm = async () => {
      if (!valid.value) return;

      loading.value = true;

      try {
        const formData = new FormData();
        formData.append("mainImageIndex", mainImageIndex.value);
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("price", form.price);
        formData.append("description", form.description);

        // 지도에서 선택된 위치 정보 추가
        if (selectedLocation.value) {
          formData.append("latitude", selectedLocation.value.lat);
          formData.append("longitude", selectedLocation.value.lng);
        }

        if (images.value) {
          images.value.forEach((file) => {
            formData.append("images", file);
          });
        }

        // API 호출을 위한 데이터 준비
        const postData = {
          title: form.title,
          category: form.category,
          price: form.price,
          description: form.description,
          latitude: selectedLocation.value?.lat,
          longitude: selectedLocation.value?.lng,
          mainImageIndex: mainImageIndex.value,
        };

        console.log("=== API 호출 준비 ===");
        console.log("전송할 데이터:", postData);
        console.log("이미지 파일들:", images.value);
        console.log("이미지 개수:", images.value?.length || 0);
        console.log("위치 정보:", selectedLocation.value);
        console.log("========================");

        try {
          // API 호출
          console.log("API 호출 시작...");

          // 요청 헤더 확인
          const token = localStorage.getItem("accessToken");
          console.log("=== 요청 정보 ===");
          console.log("토큰:", token);
          console.log("토큰 길이:", token?.length);
          console.log("토큰 형식:", token?.substring(0, 20) + "...");
          console.log("================");

          const response = await marketAPI.create(postData, images.value);

          console.log("=== API 응답 ===");
          console.log("응답 상태:", response.status);
          console.log("응답 데이터:", response.data);
          console.log("응답 헤더:", response.headers);
          console.log("================");

          if (response.status === 200 || response.status === 201) {
            // 성공 메시지
            snackbar.message = "거래글이 성공적으로 등록되었습니다!";
            snackbar.color = "success";
            snackbar.icon = "mdi-check-circle";
            snackbar.show = true;

            setTimeout(() => {
              router.push("/market");
            }, 2000);
          } else {
            throw new Error(
              `서버 응답이 성공이 아닙니다. 상태: ${response.status}`
            );
          }
        } catch (apiError) {
          console.error("API 호출 중 오류:", apiError);
          console.error("오류 상세:", {
            message: apiError.message,
            response: apiError.response,
            status: apiError.response?.status,
            data: apiError.response?.data,
            headers: apiError.response?.headers,
          });

          // 403 오류인 경우 인증 문제일 가능성이 높음
          if (apiError.response?.status === 403) {
            console.error("=== 403 오류 분석 ===");
            console.error("인증 토큰 확인 필요");
            console.error("현재 토큰:", localStorage.getItem("accessToken"));
            console.error("====================");
          }

          throw apiError;
        }
      } catch (error) {
        console.error("거래글 등록 실패:", error);
        snackbar.message = "거래글 등록에 실패했습니다. 다시 시도해주세요.";
        snackbar.color = "error";
        snackbar.icon = "mdi-alert-circle";
        snackbar.show = true;
      } finally {
        loading.value = false;
      }
    };

    return {
      formRef,
      form,
      valid,
      loading,
      images,
      imageUrls,
      mainImageIndex,
      currentSlide,
      categoryOptions,
      // 지도 관련 변수들
      map,
      marker,
      selectedLocation,
      mapLoaded,
      snackbar, // 스낵바 상태 반환
      selectCategory,
      handleCategoryChange,
      triggerFileInput,
      handleImageChange,
      removeImage,
      setMainImage,
      nextSlide,
      previousSlide,
      goToSlide,
      validateForm,
      logFormChanges,
      handleTitleInput,
      handleTitleChange,
      handlePriceInput,
      handlePriceChange,
      handleDescriptionInput,
      handleDescriptionChange,
      submitForm,
      waitForKakaoMap, // 추가된 함수
      initMap,
      updateLocationFromCoordinates,
      resetMapLocation,
      moveToCurrentLocation,
    };
  },
};
</script>

<style scoped>
/* 뒤로가기 버튼 */
.back-btn-wrapper {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
}

.back-btn {
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.9rem;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
}

/* 메인 컨테이너 */
.create-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* 폼 컨테이너 */
.form-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 폼 섹션 */
.form-section {
  padding: 32px;
  border-bottom: 1px solid #f1f3f4;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  border-radius: 2px;
}

/* 폼 그리드 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* 폼 필드 */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

/* 폼 입력 */
.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #e87d7d;
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.1);
}

.form-input::placeholder {
  color: #adb5bd;
}

/* 드롭다운 스타일 */
.form-select {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  padding-right: 48px;
  position: relative;
  z-index: 10;
}

.form-select:focus {
  outline: none;
  border-color: #e87d7d;
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.1);
  transform: translateY(-1px);
}

.form-select:hover {
  border-color: #e87d7d;
  background-color: #fff5f5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.15);
}

.form-select option {
  padding: 16px 20px;
  background: white;
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.form-select option:hover {
  background: linear-gradient(135deg, #fff5f5, #ffe6e6);
  color: #e87d7d;
  transform: translateX(8px);
  padding-left: 28px;
}

.form-select option:checked {
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 125, 125, 0.3);
}

.form-select option:disabled {
  color: #adb5bd;
  font-style: italic;
  background: #f8f9fa;
}

/* 드롭다운 커스텀 스타일링 */
.form-select:focus option {
  background: #fff5f5;
}

/* 드롭다운 화살표 애니메이션 */
.form-select:focus {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E87D7D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  transform: translateY(-1px) scale(1.02);
}

/* 드롭다운 옵션 그룹 스타일링 */
.form-select optgroup {
  font-weight: 600;
  color: #e87d7d;
  background: #fff5f5;
  padding: 8px 16px;
  border-bottom: 1px solid #ffe6e6;
}

/* 드롭다운 옵션 선택 효과 */
.form-select option:active {
  background: linear-gradient(135deg, #ff6b6b, #e87d7d);
  color: white;
  transform: scale(1.05);
}

/* 드롭다운 포커스 링 효과 */
.form-select:focus::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  border-radius: 14px;
  z-index: -1;
  opacity: 0.3;
  animation: focusGlow 0.3s ease-out;
}

@keyframes focusGlow {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}

/* 가격 입력 */
.price-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.price-input {
  padding-right: 60px;
}

.price-unit {
  position: absolute;
  right: 20px;
  color: #6c757d;
  font-weight: 500;
  font-size: 0.95rem;
}

/* 이미지 업로드 섹션 */
.image-upload-section {
  margin-top: 16px;
}

.main-upload-area {
  border: 2px dashed #e9ecef;
  border-radius: 16px;
  min-height: 300px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.main-upload-area:hover {
  border-color: #e87d7d;
  background: #fff5f5;
}

.main-upload-area.has-images {
  border: none;
  min-height: auto;
}

/* 업로드 콘텐츠 */
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  cursor: pointer;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.upload-content:hover {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.15);
}

.upload-icon {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  border-radius: 50%;
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
  transition: all 0.3s ease;
}

.upload-content:hover .upload-icon {
  transform: scale(1.1);
  box-shadow: 0 12px 30px rgba(232, 125, 125, 0.4);
}

.upload-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.upload-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0 0 16px 0;
}

.upload-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* 숨겨진 파일 입력 */
.hidden-file-input {
  display: none;
}

/* 이미지 슬라이더 */
.image-slider-container {
  width: 100%;
}

.image-slider {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 16px;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 대표 이미지 체크박스 */
.main-image-checkbox {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  cursor: pointer;
}

.checkbox {
  width: 32px;
  height: 32px;
  border: 3px solid white;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.checkbox.checked {
  background: #e87d7d;
  border-color: white;
}

.check-mark {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

/* 이미지 제거 버튼 */
.remove-image-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.remove-image-btn:hover {
  background: rgba(220, 53, 69, 0.9);
  transform: scale(1.1);
}

/* 슬라이더 네비게이션 */
.slider-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 0 16px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 슬라이드 인디케이터 */
.slide-indicators {
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dee2e6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator.active {
  background: #e87d7d;
  transform: scale(1.2);
}

/* 지역 섹션 */
.region-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 지도 선택 섹션 */
.map-selection-section {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  overflow: hidden;
}

.map-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #fff5f5, #fff);
  border-bottom: 1px solid #e9ecef;
}

.map-title-content {
  flex: 1;
}

.map-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 8px 0 0 0;
  line-height: 1.5;
}

/* 지도 컨테이너 */
.map-container {
  padding: 24px;
}

.map-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.location-map {
  width: 100%;
  height: 300px;
  border-radius: 12px;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.map-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 0.9rem;
}

/* 지도 컨트롤 */
.map-controls {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.map-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  color: white;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.secondary-btn:hover {
  background: #e9ecef;
  color: #495057;
}

/* 위치 정보 */
.location-info {
  margin-top: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  color: white;
  font-weight: 600;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.info-content {
  padding: 20px;
}

.address-display,
.coordinate-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.address-display:last-child,
.coordinate-display:last-child {
  margin-bottom: 0;
}

.address-text,
.coordinate-text {
  margin: 0;
  font-size: 0.95rem;
  color: #2c3e50;
  line-height: 1.4;
}

/* 지도 힌트 */
.map-hint {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
}

.hint-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-title {
  font-weight: 600;
  color: #856404;
  font-size: 0.9rem;
}

.hint-text {
  color: #856404;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
}

/* 상세 설명 섹션 */
.description-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-textarea {
  width: 100%;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #e87d7d;
  box-shadow: 0 0 0 3px rgba(232, 125, 125, 0.1);
}

.form-textarea::placeholder {
  color: #adb5bd;
}

.description-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

/* 액션 섹션 */
.action-section {
  display: flex;
  gap: 16px;
  padding: 32px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #e9ecef;
  color: #6c757d;
}

.cancel-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.submit-btn {
  background: linear-gradient(135deg, #e87d7d, #ff6b6b);
  color: white;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 로딩 스피너 */
.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 카테고리 힌트 */
.category-hint {
  margin-top: 8px;
  padding: 8px 12px;
  background: #ffe8e8;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #595454;
  border-left: 3px solid #e87d7d;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .create-container {
    padding: 16px;
  }

  .form-section {
    padding: 24px 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .action-section {
    flex-direction: column;
    padding: 24px 20px;
  }

  .map-controls {
    flex-direction: column;
  }

  .slider-nav {
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .create-container {
    padding: 12px;
  }

  .form-section {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .form-input,
  .form-textarea {
    padding: 14px 16px;
  }
}

/* 스낵바 스타일 */
.custom-snackbar {
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 400px;
  min-width: 300px;
  margin: 16px;
  overflow: hidden;
  position: relative;
  z-index: 9999;
}

.custom-snackbar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #e87d7d, #ff6b6b, #e87d7d);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  padding: 20px 24px;
  position: relative;
  z-index: 1;
}

.snackbar-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.snackbar-message {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
  color: inherit;
  flex: 1;
  text-align: left;
}

/* 스낵바 색상 커스터마이징 */
.custom-snackbar.v-snackbar--success {
  background: linear-gradient(
    135deg,
    rgba(76, 175, 80, 0.95),
    rgba(76, 175, 80, 0.85)
  ) !important;
  color: white !important;
  border-color: rgba(76, 175, 80, 0.3) !important;
}

.custom-snackbar.v-snackbar--success .snackbar-icon {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.custom-snackbar.v-snackbar--error {
  background: linear-gradient(
    135deg,
    rgba(244, 67, 54, 0.95),
    rgba(244, 67, 54, 0.85)
  ) !important;
  color: white !important;
  border-color: rgba(244, 67, 54, 0.3) !important;
}

.custom-snackbar.v-snackbar--error .snackbar-icon {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.custom-snackbar.v-snackbar--info {
  background: linear-gradient(
    135deg,
    rgba(33, 150, 243, 0.95),
    rgba(33, 150, 243, 0.85)
  ) !important;
  color: white !important;
  border-color: rgba(33, 150, 243, 0.3) !important;
}

.custom-snackbar.v-snackbar--info .snackbar-icon {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 스낵바 애니메이션 */
.custom-snackbar {
  animation: slideInDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideInDown {
  0% {
    transform: translateY(-100%) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 호버 효과 */
.custom-snackbar:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .custom-snackbar {
    max-width: calc(100vw - 32px);
    min-width: auto;
    margin: 8px;
  }

  .snackbar-content {
    padding: 16px 20px;
    gap: 12px;
  }

  .snackbar-message {
    font-size: 0.9rem;
  }
}
</style>
