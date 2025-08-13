<template>
  <div class="pet-register-container">
    <v-container fluid class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold text-primary mb-6">반려동물 등록</h1>
          <p class="text-body-1 text-grey-darken-1 mb-8">
            우리 아이의 정보를 등록해주세요
          </p>
          
          <v-card>
            <v-card-text class="pa-6">
              <v-form>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      label="반려동물 이름"
                      variant="outlined"
                      prepend-inner-icon="mdi-paw"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      label="종류"
                      variant="outlined"
                      prepend-inner-icon="mdi-dog"
                      :items="['강아지', '고양이', '기타']"
                      class="mb-4"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      label="품종"
                      variant="outlined"
                      prepend-inner-icon="mdi-tag"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      label="나이"
                      variant="outlined"
                      prepend-inner-icon="mdi-cake"
                      type="number"
                      class="mb-4"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      label="특이사항"
                      variant="outlined"
                      prepend-inner-icon="mdi-note"
                      rows="3"
                      class="mb-6"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" class="text-center">
                    <v-btn
                      color="primary"
                      size="large"
                      class="mr-4"
                    >
                      <v-icon left>mdi-plus</v-icon>
                      반려동물 등록
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="large"
                    >
                      취소
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'PetRegisterPage'
}
</script>

<style lang="scss" scoped>
.pet-register-container {
  min-height: calc(100vh - 68px);
  background: linear-gradient(135deg, rgba(255, 154, 139, 0.05) 0%, rgba(168, 230, 207, 0.05) 100%);
}
</style>
