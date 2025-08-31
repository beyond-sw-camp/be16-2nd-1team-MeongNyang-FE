<template>
  <div class="diary-page">
    <!-- 검색 컴포넌트 -->
    <SearchComponent
      v-model="searchKeyword"
      :search-type="searchType"
      @update:search-type="searchType = $event"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <!-- 프로필 섹션 -->
    <DiaryProfileSection
      :user-info="userInfo"
      :posts-count="postsCount"
      :followers-count="followersCount"
      :followings-count="followingsCount"
      :main-pet="mainPet"
      :user-pets="userPets"
      :profile-image-url="profileImageUrl"
      :display-user-name="displayUserName"
      :pet-bio="petBio"
      @open-follow-modal="openFollowModal"
      @change-main-pet="handleChangeMainPet"
    />
    
    <!-- 다이어리 그리드 -->
    <DiaryGridDisplay
      :diary-list="diaryList"
      :is-loading="isLoading"
      @view-diary="viewDiary"
    />
    
    <!-- 팔로우/팔로워 모달 -->
    <FollowModal
      :is-visible="isFollowModalVisible"
      :user-id="currentUserId"
      :followers-count="followersCount"
      :followings-count="followingsCount"
      :initial-tab="followModalTab"
      @close="closeFollowModal"
      @follow-updated="handleFollowUpdated"
      @unfollow-updated="handleUnfollowUpdated"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { validatePetAndRedirect } from '@/utils/petValidation';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePetStore } from '@/stores/pet';
import { postAPI, userAPI } from '@/services/api';
import SearchComponent from '@/components/SearchComponent.vue';
import FollowModal from '@/components/FollowModal.vue';
import DiaryProfileSection from '@/components/diary/DiaryProfileSection.vue';
import DiaryGridDisplay from '@/components/diary/DiaryGridDisplay.vue';

