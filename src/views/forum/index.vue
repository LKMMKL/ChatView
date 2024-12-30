<script setup lang='ts'>
import { Information } from './Information'
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <main class="flex-1 overflow-hidden">
      <div
        id="scrollRef"
        ref="scrollRef"
        class="h-full overflow-hidden overflow-y-auto bg-gray-800"
      >
        <div>
          <Information />
        </div>
      </div>
    </main>
  </div>
</template>
