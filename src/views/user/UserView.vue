<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCard from "@/components/base/BaseCard.vue"
import type { IUser } from "@/ts/models/user-types"
import type { IUserCard } from "@/ts/models/user-types"
import {signOut} from "@/services/auth.js"
import {useUserStore} from "@/pinia/user.pinia.js"
import {computed} from "vue"
import {useRouter} from "vue-router"
import {requestRetailerPermission} from "@/services/retailer.ts";

const router = useRouter()

const userStore = useUserStore()
const retailerCards: IUserCard[] = [
  {
    icon: "add_circle",
    title: "დაამატე განცხადება",
    description: "დაამატე პროდუქცია რამდენიმე კლიკით",
    name: "addProduct",
  },
  {
    icon: "storefront",
    title: "პირადი ინფორმაცია",
    description: "პირადი ინფორმაციის სრული რედაქტირება",
    name: "myShop",
  },
  {
    icon: "shopping_bag",
    title: "პირადი ინფორმაცია",
    description: "პირადი ინფორმაციის სრული რედაქტირება",
    name: "myListings",
  },
  {
    icon: "payments",
    title: "პირადი ინფორმაცია",
    description: "პირადი ინფორმაციის სრული რედაქტირება",
    name: "transactions",
  },
]

const userCards: IUserCard[] = [
  {
    icon: "account_circle",
    title: "პირადი ინფორმაცია",
    description: "პირადი ინფორმაციის სრული რედაქტირება",
    name: "userInfo",
  },
  {
    icon: "chat_bubble",
    title: "შეტყობინებები",
    description: "მიღებული და გაგზავნილი შეყობინებები ",
    name: "notifications",
  },
  {
    icon: "update",
    title: "ჩემი შეკვეთები",
    description: "თქვენ მიერ ნაქირავები პროდუქცია",
    name: "userOrders",
  },
  {
    icon: "location_on",
    title: "ჩემი მისამართები",
    description: "მისამართები საიდანაც აქირავებთ პროდუქციას",
    name: "userAddresses",
  },
  {
    icon: "logout",
    title: "გასვლა",
    description: "პროფილის დატოვება",
    name: "logout",
  },
]

const user = computed<IUser>(() => userStore.getUser as IUser)
const fullName = computed<string>(
    () => user.value?.first_name + " " + user.value?.last_name,
)

async function handleSignOut(): Promise<void> {
  await signOut()
  await router.push("/home")
  userStore.setUser(null)
}

function handleCardClick(name: string): void {
  switch (name) {
    case "logout":
      handleSignOut()
      break
    case "userOrders":
      router.push("/user/orders")
      break
    case "userInfo":
      router.push("/user/info")
      break
    case "userAddresses":
      router.push("/user/addresses")
      break
    case "addProduct":
      router.push("/add-retailer-product")
      break
    case "myShop":
      router.push("/retailer-info")
      break
      // case "myListings":
      //   router.push("/user/info")
      //   break
      // case "transactions":
      //   router.push("/user/addresses")
      //   break
  }
}
</script>

<template>
  <main class="pb-20 flex flex-col gap-3">
    <BaseBreadcrumbs :path="['ჩემი პროფილი']" disable-route/>
    <div class="flex flex-col gap-10">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1.5">
          <h2
              class="text-customRed dark:text-white text-xl font-extrabold font-uppercase"
          >
            ჩემი პროფილი
          </h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70 font-medium">
            <span class="text-customBlack dark:text-white font-bold">
              {{ fullName }}
            </span>
            , მართე შენი გვერდი მარტივად
          </p>
        </div>
        <BaseButton
            :height="36"
            :width="205"
            class="bg-customBlue text-white text-xs font-bold font-uppercase"
            @click.left="requestRetailerPermission"
        >
          გახდი გამქირავებელი
        </BaseButton>
      </div>

      <section v-if="user.is_retailer" class="flex flex-col gap-4">
        <h2
            class="text-customBlack dark:text-white text-xl font-extrabold font-uppercase"
        >
          გამქირავებელი
        </h2>

        <div class="grid grid-cols-4 items-center gap-7">
          <BaseCard
              v-for="userCard in retailerCards"
              :description="userCard.description"
              :height="139"
              :icon="userCard.icon"
              :title="userCard.title"
              @click.left="handleCardClick(userCard.name)"
          />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2
            class="text-customBlack dark:text-white text-xl font-extrabold font-uppercase"
        >
          მომხმარებელი
        </h2>

        <div class="grid grid-cols-4 items-center gap-7">
          <BaseCard
              v-for="userCard in userCards"
              :description="userCard.description"
              :height="139"
              :icon="userCard.icon"
              :title="userCard.title"
              @click.left="handleCardClick(userCard.name)"
          />
        </div>
      </section>
    </div>
  </main>
</template>
