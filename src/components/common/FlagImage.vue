<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLocalFlagPath, getFallbackFlagPath } from '@/utils/flagImages'

const props = defineProps<{
  countryCode: string
  emoji: string
  alt: string
  eager?: boolean
}>()

const imageLoaded = ref(false)
const showFallback = ref(true) // Start with emoji visible while image loads
const currentSrc = ref(getLocalFlagPath(props.countryCode))
const imgRef = ref<HTMLImageElement | null>(null)

function handleLoad() {
  imageLoaded.value = true
  showFallback.value = false
}

function handleError() {
  // Try PNG fallback if SVG failed
  if (currentSrc.value.endsWith('.svg')) {
    console.log(`SVG failed for ${props.countryCode}, trying PNG...`)
    currentSrc.value = getFallbackFlagPath(props.countryCode)
  } else {
    // Both SVG and PNG failed, stay on emoji
    console.warn(`Failed to load flag image for ${props.countryCode}, using emoji fallback`)
    showFallback.value = true
    imageLoaded.value = false
  }
}

// Force eager loading check on mount for debugging
onMounted(() => {
  if (imgRef.value?.complete && imgRef.value.naturalHeight !== 0) {
    handleLoad()
  }
})
</script>

<template>
  <div class="flag-image">
    <!-- Fallback emoji -->
    <span 
      v-if="showFallback" 
      class="flag-emoji"
      role="img"
      :aria-label="alt"
    >
      {{ emoji }}
    </span>
    
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

.flag-emoji {
  font-size: clamp(2rem, 8vw, 4.5rem);
  line-height: 1;
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