export default {
  name: 'DiaryListView',
  components: {
    SearchComponent,
    FollowModal,
    DiaryProfileSection,
    DiaryGridDisplay,
  },
  setup() {
    const $router = useRouter();
    const authStore = useAuthStore();
    const petStore = usePetStore();
    const userInfo = computed(() => authStore.myPageInfo);

    const isFollowModalVisible = ref(false);
    const followModalTab = ref('followers');

    const postsCount = ref(0);
    const followersCount = ref(0);
    const followingsCount = ref(0);
    const diaryList = ref([]);

    const currentUserId = computed(() => userInfo.value?.id);

    const userPets = computed(() => petStore.pets);

    const mainPet = computed(() => {
      if (!userInfo.value?.mainPetId || userPets.value.length === 0) {
        return userPets.value.length > 0 ? userPets.value[0] : null;
      }
      const representativePet = userPets.value.find(
        pet => pet.id === userInfo.value.mainPetId,
      );
      return representativePet || (userPets.value.length > 0 ? userPets.value[0] : null);
    });

    const profileImageUrl = computed(() => {
      if (userInfo.value?.mainPetImage) {
        return userInfo.value.mainPetImage;
      }
      if (mainPet.value?.url) {
        return mainPet.value.url;
      }
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=120&fit=crop&crop=center';
    });

    const displayUserName = computed(() => {
      return userInfo.value?.nickname || '사용자';
    });

    const petBio = computed(() => {
      return (
        mainPet.value?.introduce ||
        '반려동물과 함께하는 특별한 순간들을 기록해보세요!'
      );
    });

    const fetchPostsCount = async () => {
      try {
        const response = await postAPI.getMyPosts({ page: 0, size: 1000 });
        if (response.data && response.data.data) {
          postsCount.value = response.data.data.content?.length || 0;
        }
      } catch (error) {
        console.error('게시물 개수 조회 실패:', error);
        postsCount.value = 0;
      }
    };

    const fetchFollowersCount = async () => {
      try {
        const response = await userAPI.getFollowersCount();
        if (response.data && response.data.data) {
          followersCount.value = response.data.data.totalElements || 0;
        }
      } catch (error) {
        console.error('팔로워 개수 조회 실패:', error);
        followersCount.value = 0;
      }
    };

    const fetchFollowingsCount = async () => {
      try {
        const response = await userAPI.getFollowingsCount();
        if (response.data && response.data.data) {
          followingsCount.value = response.data.data.totalElements || 0;
        }
      } catch (error) {
        console.error('팔로잉 개수 조회 실패:', error);
        followingsCount.value = 0;
      }
    };

    const searchType = ref('CONTENT');
    const searchKeyword = ref('');
    const currentPage = ref(0);
    const hasMore = ref(true);
    const isLoading = ref(false);

    const fetchDiaryList = async (page = 0, append = false) => {
      try {
        isLoading.value = true;
        let response;
        if (searchKeyword.value.trim()) {
          response = await postAPI.search(
            searchType.value,
            searchKeyword.value.trim(),
            { page, size: 9 },
          );
        } else {
          response = await postAPI.getMyPosts({ page, size: 9 });
        }
        if (response.data && response.data.data) {
          const newContent = response.data.data.content || [];
          if (append) {
            diaryList.value = [...diaryList.value, ...newContent];
          } else {
            diaryList.value = newContent;
          }
          hasMore.value = !response.data.data.last;
          currentPage.value = page;
        }
      } catch (error) {
        console.error('다이어리 목록 조회 실패:', error);
        if (!append) diaryList.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        !isLoading.value &&
        hasMore.value
      ) {
        fetchDiaryList(currentPage.value + 1, true);
      }
    };

    const viewDiary = diaryId => {
      if (diaryId) $router.push(`/diary/${diaryId}`);
    };

    const handleSearch = searchData => {
      $router.push({
        path: '/search',
        query: {
          searchType: searchData.searchType,
          keyword: searchData.keyword,
        },
      });
    };

    const handleClearSearch = () => {
      searchKeyword.value = '';
    };

    const handleChangeMainPet = async () => {
      // Re-fetch counts after main pet change, as it might affect profile info
      await Promise.all([
        authStore.fetchMyPageInfo(),
        petStore.fetchPets(),
        fetchPostsCount(),
        fetchFollowersCount(),
        fetchFollowingsCount(),
      ]);
    };

    const openFollowModal = type => {
      fetchFollowersCount();
      fetchFollowingsCount();
      isFollowModalVisible.value = true;
      nextTick(() => {
        if (type === 'followers' || type === 'followings') {
          followModalTab.value = type;
        }
      });
    };

    const closeFollowModal = () => {
      isFollowModalVisible.value = false;
    };

    const handleFollowUpdated = async () => {
      await Promise.all([fetchFollowersCount(), fetchFollowingsCount()]);
    };

    const handleUnfollowUpdated = async () => {
      await Promise.all([fetchFollowersCount(), fetchFollowingsCount()]);
    };

    onMounted(async () => {
      const hasPet = await validatePetAndRedirect($router);
      if (!hasPet) return;

      nextTick(async () => {
        try {
          if (!authStore.myPageInfo) {
            await authStore.fetchMyPageInfo();
          }
          if (petStore.pets.length === 0) {
            await petStore.fetchPets();
          }
          fetchPostsCount();
          fetchFollowersCount();
          fetchFollowingsCount();
          fetchDiaryList();
          window.addEventListener('scroll', handleScroll);
        } catch (error) {
          console.error('Error during onMounted data fetching:', error);
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      userInfo,
      mainPet,
      userPets,
      petBio,
      displayUserName,
      profileImageUrl,
      currentUserId,
      postsCount,
      followersCount,
      followingsCount,
      diaryList,
      isLoading,
      searchType,
      searchKeyword,
      isFollowModalVisible,
      followModalTab,
      viewDiary,
      openFollowModal,
      closeFollowModal,
      handleFollowUpdated,
      handleUnfollowUpdated,
      handleSearch,
      handleClearSearch,
      handleChangeMainPet,
    };
  },
};
</script>

<style scoped>
.diary-page {
  background: linear-gradient(135deg, #FFFAF0 0%, #FFF7EC 100%);
  min-height: 100vh;
  padding: 32px;
}

/* 반응형 */
@media (max-width: 768px) {
  .diary-page {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .diary-page {
    padding: 16px;
  }
}
</style>