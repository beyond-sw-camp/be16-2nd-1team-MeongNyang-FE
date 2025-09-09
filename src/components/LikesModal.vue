<template>
  <v-dialog v-model="show" max-width="450" persistent>
    <v-card class="likes-modal" rounded="xl">
      <!-- 모달 헤더 -->
      <v-toolbar color="surface" density="compact">
        <!-- <v-btn icon="mdi-close" @click="closeModal" variant="text" /> -->
        <v-btn icon="mdi-close" @click="closeModal" variant="text" flat class="no-styles-btn" color="#FF8B8B" />
        <v-toolbar-title class="text-center font-weight-bold text-h6">
          좋아요
        </v-toolbar-title>
        <v-spacer />
      </v-toolbar>

      <!-- 모달 내용 -->
      <v-card-text class="pa-0">
        <v-list v-if="likesList.length > 0" lines="two" class="likes-list pa-0">
          <v-list-item
            v-for="(like, index) in likesList"
            :key="like.userId || index"
            class="like-item"
            @click="goToUserDiary(like.userId)"
          >
            <template #prepend>
              <v-avatar
                size="48"
                class="like-avatar"
                :image="like.profileImage || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=48&h=48&fit=crop&crop=center'"
              />
            </template>

            <v-list-item-title class="font-weight-semibold like-username">
              {{ like.userName || like.username || like.petName || '익명' }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ like.nickname || like.realName }}
            </v-list-item-subtitle>

            <template #append>
              <v-btn
                v-if="like.userId !== currentUserId"
                :color="like.isFollowing ? 'grey' : '#FF8B8B'"
                :variant="like.isFollowing ? 'outlined' : 'elevated'"
                size="small"
                class="follow-btn"
                :class="{ 'follow-btn-active': !like.isFollowing }"
                @click.stop="toggleFollow(like)"
                :loading="isFollowLoading(like.userId)"
              >
                {{ like.isFollowing ? '팔로잉' : '팔로우' }}
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <!-- 좋아요 목록이 없을 때 -->
        <div v-else class="empty-likes">
          <v-icon size="64" color="grey-lighten-2">mdi-heart-outline</v-icon>
          <p class="text-h6 font-weight-medium mt-6 mb-2">
            아직 좋아요가 없습니다
          </p>
          <p class="text-body-2 text-grey">첫 번째 좋아요를 눌러보세요!</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'LikesModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    likesList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'follow-toggle'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const router = useRouter();
    const followLoadingMap = ref(new Map());

    const currentUserId = computed(() => authStore.user?.userId);

    const show = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        emit('update:modelValue', value);
      },
    });

    const closeModal = () => {
      show.value = false;
    };

    const goToUserDiary = userId => {
      if (userId && !isFollowLoading(userId)) {
        if (userId === currentUserId.value) {
          router.push(`/diarys`);
        } else {
          router.push(`/diarys/${userId}`);
        }
        closeModal();
      }
    };

    const toggleFollow = user => {
      if (followLoadingMap.value.get(user.userId)) return;

      followLoadingMap.value.set(user.userId, true);

      emit('follow-toggle', {
        userId: user.userId,
        isFollowing: user.isFollowing,
        user: user,
      });

      setTimeout(() => {
        followLoadingMap.value.set(user.userId, false);
      }, 1000);
    };

    const isFollowLoading = userId => {
      return followLoadingMap.value.get(userId) || false;
    };

    return {
      show,
      closeModal,
      goToUserDiary,
      toggleFollow,
      isFollowLoading,
      currentUserId,
    };
  },
};
</script>

<style scoped>
.no-styles-btn {
  background-color: transparent !important; /* 배경색을 투명하게 만듭니다. */
  box-shadow: none !important; /* 그림자를 완전히 제거합니다. */
  padding: 0 !important; /* 내부 패딩을 제거합니다. */
  min-width: unset !important; /* 최소 너비를 제거하여 아이콘 크기에 맞춥니다. */
  height: unset !important; /* 높이를 제거하여 아이콘 크기에 맞춥니다. */
  border-radius: 0 !important; /* 테두리 둥글기를 제거합니다. */
}

/* 호버 시 배경색도 투명하게 유지하려면 다음을 추가할 수 있습니다. */
.no-styles-btn:hover::before,
.no-styles-btn:focus::before {
  background-color: transparent !important;
}

.likes-modal {
  border: 1px solid var(--v-theme-outline-variant);
}

.v-toolbar-title {
  flex: 1 1 auto;
}

.likes-list {
  max-height: 400px;
  overflow-y: auto;
}

.like-item {
  padding: 12px 24px !important;
  transition: background-color 0.2s ease;
}

.like-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.like-avatar {
  border: 2px solid var(--v-theme-outline);
  transition: all 0.2s ease;
}

.like-item:hover .like-avatar {
  border-color: var(--v-theme-primary);
  transform: scale(1.05);
}

.like-username {
  cursor: pointer;
  transition: color 0.2s ease;
}

.like-item:hover .like-username {
  color: var(--v-theme-primary);
}

.follow-btn {
  min-width: 90px;
  border-radius: var(--v-border-radius-lg);
}

.follow-btn-active {
  color: white !important;
}

.empty-likes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background-color: var(--v-theme-surface-variant);
}

/* 스크롤바 스타일 */
.likes-list::-webkit-scrollbar {
  width: 6px;
}

.likes-list::-webkit-scrollbar-track {
  background: transparent;
}

.likes-list::-webkit-scrollbar-thumb {
  background: var(--v-theme-outline-variant);
  border-radius: 3px;
}

.likes-list::-webkit-scrollbar-thumb:hover {
  background: var(--v-theme-secondary);
}
</style>

