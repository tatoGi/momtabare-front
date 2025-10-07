<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import {Input, PasswordInput} from "@/components/ui/input"
import {EAuthStep} from "@/ts/auth.types.js"
import type { ISignInParams } from "@/ts/services/auth.types.ts"
import {signIn} from "@/services/auth.ts"
import { getUser } from "@/services/user"
import {useUserStore} from "@/pinia/user.pinia.ts"
import { ref, watch, type Ref } from 'vue'


const userStore = useUserStore()
// Router no longer needed for login

const emit = defineEmits(["nextStep", "close", "loading"])

const isLoading: Ref<boolean> = ref(false)

// Watch for loading state changes and emit them to parent
watch(isLoading, (newVal: boolean) => {
  emit('loading', newVal)
}, { immediate: true })

const emailOrPhone = ref<string>("")
const password = ref<string>("")

async function handleSignIn(): Promise<void> {
  try {
    isLoading.value = true
    const payload: ISignInParams = {
      password: password.value,
      email: emailOrPhone.value.includes('@') ? emailOrPhone.value : undefined,
      phone_number: !emailOrPhone.value.includes('@') ? emailOrPhone.value : undefined
    }

    if (emailOrPhone.value.includes("@")) {
      payload.email = emailOrPhone.value
    } else {
      payload.phone_number = emailOrPhone.value
    }

    const data = await signIn(payload)
    
    // If backend returns success: false, surface the message
    if (!data || data.success === false) {
      const msg = data?.message || 'Sign in failed'
      throw new Error(msg)
    }
    
    // Extract tokens from the response
    const token = data.token || data.data?.token || data.access_token || data.data?.access_token
    const refreshToken = data.refresh_token || data.data?.refresh_token
    
    if (!token) {
      throw new Error('No authentication token received')
    }
    
    // Get user data (either from response or fetch separately)
    let user = data.data?.user  
    if (!user) {
      const fetchedUser = await getUser()
      if (!fetchedUser) {
        throw new Error('Login succeeded but user data not available')
      }
      user = fetchedUser
    }
    
    // Store both access and refresh tokens
    // Use the new authentication method to properly set up the user session
    await userStore.setAuthenticatedUser(user, token, refreshToken)
    
    // Close the dialog
    emit("close")
    
    // Authentication state is managed by Pinia store - no need to reload
  } catch (err) {
    const message = typeof err === 'string' ? err : (err as any)?.message || 'Invalid email or password. Please try again.'
    alert(message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Mobile Layout -->
  <div class="block lg:hidden">
    <div class="flex flex-col min-h-[544px] px-6 py-8">
      <!-- Title -->
      <h2 class="font-uppercase text-xl font-extrabold dark:text-white mb-8 text-center">
        ავტორიზაცია
      </h2>

      <!-- Sign In Form -->
      <form @submit.prevent="handleSignIn" class="flex-grow flex flex-col">
        <div class="flex flex-col gap-5 mb-6">
          <Input 
            v-model="emailOrPhone" 
            placeholder="ელ.ფოსტა ან ტელეფონი"
            class="h-12"
          />
          <PasswordInput 
            v-model="password"
            class="h-12"
          />
        </div>

        <!-- Forgot Password Link -->
        <p class="cursor-pointer text-sm text-customBlue underline hover:text-customRed mb-6 text-left">
          პაროლის აღდგენა
        </p>

        <!-- Sign In Button -->
        <BaseButton
            :height="48"
            :loader="isLoading"
            class="rounded-full bg-customRed w-full mb-8"
        >
          <p class="font-uppercase text-sm font-bold text-white">შესვლა</p>
        </BaseButton>

        <!-- Divider -->
        <div class="relative h-[1px] bg-customBlack/10 dark:bg-white/10 mb-6">
          <div class="flex-center absolute-center absolute h-7 w-12 rounded-full bg-white dark:bg-gray-900">
            <p class="font-uppercase text-xs font-medium dark:text-white">ან</p>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div class="flex flex-col gap-4 mb-8">
          <BaseButton
              :height="48"
              class="border border-customBlack/10 dark:border-white/10 px-6 justify-start"
          >
            <img alt="Google" src="../../assets/svg/google-colored.svg" class="w-5 h-5 mr-3"/>
            <p class="text-sm font-medium dark:text-white">
              გააგრძელე Google-ით
            </p>
          </BaseButton>

          <BaseButton
              :height="48"
              class="border border-customBlack/10 dark:border-white/10 px-6 justify-start"
          >
            <img alt="Facebook" src="../../assets/svg/facebook-colored.svg" class="w-5 h-5 mr-3"/>
            <p class="text-sm font-medium dark:text-white">
              გააგრძელე Facebook-ით
            </p>
          </BaseButton>
        </div>
      </form>

      <!-- Bottom Section -->
      <div class="mt-auto">
        <p class="text-sm font-medium dark:text-white text-center mb-4">არ გაქვს ანგარიში?</p>
        <BaseButton
            :height="48"
            class="bg-black dark:bg-white w-full rounded-lg mb-6"
            @click.left="emit('nextStep', { nextStep: EAuthStep.SIGN_UP_EMAIL })"
        >
          <p class="font-uppercase text-sm font-bold text-white dark:text-black">
            შექმენი ანგარიში
          </p>
        </BaseButton>
        
        <!-- Branding -->
        <div class="flex justify-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">momtabare.ge</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop Layout -->
  <div class="hidden lg:flex h-[544px]">
    <!-- Left Section - Welcome/Sign Up -->
    <section class="flex w-[45%] flex-col bg-customGrey dark:bg-customDarkGrey px-7 py-9">
      <div class="flex flex-grow flex-col justify-center gap-4 text-center">
        <p class="text-sm font-medium dark:text-white leading-relaxed">
          შექმენი ანგარიში, იქირავე ან გააქირავე სალაშქრო და სათხილამურო
          აქსესუარები.
        </p>
        <p class="text-sm font-bold text-customRed">ისიამოვნე ცხოვრებით!</p>
      </div>
      <div class="flex flex-col items-center gap-3">
        <p class="text-sm font-medium dark:text-white">არ გაქვს ანგარიში?</p>
        <BaseButton
            :height="48"
            :width="196"
            class="bg-customBlue"
            @click.left="emit('nextStep', { nextStep: EAuthStep.SIGN_UP_EMAIL })"
        >
          <p class="font-uppercase text-sm font-bold text-white">
            შექმენი ანგარიში
          </p>
        </BaseButton>
      </div>
    </section>

    <!-- Right Section - Sign In Form -->
    <section class="flex w-[55%] flex-col justify-between px-8 pb-9 pt-20">
      <div class="flex-grow">
        <h2 class="font-uppercase text-xl font-extrabold dark:text-white mb-6">
          ავტორიზაცია
        </h2>

        <form @submit.prevent="handleSignIn" class="space-y-5">
          <div class="flex flex-col gap-5">
            <Input v-model="emailOrPhone" placeholder="ელ.ფოსტა ან ტელეფონი"/>
            <PasswordInput v-model="password"/>
          </div>

          <div class="flex items-center justify-between pt-2">
            <p class="cursor-pointer text-sm text-customBlue underline hover:text-customRed">
              პაროლის აღდგენა
            </p>

            <BaseButton
                :height="48"
                :loader="isLoading"
                :width="112"
                class="rounded-full bg-customRed"
            >
              <p class="font-uppercase text-sm font-bold text-white">შესვლა</p>
            </BaseButton>
          </div>
        </form>
      </div>
      
      <!-- Divider -->
      <div class="relative h-[1px] bg-customBlack/10 dark:bg-white/10 my-8">
        <div class="flex-center absolute-center absolute h-7 w-12 rounded-full bg-white dark:bg-gray-900">
          <p class="font-uppercase text-xs font-medium dark:text-white">ან</p>
        </div>
      </div>
      
      <!-- Social Login Buttons -->
      <div class="flex flex-col gap-4">
        <BaseButton
            :height="48"
            class="border border-customBlack/10 dark:border-white/10 px-6 justify-start"
        >
          <img alt="Facebook" src="../../assets/svg/facebook-colored.svg"/>
          <p class="flex-grow text-sm font-medium dark:text-white ml-3">
            გააგრძელე Facebook-ით
          </p>
        </BaseButton>

        <BaseButton
            :height="48"
            class="flex items-center border border-customBlack/10 dark:border-white/10 px-6 justify-start"
        >
          <img alt="Google" src="../../assets/svg/google-colored.svg"/>
          <p class="flex-grow text-sm font-medium dark:text-white ml-3">
            გააგრძელე Google-ით
          </p>
        </BaseButton>
      </div>
    </section>
  </div>
</template>
