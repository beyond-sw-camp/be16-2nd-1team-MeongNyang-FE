<template>
  <div class="market-detail-page">
    <!-- 헤더 섹션 -->
    <div class="back-btn-wrapper">
  <button @click="$router.push('/market')" class="back-btn">
    <v-icon icon="mdi-arrow-left" size="20" />
    목록으로
  </button>
      
         <!-- 수정 버튼 - 본인이 작성한 게시글인 경우에만 표시 -->
         <button 
           v-if="post && post.sellerEmail === currentUserEmail" 
           @click="goToEditPage" 
           class="edit-btn"
         >
           <v-icon icon="mdi-pencil" size="20" />
           수정하기
         </button>
</div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>거래글을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchPostDetail" class="retry-btn">다시 시도</button>
    </div>

    <!-- 상세 내용 -->
    <div v-else-if="post" class="detail-content">
      <!-- 이미지 섹션 -->
      <div class="image-section">
        <div class="image-container">
          <img 
            v-if="currentImage"
            :src="currentImage" 
            :alt="post.title"
            class="main-image"
          />
          <!-- 이미지가 없는 경우 기본 이미지 표시 -->
          <div v-else class="default-main-image">
            <v-icon icon="mdi-image-off" size="80" color="#E87D7D" />
            <span class="default-image-text">이미지 없음</span>
          </div>
          
          <!-- 상태 뱃지 (좌상단) -->
          <div class="status-badge" :class="post.saleStatus.toLowerCase()">
            {{ getStatusLabel(post.saleStatus) }}
          </div>
          
          <!-- 찜하기 버튼 (우상단) -->
          <button 
            class="like-btn"
            @click="toggleLike"
            :class="{ liked: post.isLiked }"
          >
            <v-icon 
              :icon="post.isLiked ? 'mdi-heart' : 'mdi-heart-outline'" 
              size="20"
            />
          </button>
          
                     <!-- 이미지 네비게이션 -->
           <div class="image-nav">
             <button 
               class="nav-btn prev"
               @click="previousImage"
               :disabled="currentImageIndex === 0"
             >
               <v-icon icon="mdi-chevron-left" size="24" />
             </button>
             <button 
               class="nav-btn next"
               @click="nextImage"
               :disabled="currentImageIndex === (post.productImageList?.length || 1) - 1"
             >
               <v-icon icon="mdi-chevron-right" size="24" />
             </button>
           </div>
           
           <!-- 이미지 인덱스 표시 -->
           <div v-if="post.productImageList && post.productImageList.length > 1" class="image-counter">
             {{ currentImageIndex + 1 }} / {{ post.productImageList.length }}
           </div>
        </div>
        
                 <!-- 이미지 썸네일 -->
         <div v-if="post.productImageList && post.productImageList.length > 1" class="thumbnails">
           <div 
             v-for="(image, index) in post.productImageList" 
             :key="index"
             class="thumbnail"
             :class="{ active: index === currentImageIndex }"
             @click="setCurrentImage(index)"
           >
             <img v-if="image" :src="image" :alt="`${post.title} ${index + 1}`" />
             <!-- 썸네일 이미지가 없는 경우 기본 이미지 표시 -->
             <div v-else class="default-thumbnail">
               <v-icon icon="mdi-image-off" size="24" color="#E87D7D" />
             </div>
           </div>
         </div>
        <!-- 판매자 정보 -->
        <div class="seller-info">
          <div class="seller-header">
            <h3>판매자 정보</h3>
          </div>
          <div class="seller-profile">
            <div class="profile-image-container">
                                            <img 
                 v-if="getProfileImage(post.sellerProfileUrl)"
                 :src="getProfileImage(post.sellerProfileUrl)" 
                 :alt="post.sellerNickname || '판매자'"
                 class="profile-image"
                 @error="handleImageError"
               />
               <!-- 기본 프로필 아이콘 (이미지가 없거나 로드 실패 시 표시) -->
               <v-icon 
                 v-else
                 icon="mdi-account-circle" 
                 size="40" 
                 class="default-profile-icon"
               />
               <!-- <div class="online-indicator"></div> -->
            </div>
                         <div class="seller-details">
               <div class="seller-name">{{ post.sellerNickname || '판매자' }}</div>
             </div>
          </div>
        </div>
        <!-- 채팅하기 버튼 -->
        <div class="action-section">
          <button class="chat-btn primary">
            <v-icon icon="mdi-chat" size="20" />
            채팅하기
          </button>
        </div>
      </div>

      <!-- 정보 섹션 -->
      <div class="info-section">
        <!-- 제목 및 카테고리 -->
        <div class="post-header">
          <div class="title-row">
            <h2 class="post-title">{{ post.title }}</h2>
            <span class="category-badge">{{ getCategoryLabel(post.category) }}</span>
          </div>
          <div class="post-meta">
            <span class="date">
              <v-icon icon="mdi-calendar" size="16" />
              {{ formatDate(post.createdAt) }}
            </span>
          </div>
        </div>

        <!-- 가격 및 상태 -->
        <div class="price-section">
          <div class="price-info">
            <div class="price">{{ formatPrice(post.price) }}</div>
          </div>
        </div>


        <!-- 본문 -->
        <div class="post-description">
          <div class="description-header">
            <h3>상품 설명</h3>
          </div>
          <div class="description-content">
            <p>{{ post.description || '상품 설명이 없습니다.' }}</p>
          </div>
        </div>

                 <!-- 거래 위치 -->
         <div class="location-section">
           <div class="location-header">
             <h3>거래 위치</h3>
              <span class="location-detail">{{ getLocationDisplay() }}</span>
           </div>
            
            
                     <div class="map-container" ref="mapContainer">
              <!-- 지도 로딩 상태 표시 -->
              <div class="map-loading">
                <div class="map-loading-spinner"></div>
                <p>지도를 불러오는 중...</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marketAPI } from '@/services/api'
