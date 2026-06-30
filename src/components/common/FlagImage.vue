<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getLocalFlagPath, getFallbackFlagPath } from '@/utils/flagImages'
import { flagLoader } from '@/services/flagLoader'

const props = defineProps<{
  countryCode: string
  emoji: string
  alt: string
  eager?: boolean
  showSkeleton?: boolean
}>()

const imageLoaded = ref(false)
const imageLoading = ref(true) // Track if image is still loading
const showFallback = ref(!props.showSkeleton) // Start with emoji visible only if skeleton is disabled
const currentSrc = ref<string>(getLocalFlagPath(props.countryCode)) // Initialize with direct path
const imgRef = ref<HTMLImageElement | null>(null)

// Determine what to show based on loading state and props
const showSkeletonPlaceholder = computed(() => {
  return props.showSkeleton && imageLoading.value && !imageLoaded.value
})

const showEmojiPlaceholder = computed(() => {
  return false // Never show emoji fallback
})

// Show subtle loading indicator when image is loading (and skeleton is disabled)
const showLoadingIndicator = computed(() => {
  return false // Never show emoji loading indicator
})

function handleLoad() {
  imageLoaded.value = true
  imageLoading.value = false
  showFallback.value = false
}

function handleError() {
  // Try PNG fallback if SVG failed
  if (currentSrc.value.endsWith('.svg') || currentSrc.value.startsWith('blob:')) {
    console.log(`SVG failed for ${props.countryCode}, trying PNG...`)
    currentSrc.value = getFallbackFlagPath(props.countryCode)
  } else {
    // Both SVG and PNG failed, show placeholder (no emoji)
    console.warn(`Failed to load flag image for ${props.countryCode}`)
    imageLoading.value = false
    showFallback.value = false
    imageLoaded.value = false
  }
}

// Initialize image source on mount
// Try to use preloaded blob URL from FlagLoader, fall back to direct path
onMounted(async () => {
  // Check if flag is preloaded in cache
  if (flagLoader.isCached(props.countryCode)) {
    try {
      const blobUrl = await flagLoader.load(props.countryCode)
      if (blobUrl) {
        // Replace with blob URL if available
        currentSrc.value = blobUrl
      }
      // else: keep using direct path (already set in ref initialization)
    } catch (error) {
      console.warn(`Failed to load preloaded flag ${props.countryCode}, using direct path`, error)
      // Keep using direct path (already set)
    }
  }
  // else: no preload available, keep using direct path (already set)

  // Check if image already loaded (for cached browser images)
  if (imgRef.value?.complete && imgRef.value.naturalHeight !== 0) {
    handleLoad()
  }
})
</script>

<template>
  <div class="flag-image">
    <!-- Skeleton loading placeholder -->
    <div 
      v-if="showSkeletonPlaceholder" 
      class="flag-skeleton"
      role="status"
      aria-label="Loading flag image"
    />
    
    <!-- Empty placeholder when image fails to load -->
    <div
      v-if="!imageLoaded && !imageLoading"
      class="flag-placeholder"
      role="img"
      :aria-label="alt"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>
    
    <!-- Local flag image -->
    <img
      ref="imgRef"
      v-show="imageLoaded"
      :src="currentSrc"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      class="flag-img"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>

<style scoped>
.flag-image {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.flag-skeleton {
  width: 100%;
  height: 100%;
  min-width: 4rem;
  min-height: 3rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 0.375rem;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.flag-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.375rem;
  color: #9ca3af;
}

.flag-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  border-radius: 0.375rem;
}
</style>
