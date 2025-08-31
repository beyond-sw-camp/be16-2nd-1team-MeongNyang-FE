<template>
  <div class="diary-page">
    <SearchComponent
      v-model="searchKeyword"
      :search-type="searchType"
      @update:search-type="searchType = $event"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <DiaryProfileSection
      :user-info="isMyProfile ? userInfo : otherUserInfo"
      :posts-count="postsCount"
      :followers-count="followersCount"
      :followings-count="followingsCount"
      :main-pet="mainPet"
      :user-pets="isMyProfile ? userPets : otherUserPets"
      :profile-image-url="profileImageUrl"
      :display-user-name="displayUserName"
      :pet-bio="petBio"
      :is-my-profile="isMyProfile"
      :is-following="isFollowing"
      @open-follow-modal="openFollowModal"
      @change-main-pet="handleChangeMainPet"
      @follow="handleFollow"
      @unfollow="handleUnfollow"
    />
    
    <DiaryGridDisplay
      :diary-list="diaryList"
      :is-loading="isLoading"
      @view-diary="viewDiary"
    />
    
    <FollowModal
      :is-visible="isFollowModalVisible"
      :user-id="targetUserId"
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePetStore } from '@/stores/pet';
import { postAPI, userAPI, petAPI } from '@/services/api';
import { validatePetAndRedirect } from '@/utils/petValidation';
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
  props: {
    userId: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const router = useRouter();
    const authStore = useAuthStore();
    const petStore = usePetStore();

    const loggedInUserId = computed(() => authStore.user?.id);
    const isMyProfile = computed(() => props.userId == null);
    const targetUserId = computed(() => isMyProfile.value ? loggedInUserId.value : props.userId);

    const userInfo = computed(() => authStore.myPageInfo);
    const userPets = computed(() => petStore.pets);
    const otherUserInfo = ref(null);
    const otherUserPets = ref([]);

    const isFollowing = ref(false);
    const isFollowModalVisible = ref(false);
    const followModalTab = ref('followers');

    const postsCount = ref(0);
    const followersCount = ref(0);
    const followingsCount = ref(0);
    const diaryList = ref([]);

    const mainPet = computed(() => {
      const pets = isMyProfile.value ? userPets.value : otherUserPets.value;
      if (!pets || pets.length === 0) return null;
      const info = isMyProfile.value ? userInfo.value : otherUserInfo.value;
      const mainPetId = info?.mainPetId;
      if (mainPetId) {
        const pet = pets.find(p => p.id === mainPetId);
        if (pet) return pet;
      }
      return pets[0];
    });

    const profileImageUrl = computed(() => {
       const info = isMyProfile.value ? userInfo.value : otherUserInfo.value;
      if (info?.mainPetImage) return info.mainPetImage;
      if (mainPet.value?.url) return mainPet.value.url;
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=120&fit=crop&crop=center';
    });

    const displayUserName = computed(() => {
      const info = isMyProfile.value ? userInfo.value : otherUserInfo.value;
      return info?.nickname || '사용자';
    });

    const petBio = computed(() => {
      return mainPet.value?.introduce || '반려동물과 함께하는 특별한 순간들을 기록해보세요!';
    });

    const searchType = ref('CONTENT');
    const searchKeyword = ref('');
    const currentPage = ref(0);
    const hasMore = ref(true);
    const isLoading = ref(false);

    const fetchData = async () => {
      if (isMyProfile.value) {
        await Promise.all([
          authStore.fetchMyPageInfo(),
          petStore.fetchPets(),
        ]);
      } else {
        if (!targetUserId.value) return;
        const userPagePromise = userAPI.getUserPage(targetUserId.value);
        const userPetsPromise = petAPI.getOtherUserPets(targetUserId.value);
        const [userPageResponse, userPetsResponse] = await Promise.all([userPagePromise, userPetsPromise]);

        if (userPageResponse.data && userPageResponse.data.data) {
            otherUserInfo.value = userPageResponse.data.data;
        }
        if (userPetsResponse.data && userPetsResponse.data.data) {
            otherUserPets.value = userPetsResponse.data.data.pets || [];
        }
      }

      await Promise.all([
        fetchPostsCount(),
        fetchFollowersCount(),
        fetchFollowingsCount(),
        fetchDiaryList(0, false),
      ]);

      if (!isMyProfile.value) {
        await checkFollowStatus();
      }
    };

    const fetchPostsCount = async () => {
      try {
        const apiCall = isMyProfile.value ? postAPI.getMyPosts : (params) => postAPI.getUserPosts(targetUserId.value, params);
        const response = await apiCall({ page: 0, size: 1 });
        postsCount.value = response.data.data.totalElements || 0;
      } catch (error) {
        console.error('게시물 개수 조회 실패:', error);
        postsCount.value = 0;
      }
    };

    const fetchFollowersCount = async () => {
      try {
        const apiCall = isMyProfile.value ? userAPI.getFollowersCount : () => userAPI.getUserFollowersCount(targetUserId.value);
        const response = await apiCall();
        followersCount.value = response.data.data.totalElements || 0;
      } catch (error) {
        console.error('팔로워 개수 조회 실패:', error);
        followersCount.value = 0;
      }
    };

    const fetchFollowingsCount = async () => {
      try {
        const apiCall = isMyProfile.value ? userAPI.getFollowingsCount : () => userAPI.getUserFollowingsCount(targetUserId.value);
        const response = await apiCall();
        followingsCount.value = response.data.data.totalElements || 0;
      } catch (error) {
        console.error('팔로잉 개수 조회 실패:', error);
        followingsCount.value = 0;
      }
    };

    const fetchDiaryList = async (page = 0, append = false) => {
      if (isLoading.value) return;
      isLoading.value = true;
      try {
        let response;
        const params = { page, size: 9 };
        if (searchKeyword.value.trim()) {
          response = await postAPI.search(searchType.value, searchKeyword.value.trim(), params);
        } else {
          const apiCall = isMyProfile.value ? postAPI.getMyPosts : (p) => postAPI.getUserPosts(targetUserId.value, p);
          response = await apiCall(params);
        }
        const newContent = response.data.data.content || [];
        diaryList.value = append ? [...diaryList.value, ...newContent] : newContent;
        hasMore.value = !response.data.data.last;
        currentPage.value = page;
      } catch (error) {
        console.error('다이어리 목록 조회 실패:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const checkFollowStatus = async () => {
      try {
        const response = await userAPI.checkFollowStatus(targetUserId.value);
        isFollowing.value = response.data.data.isFollowing || false;
      } catch (error) {
        console.error('팔로우 상태 확인 실패:', error);
      }
    };

    const handleFollow = async () => {
      try {
        await userAPI.follow(targetUserId.value);
        isFollowing.value = true;
        followersCount.value++;
      } catch (error) {
        console.error('팔로우 실패:', error);
      }
    };

    const handleUnfollow = async () => {
      try {
        await userAPI.unfollow(targetUserId.value);
        isFollowing.value = false;
        followersCount.value--;
      } catch (error) {
        console.error('언팔로우 실패:', error);
      }
    };

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading.value && hasMore.value) {
        fetchDiaryList(currentPage.value + 1, true);
      }
    };

    const viewDiary = diaryId => router.push(`/diary/${diaryId}`);

    const handleSearch = searchData => {
      router.push({ path: '/search', query: { searchType: searchData.searchType, keyword: searchData.keyword } });
    };

    const handleClearSearch = () => {
      searchKeyword.value = '';
      fetchDiaryList(0, false);
    };

    const handleChangeMainPet = async () => {
      await fetchData();
    };

    const openFollowModal = type => {
      followModalTab.value = type;
      isFollowModalVisible.value = true;
    };

    const closeFollowModal = () => isFollowModalVisible.value = false;

    const handleFollowUpdated = () => fetchFollowersCount();
    const handleUnfollowUpdated = () => fetchFollowersCount();

    onMounted(async () => {
      if (isMyProfile.value) {
        const hasPet = await validatePetAndRedirect(router);
        if (!hasPet) return;
      }
      await fetchData();
      window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    watch(() => props.userId, async (newVal, oldVal) => {
        if (newVal !== oldVal) {
            await fetchData();
        }
    });

    return {
      isMyProfile,
      userInfo,
      otherUserInfo,
      postsCount,
      followersCount,
      followingsCount,
      mainPet,
      userPets,
      otherUserPets,
      profileImageUrl,
      displayUserName,
      petBio,
      diaryList,
      isLoading,
      searchType,
      searchKeyword,
      isFollowModalVisible,
      followModalTab,
      targetUserId,
      isFollowing,
      viewDiary,
      openFollowModal,
      closeFollowModal,
      handleFollowUpdated,
      handleUnfollowUpdated,
      handleSearch,
      handleClearSearch,
      handleChangeMainPet,
      handleFollow,
      handleUnfollow,
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