import { getToken } from '@/utils/auth'

export default {
  name: 'MarketDetailView',
  setup() {
         const route = useRoute()
          const router = useRouter()
    
    // 반응형 데이터
    const post = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const currentImageIndex = ref(0)
    const mapContainer = ref(null)
      const locationAddress = ref('위치 정보를 불러오는 중...')
      
             // 현재 사용자 정보 (JWT 토큰에서 추출)
       const currentUserId = ref(null)
       const currentUserEmail = ref(null)
    
    // 카테고리 라벨
    const categoryLabels = {
      'FEED': '사료',
      'CLOTH': '의류', 
      'TOY': '장난감',
      'OTHER': '기타'
    }
    
         // 현재 이미지
     const currentImage = computed(() => {
      if (!post.value || !post.value.productImageList || post.value.productImageList.length === 0) {
        return null
       }
      return post.value.productImageList[currentImageIndex.value]
     })
    
         // 거래글 상세 조회
     const fetchPostDetail = async () => {
       loading.value = true
       error.value = null
       
       try {
         const response = await marketAPI.getDetail(route.params.id)
                    if (response.data && response.data.isSuccess) {
             post.value = response.data.data
             
             // 백엔드의 'liked' 필드를 'isLiked'로 매핑
             if (post.value.liked !== undefined) {
               post.value.isLiked = post.value.liked
               console.log('백엔드 liked 필드를 isLiked로 매핑:', post.value.liked, '→', post.value.isLiked)
             }
             
             console.log('거래글 상세:', post.value)
             console.log('백엔드에서 받은 liked 값:', post.value.liked)
             console.log('매핑된 isLiked 값:', post.value.isLiked)
           
           // 썸네일을 첫 번째 이미지로 설정
           if (post.value.productImageList && post.value.productImageList.length > 0) {
             currentImageIndex.value = 0
           }
             // 위도, 경도가 있으면 주소 정보 가져오기
             if (post.value.latitude && post.value.longitude) {
             nextTick(() => {
               // 카카오맵 API 로딩 대기
               waitForKakaoMap().then(() => {
                   getAddressFromCoordinates(post.value.latitude, post.value.longitude)
                 initKakaoMap()
               }).catch(() => {
                 console.error('카카오맵 API 로딩 실패')
               })
             })
             } else {
               // 위도, 경도가 없는 경우
               locationAddress.value = '위치 정보 없음'
               nextTick(() => {
                 // 카카오맵 API 로딩 대기
                 waitForKakaoMap().then(() => {
                   initKakaoMap()
                 }).catch(() => {
                   console.error('카카오맵 API 로딩 실패')
                 })
               })
             }
         } else {
           error.value = '거래글을 불러올 수 없습니다.'
         }
       } catch (err) {
         console.error('거래글 상세 조회 오류:', err)
         error.value = '거래글을 불러오는 중 오류가 발생했습니다.'
       } finally {
         loading.value = false
       }
     }
     // 프로필 이미지 처리
     const getProfileImage = (profileUrl) => {
       if (!profileUrl || profileUrl === 'null' || profileUrl === '') {
         // 기본 프로필 이미지 반환 (Vuetify 아이콘 사용)
         return null
       }
       return profileUrl
     }
     
     // 이미지 로드 실패 시 처리
     const handleImageError = (event) => {
       console.log('프로필 이미지 로드 실패, 기본 아이콘으로 대체')
       // 이미지 요소를 숨기고 기본 아이콘 표시
       event.target.style.display = 'none'
       const iconElement = event.target.nextElementSibling
       if (iconElement) {
         iconElement.style.display = 'block'
       }
     }
     
     // 카카오맵 API 로딩 대기
     const waitForKakaoMap = () => {
       return new Promise((resolve, reject) => {
         // 이미 로드된 경우
         if (typeof window.kakao !== 'undefined' && window.kakao.maps) {
           resolve()
           return
         }
         
         // 로딩 대기 (최대 10초)
         let attempts = 0
         const maxAttempts = 100 // 100ms * 100 = 10초
         
         const checkKakaoMap = () => {
           attempts++
           
           if (typeof window.kakao !== 'undefined' && window.kakao.maps) {
             console.log('카카오맵 API 로딩 완료')
             resolve()
           } else if (attempts >= maxAttempts) {
             console.error('카카오맵 API 로딩 시간 초과')
             reject(new Error('카카오맵 API 로딩 시간 초과'))
           } else {
             setTimeout(checkKakaoMap, 100)
           }
         }
         
         checkKakaoMap()
       })
     }
     
     // 카카오맵 초기화
     const initKakaoMap = () => {
       if (!post.value || !mapContainer.value) return
       
       // 카카오맵 API 로딩 확인
       if (typeof window.kakao === 'undefined' || !window.kakao.maps) {
         console.error('카카오맵 API가 로드되지 않았습니다.')
         // 지도 컨테이너에 에러 메시지 표시
         mapContainer.value.innerHTML = `
           <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6c757d;">
             <v-icon icon="mdi-map-marker-off" size="48" color="#E87D7D" />
             <p style="margin: 10px 0 5px 0; font-size: 0.9rem;">지도를 불러올 수 없습니다</p>
             <small style="color: #adb5bd; font-size: 0.8rem;">카카오맵 API 로딩 중...</small>
           </div>
         `
         return
       }
       
       try {
          // 위도, 경도 정보가 있는지 확인
          if (post.value.latitude && post.value.longitude) {
            console.log('정확한 좌표 정보로 지도 초기화:', post.value.latitude, post.value.longitude)
            
             // 로딩 상태 제거
             mapContainer.value.innerHTML = ''
             
             // 카카오맵 생성 (위도, 경도로 중심 설정)
         const map = new window.kakao.maps.Map(mapContainer.value, {
               center: new window.kakao.maps.LatLng(post.value.latitude, post.value.longitude),
               level: 3,
               zoomControl: true,
               scaleControl: true
             })
             
             // 마커 생성
             const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(post.value.latitude, post.value.longitude)
             })
             
             // 마커를 지도에 표시
             marker.setMap(map)
             
             // 인포윈도우 생성
             const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:8px;font-size:13px;font-weight:600;color:#2c3e50;">
                <div style="margin-bottom:4px;">${post.value.title}</div>
                <div style="font-size:11px;color:#6c757d;">${formatPrice(post.value.price)}</div>
              </div>`
             })
             
             // 마커 클릭 시 인포윈도우 표시
             window.kakao.maps.event.addListener(marker, 'click', () => {
               infowindow.open(map, marker)
             })
             
            // 마커에 마우스 오버 시 인포윈도우 표시
            window.kakao.maps.event.addListener(marker, 'mouseover', () => {
              infowindow.open(map, marker)
            })
            
            // 마커에서 마우스 아웃 시 인포윈도우 숨기기
            window.kakao.maps.event.addListener(marker, 'mouseout', () => {
              infowindow.close()
            })
            
            console.log('카카오맵 초기화 완료 - 좌표 기반:', post.value.latitude, post.value.longitude)
            
           } else {
             // 위도, 경도가 없는 경우
             console.log('위치 정보가 없어 지도를 표시할 수 없습니다.')
             mapContainer.value.innerHTML = `
               <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6c757d;">
                 <v-icon icon="mdi-map-marker-off" size="48" color="#E87D7D" />
                 <p style="margin: 10px 0 5px 0; font-size: 0.9rem;">위치 정보가 없습니다</p>
                 <small style="color: #adb5bd; font-size: 0.8rem;">거래글 작성 시 위치를 설정해주세요</small>
               </div>
             `
             return
           }
         
       } catch (error) {
         console.error('카카오맵 초기화 오류:', error)
         // 에러 메시지 표시
         mapContainer.value.innerHTML = `
           <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6c757d;">
             <v-icon icon="mdi-map-marker-off" size="48" color="#E87D7D" />
             <p style="margin: 10px 0 5px 0; font-size: 0.9rem;">지도 로딩 오류</p>
             <small style="color: #adb5bd; font-size: 0.8rem;">${error.message}</small>
           </div>
         `
       }
     }
     
     // 찜하기 토글
    const toggleLike = async () => {
      try {
        const token = getToken('accessToken')
        if (!token) {
          alert('로그인이 필요합니다.')
          return
        }
        
        const postId = post.value.id
        const isLiked = post.value.isLiked
        
        console.log('찜하기 토글 시작 - postId:', postId, '현재 상태:', isLiked)
        
        if (isLiked) {
          // 찜 취소
          console.log('찜 취소 시도...')
          await marketAPI.unlikeMarket(postId)
          console.log('찜 취소 성공')
        } else {
          // 찜하기
          console.log('찜하기 시도...')
          await marketAPI.likeMarket(postId)
          console.log('찜하기 성공')
        }
        
        // 상태 토글
        post.value.isLiked = !isLiked
        console.log('찜 상태 업데이트 완료:', post.value.isLiked)
        
        // 찜 개수 업데이트 (백엔드에서 받아온 데이터 사용)
        if (post.value.likeCount !== undefined) {
          post.value.likeCount += isLiked ? -1 : 1
        }
        
      } catch (err) {
        console.error('찜하기 토글 오류:', err)
        alert('찜하기 처리 중 오류가 발생했습니다.')
      }
    }
    
    // 이미지 네비게이션
    const previousImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--
      }
    }
    
         const nextImage = () => {
       if (post.value?.productImageList && currentImageIndex.value < post.value.productImageList.length - 1) {
         currentImageIndex.value++
       }
     }
    
    const setCurrentImage = (index) => {
      currentImageIndex.value = index
    }
     
     // 수정 페이지로 이동
     const goToEditPage = () => {
       if (post.value && post.value.id) {
         router.push(`/market/${post.value.id}/edit`)
       }
     }
    
    // 유틸리티 함수
    const getCategoryLabel = (category) => {
      return categoryLabels[category] || category
    }
    
    const getStatusLabel = (status) => {
      return status === 'SALE' ? '판매중' : '판매완료'
    }
    
    const formatPrice = (price) => {
      return `₩${price.toLocaleString()}`
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ko-KR')
    }
    
                   // 위치 정보 표시 함수
          const getLocationDisplay = () => {
            if (post.value?.latitude && post.value?.longitude) {
              return locationAddress.value
            }
            return '위치 정보 없음'
          }
          
          // 위도, 경도로부터 주소 가져오기
          const getAddressFromCoordinates = async (latitude, longitude) => {
            try {
              // 카카오맵 API가 로드되지 않은 경우
              if (typeof window.kakao === 'undefined' || !window.kakao.maps) {
                locationAddress.value = '위치 정보를 불러올 수 없습니다'
                return
              }
              
              // 좌표-주소 변환 객체 생성
              const geocoder = new window.kakao.maps.services.Geocoder()
              
               // 좌표로 주소 검색
               geocoder.coord2Address(longitude, latitude, (result, status) => {
                 if (status === window.kakao.maps.services.Status.OK) {
                   const address = result[0].address
                   
                   // 더 자세한 주소 형식으로 변환
                   let detailedAddress = `${address.region_1depth_name} ${address.region_2depth_name}`
                   
                   // 동(읍/면) 정보가 있으면 추가
                   if (address.region_3depth_name) {
                     detailedAddress += ` ${address.region_3depth_name}`
                   }
                   
                   // 도로명이 있으면 추가 (예: 테헤란로, 강남대로 등)
                   if (address.road_name) {
                     detailedAddress += ` ${address.road_name}`
                   }
                   
                   // 건물 번호가 있으면 추가
                   if (address.main_building_no) {
                     detailedAddress += ` ${address.main_building_no}`
                   }
                   
                   locationAddress.value = detailedAddress
                   console.log('좌표로부터 자세한 주소 가져오기 성공:', detailedAddress)
                   console.log('전체 주소 정보:', address)
                 } else {
                   console.error('좌표로 주소 검색 실패:', status)
                   locationAddress.value = '주소 정보를 가져올 수 없습니다'
                 }
               })
            } catch (error) {
              console.error('주소 가져오기 오류:', error)
              locationAddress.value = '주소 정보를 가져올 수 없습니다'
            }
     }
    
         onMounted(() => {
       console.log('MarketDetailView 마운트됨')
       console.log('카카오맵 API 상태:', typeof window.kakao, window.kakao?.maps)
        
        // 현재 사용자 정보 설정
        const token = getToken('accessToken')
        if (token) {
          try {
            // JWT 토큰에서 사용자 정보 추출
            const payload = JSON.parse(atob(token.split('.')[1]))
            console.log('JWT Payload 전체:', payload)
            
            // 이메일 추출 (sub 또는 email 필드에서)
            if (payload.email) {
              currentUserEmail.value = payload.email
              console.log('JWT에서 email 추출:', currentUserEmail.value)
            } else if (payload.sub && typeof payload.sub === 'string' && payload.sub.includes('@')) {
              currentUserEmail.value = payload.sub
              console.log('JWT에서 sub(이메일) 추출:', currentUserEmail.value)
            } else {
              currentUserEmail.value = null
              console.log('JWT에서 이메일을 찾을 수 없음')
            }
            
            // userId도 추출 시도 (있으면 사용)
            if (payload.userId) {
              currentUserId.value = payload.userId
              console.log('JWT에서 userId 추출:', currentUserId.value)
            } else if (payload.sub && typeof payload.sub === 'number') {
              currentUserId.value = payload.sub
              console.log('JWT에서 sub(숫자) 추출:', currentUserId.value)
            } else {
              currentUserId.value = null
              console.log('JWT에서 userId를 찾을 수 없음')
            }
          } catch (error) {
            console.error('토큰에서 사용자 정보 추출 실패:', error)
            currentUserId.value = null
            currentUserEmail.value = null
          }
        }
        
       fetchPostDetail()
     })
    
         return {
       post,
       loading,
       error,
       currentImageIndex,
       currentImage,
       mapContainer,
           locationAddress,
           currentUserId,
           currentUserEmail,
       fetchPostDetail,
       toggleLike,
       previousImage,
       nextImage,
       setCurrentImage,
       getCategoryLabel,
       getStatusLabel,
       formatPrice,
       formatDate,
           getLocationDisplay,
       initKakaoMap,
       getProfileImage,
           handleImageError,
           goToEditPage
     }
  }
}
</script>

<style scoped>
.market-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFFDF6 0%, #FAF9F6 100%);
  padding: 20px 0;
}



.header-content {
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
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

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.image-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 20px;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.status-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.status-badge.sale {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.status-badge.sold {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.like-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #e9ecef;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.like-btn:hover {
  background: white;
  transform: scale(1.1);
  border-color: #E87D7D;
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.3);
}

.like-btn.liked {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border-color: #E87D7D;
  box-shadow: 0 6px 20px rgba(232, 125, 125, 0.4);
}

.like-btn:not(.liked) {
  color: #6c757d;
}

.image-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover:not(:disabled) {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.thumbnails {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: #E87D7D;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.post-header {
  margin-bottom: 25px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.post-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  text-align: left;
}

.category-badge {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(232, 125, 125, 0.3);
}

.back-btn-wrapper {
  max-width: 1200px;   /* detail-content와 맞추기 */
  margin: 0 auto 20px; /* 가운데 정렬 + 아래 여백 */
  padding: 0 20px;     /* 양 옆 여백 */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.edit-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
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

.edit-btn:hover {
  transform: translateY(-2px);
  /* box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3); */
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
}

.post-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #E87D7D;
}

.status-badge-info {
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.status-badge-info.sale {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.status-badge-info.sold {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

.seller-info {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
}

.seller-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 18px;
}

 .profile-image-container {
   position: relative;
   display: flex;
   align-items: center;
   justify-content: center;
 }
 
 .profile-image-container::after {
   content: '';
   position: absolute;
   top: -2px;
   left: -2px;
   right: -2px;
   bottom: -2px;
   background: linear-gradient(45deg, #E87D7D, #FF6B6B, #E87D7D);
   border-radius: 50%;
   z-index: -1;
   opacity: 0;
   transition: opacity 0.3s ease;
 }
 
 .profile-image-container:hover::after {
   opacity: 1;
 }

 .profile-image {
   width: 48px;
   height: 48px;
   border-radius: 50%;
   object-fit: cover;
   border: 3px solid white;
   box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
   transition: all 0.3s ease;
   cursor: pointer;
 }
 
 .profile-image:hover {
   transform: scale(1.05);
   box-shadow: 0 12px 35px rgba(232, 125, 125, 0.25);
   border-color: #E87D7D;
 }
 
 .default-profile-icon {
   width: 48px;
   height: 48px;
   border-radius: 50%;
   background: linear-gradient(135deg, #f8f9fa, #e9ecef);
   border: 3px solid white;
   box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
   display: flex;
   align-items: center;
   justify-content: center;
   color: #E87D7D;
   transition: all 0.3s ease;
   cursor: pointer;
 }
 
 .default-profile-icon:hover {
   transform: scale(1.05);
   background: linear-gradient(135deg, #E87D7D, #FF6B6B);
   color: white;
   box-shadow: 0 12px 35px rgba(232, 125, 125, 0.3);
 }

/* .online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: #28a745;
  border: 2px solid white;
  border-radius: 50%;
} */

.seller-details {
  flex: 1;
}

.seller-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0; /* 마진 제거 */
  font-size: 1.1rem;
  text-align: left;
}

.seller-location {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.seller-rating {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-description {
  margin-bottom: 25px;
}

.description-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  text-align: left;
}

.description-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
  text-align: left;
}

.description-content p {
  color: #495057;
  line-height: 1.7;
  margin: 0;
  font-size: 0.95rem;
}

.location-section {
  margin-bottom: 25px;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.location-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.location-detail {
  color: #6c757d;
  font-size: 0.9rem;
  background: #e9ecef;
  padding: 6px 12px;
  border-radius: 12px;
}

/* 위도, 경도 정보 스타일 */
.coordinates-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 16px;
  margin: 16px 0;
}

.coordinates-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.coordinates-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coordinate-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coordinate-label {
  font-weight: 600;
  color: #6c757d;
  min-width: 40px;
  font-size: 0.9rem;
}

.coordinate-value {
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #495057;
  min-width: 120px;
  text-align: center;
}

.map-container {
    height: 350px;
   background: #f8f9fa;
   border-radius: 20px;
   border: 2px solid #dee2e6;
   overflow: hidden;
   position: relative;
 }

.map-container:hover {
  border-color: #E87D7D;
  background: #f1f3f4;
 }

/* 지도 로딩 상태 스타일 */
.map-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.map-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #E87D7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.map-loading p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.map-placeholder {
  text-align: center;
  color: #6c757d;
}

.map-placeholder p {
  margin: 10px 0 5px 0;
  font-size: 0.9rem;
}

.map-placeholder small {
  color: #adb5bd;
  font-size: 0.8rem;
}

.action-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.chat-btn {
  display: flex;              /* 아이콘 + 글자를 가로로 배치 */
  align-items: center;        /* 세로 중앙 정렬 */
  justify-content: center;    /* 가로 중앙 정렬 */
  gap: 6px;                   /* 아이콘과 글자 사이 간격 */
  padding: 10px 18px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.chat-btn.primary {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  flex: 2;
}

.chat-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.4);
}

.chat-btn.secondary {
  background: white;
  color: #6c757d;
  border: 2px solid #e9ecef;
  flex: 1;
}

.chat-btn.secondary:hover {
  background: #f8f9fa;
  border-color: #E87D7D;
  color: #E87D7D;
  transform: translateY(-2px);
}

.loading-container,
.error-container {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #E87D7D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: linear-gradient(135deg, #E87D7D, #FF6B6B);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 125, 125, 0.3);
}

/* 기본 이미지 스타일 */
.default-main-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  color: #6c757d;
}

.default-image-text {
  margin-top: 16px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #6c757d;
}

.default-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  color: #6c757d;
  min-height: 60px;
}

/* 반응형 */
@media (max-width: 768px) {
  .detail-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .chat-btn.primary,
  .chat-btn.secondary {
    flex: 1;
  }
}
</style>