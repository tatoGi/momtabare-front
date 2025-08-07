<script lang="ts" setup>
import img from "@/assets/img/rentalstepsimage.png"
import { onMounted, ref } from "vue"


const isMobile = ref(false)

const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkIfMobile()
  window.addEventListener('resize', checkIfMobile)
  return () => {
    window.removeEventListener('resize', checkIfMobile)
  }
})
</script>

<template>
  <div class="flex flex-col gap-7 md:flex-row md:items-end container">
    <!-- Title - First on mobile -->
    <div class="md:hidden flex flex-col gap-4">
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white first-title-rental">
        იქირავე შენთვის სასურველი
      </h2>
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white second-title-rental">
        აღჭურვილობა <span class="text-customRed">3 მარტივი</span> ნაბიჯით
      </h2>
    </div>

    <!-- Main Image -->
    <img :src="img" alt="Sporting Equipment"
      class="rounded-2xl w-full max-h-[573px] max-w-[464px] object-cover order-1 md:order-none rental-image" />

    <!-- Right Content -->
    <div class="flex flex-col gap-10 order-3 md:order-none content-rental">
      <!-- Title - Hidden on mobile, shown on md+ -->
      <div class="hidden md:block right-20 relative">
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
          იქირავე შენთვის სასურველი
        </h2>
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white justify-end pl-20">
          აღჭურვილობა <span class="text-customRed">3 მარტივი</span> ნაბიჯით
        </h2>
      </div>

      <!-- Description -->
      <p class="text-sm text-customBlack/80 dark:text-white/80 font-medium rental-description">
        მომთაბარე საშუალებას გაძლევს შენი მომდევნო თავგადასავლისთვის აუცილებელი სპორტული აღჭურვილობა სახლიდან
        გაუსვლელად, სულ რამდენიმე წუთში, პირდაპირ დანიშნულების ადგილას იქირაო.
      </p>

      <!-- Steps Section - Desktop -->
      <div class="hidden md:block bg-customRed rounded-2xl p-10" style="width: 792px; height: 343px;">
        <div class="flex flex-col gap-6 h-full justify-center">
          <!-- Step 1 -->
          <div class="flex items-start gap-4">
            <div class="text-white text-4xl font-bold leading-none">1</div>
            <div class="flex flex-col gap-1">
              <h3 class="text-white text-xl font-bold">შემოვიდი ანგარიში</h3>
              <p class="text-white text-sm opacity-90">შევაღე პირადი ინფორმაცია ბმული და გახდი მომხმარებელი.</p>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="flex items-start gap-4">
            <div class="text-white text-4xl font-bold leading-none">2</div>
            <div class="flex flex-col gap-1">
              <h3 class="text-white text-xl font-bold">შეარჩიე სასურველი პროდუქტი</h3>
              <p class="text-white text-sm opacity-90">შეარჩიე შენთვის სასურველი აღჭურვილობა ვებგვერდიდან კატალოგიდან.</p>
            </div>
          </div>
          
          <!-- Step 3 -->
          <div class="flex items-start gap-4">
            <div class="text-white text-4xl font-bold leading-none">3</div>
            <div class="flex flex-col gap-1">
              <h3 class="text-white text-xl font-bold">გადახდისა ოფლაინ</h3>
              <p class="text-white text-sm opacity-90">იქირავე ნივთი ნებისმიერი ტიპის საბანკო ბარათით და დარწმუნდი ახალი თავგადასავლისთვის მზადებაში.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
  
  <!-- Steps Section - Mobile (Full Width) -->
  <div class="md:hidden w-full bg-customRed rounded-2xl p-6 mt-6">
    <div class="flex flex-col gap-6">
      <!-- Step 1 -->
      <div class="flex items-start gap-4">
        <div class="text-white text-3xl font-bold leading-none">1</div>
        <div class="flex flex-col gap-1">
          <h3 class="text-white text-lg font-bold">შემოვიდი ანგარიში</h3>
          <p class="text-white text-sm opacity-90">შევაღე პირადი ინფორმაცია ბმული და გახდი მომხმარებელი.</p>
        </div>
      </div>
      
      <!-- Step 2 -->
      <div class="flex items-start gap-4">
        <div class="text-white text-3xl font-bold leading-none">2</div>
        <div class="flex flex-col gap-1">
          <h3 class="text-white text-lg font-bold">შეარჩიე სასურველი პროდუქტი</h3>
          <p class="text-white text-sm opacity-90">შეარჩიე შენთვის სასურველი აღჭურვილობა ვებგვერდიდან კატალოგიდან.</p>
        </div>
      </div>
      
      <!-- Step 3 -->
      <div class="flex items-start gap-4">
        <div class="text-white text-3xl font-bold leading-none">3</div>
        <div class="flex flex-col gap-1">
          <h3 class="text-white text-lg font-bold">გადახდისა ოფლაინ</h3>
          <p class="text-white text-sm opacity-90">იქირავე ნივთი ნებისმიერი ტიპის საბანკო ბარათით და დარწმუნდი ახალი თავგადასავლისთვის მზადებაში.</p>
        </div>
      </div>
    </div>
  </div>
  
</template>
