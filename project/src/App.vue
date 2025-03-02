<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const currentRoute = router.currentRoute;
console.log(currentRoute,'currentRoute')
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex space-x-8">
              <router-link 
                to="/home" 
                class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[
                  currentRoute?.value?.path === '/home'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                首页
              </router-link>
              <router-link 
                to="/flowChart" 
                class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[
                  currentRoute?.value?.path === '/flowChart'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                流程图
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>
#app {
  max-width: none;
  margin: 0;
  padding: 0;
  text-align: left;
}

body {
  margin: 0;
  padding: 0;
}

@keyframes ant-line {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
