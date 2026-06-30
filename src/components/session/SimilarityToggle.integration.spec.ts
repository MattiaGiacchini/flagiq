import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SessionSetupPanel from './SessionSetupPanel.vue'
import { useSessionStore } from '@/stores/session'
import type { SessionConfig } from '@/types/session'

/**
 * Integration tests for SimilarityToggle within SessionSetupPanel
 * Task 14.1: Add similarity toggle to session configuration components
 * Requirements: 6.8
 */
describe('SessionSetupPanel - SimilarityToggle Integration', () => {
  let router: any
  
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()
    
    // Create a mock router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } },
        { path: '/play', component: { template: '<div></div>' } }
      ]
    })
  })

  describe('SimilarityToggle component presence', () => {
    it('should render SimilarityToggle component', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const similarityToggle = wrapper.findComponent({ name: 'SimilarityToggle' })
      expect(similarityToggle.exists()).toBe(true)
    })

    it('should initialize similarityEnabled to false by default', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const vm = wrapper.vm as any
      expect(vm.similarityEnabled).toBe(false)
    })

    it('should pass similarityEnabled state to SimilarityToggle', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const similarityToggle = wrapper.findComponent({ name: 'SimilarityToggle' })
      expect(similarityToggle.props('modelValue')).toBe(false)
    })
  })

  describe('State persistence and restoration', () => {
    it('should restore similarityEnabled from saved config', () => {
      const savedConfig: SessionConfig = {
        continents: ['europe', 'asia'],
        mode: 'name-it',
        count: 25,
        blitz: false,
        useSimilarity: true
      }
      localStorage.setItem('flagiq:sessionConfig', JSON.stringify(savedConfig))
      
      const pinia = createPinia()
      setActivePinia(pinia)
      
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router, pinia]
        }
      })
      
      const vm = wrapper.vm as any
      expect(vm.similarityEnabled).toBe(true)
      
      const similarityToggle = wrapper.findComponent({ name: 'SimilarityToggle' })
      expect(similarityToggle.props('modelValue')).toBe(true)
    })

    it('should default to false when useSimilarity is not in saved config', () => {
      const savedConfig: SessionConfig = {
        continents: ['europe', 'asia'],
        mode: 'name-it',
        count: 25,
        blitz: false
        // useSimilarity not included
      }
      localStorage.setItem('flagiq:sessionConfig', JSON.stringify(savedConfig))
      
      const pinia = createPinia()
      setActivePinia(pinia)
      
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router, pinia]
        }
      })
      
      const vm = wrapper.vm as any
      expect(vm.similarityEnabled).toBe(false)
    })
  })

  describe('Session configuration integration', () => {
    it('should include useSimilarity in currentConfig when starting session', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const vm = wrapper.vm as any
      const sessionStore = useSessionStore()
      
      // Set up valid configuration
      vm.selectedMode = 'name-it'
      vm.selectedContinents = ['europe']
      vm.similarityEnabled = true
      await wrapper.vm.$nextTick()
      
      // Trigger session start
      vm.handleStart()
      
      // Verify the config was saved with useSimilarity
      expect(sessionStore.config.useSimilarity).toBe(true)
    })

    it('should save useSimilarity=false when toggle is off', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const vm = wrapper.vm as any
      const sessionStore = useSessionStore()
      
      // Set up valid configuration
      vm.selectedMode = 'name-it'
      vm.selectedContinents = ['europe']
      vm.similarityEnabled = false
      await wrapper.vm.$nextTick()
      
      // Trigger session start
      vm.handleStart()
      
      // Verify the config was saved with useSimilarity=false
      expect(sessionStore.config.useSimilarity).toBe(false)
    })

    it('should persist useSimilarity to localStorage', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const vm = wrapper.vm as any
      
      // Set up valid configuration
      vm.selectedMode = 'name-it'
      vm.selectedContinents = ['europe']
      vm.similarityEnabled = true
      await wrapper.vm.$nextTick()
      
      // Trigger session start
      vm.handleStart()
      
      // Verify localStorage contains useSimilarity
      const stored = localStorage.getItem('flagiq:sessionConfig')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.useSimilarity).toBe(true)
    })
  })

  describe('UI interaction', () => {
    it('should update similarityEnabled when SimilarityToggle emits change', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const vm = wrapper.vm as any
      expect(vm.similarityEnabled).toBe(false)
      
      // Find and trigger the SimilarityToggle
      const similarityToggle = wrapper.findComponent({ name: 'SimilarityToggle' })
      await similarityToggle.vm.$emit('update:modelValue', true)
      await wrapper.vm.$nextTick()
      
      expect(vm.similarityEnabled).toBe(true)
    })

    it('should toggle between true and false', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const vm = wrapper.vm as any
      const similarityToggle = wrapper.findComponent({ name: 'SimilarityToggle' })
      
      // Initial state
      expect(vm.similarityEnabled).toBe(false)
      
      // Toggle on
      await similarityToggle.vm.$emit('update:modelValue', true)
      await wrapper.vm.$nextTick()
      expect(vm.similarityEnabled).toBe(true)
      
      // Toggle off
      await similarityToggle.vm.$emit('update:modelValue', false)
      await wrapper.vm.$nextTick()
      expect(vm.similarityEnabled).toBe(false)
    })
  })

  describe('Full workflow integration', () => {
    it('should complete full flow: load config -> change similarity -> save -> verify', async () => {
      // Step 1: Save initial config
      const initialConfig: SessionConfig = {
        continents: ['europe'],
        mode: 'name-it',
        count: 10,
        blitz: false,
        useSimilarity: false
      }
      localStorage.setItem('flagiq:sessionConfig', JSON.stringify(initialConfig))
      
      const pinia = createPinia()
      setActivePinia(pinia)
      
      // Step 2: Mount component (loads from localStorage)
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router, pinia]
        }
      })
      
      const vm = wrapper.vm as any
      expect(vm.similarityEnabled).toBe(false)
      
      // Step 3: Enable similarity
      const similarityToggle = wrapper.findComponent({ name: 'SimilarityToggle' })
      await similarityToggle.vm.$emit('update:modelValue', true)
      await wrapper.vm.$nextTick()
      
      expect(vm.similarityEnabled).toBe(true)
      
      // Step 4: Start session (saves config)
      vm.handleStart()
      
      // Step 5: Verify localStorage was updated
      const stored = localStorage.getItem('flagiq:sessionConfig')
      const parsed = JSON.parse(stored!)
      expect(parsed.useSimilarity).toBe(true)
      
      // Step 6: Verify session store has updated config
      const sessionStore = useSessionStore()
      expect(sessionStore.config.useSimilarity).toBe(true)
    })
  })
})
