import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SessionSetupPanel from './SessionSetupPanel.vue'
import { DEFAULT_SESSION_CONFIG } from '@/types/session'
import type { SessionConfig, GameMode } from '@/types/session'

describe('SessionSetupPanel - Task 1.1 Verification', () => {
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

  describe('Default initialization', () => {
    it('should initialize selectedCount to "all" from DEFAULT_SESSION_CONFIG', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      // Access the component's internal state
      const vm = wrapper.vm as any
      expect(vm.selectedCount).toBe('all')
    })

    it('should verify DEFAULT_SESSION_CONFIG.count is "all"', () => {
      expect(DEFAULT_SESSION_CONFIG.count).toBe('all')
    })

    it('should render QuestionCountPicker with "all" selected', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      
      const questionCountPicker = wrapper.findComponent({ name: 'QuestionCountPicker' })
      expect(questionCountPicker.exists()).toBe(true)
      expect(questionCountPicker.props('modelValue')).toBe('all')
    })
  })
})

describe('SessionSetupPanel - Task 3.1 Verification', () => {
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

  describe('canStart computed property - Requirement 2.2 & 2.4', () => {
    it('should disable start button when selectedMode is null (Req 2.2)', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      const vm = wrapper.vm as any
      
      // Component starts with null mode and all continents
      expect(vm.selectedMode).toBeNull()
      expect(vm.selectedContinents.length).toBeGreaterThan(0)
      
      // Button should be disabled when mode is null
      expect(vm.canStart).toBe(false)
      
      const startButton = wrapper.findComponent({ name: 'StartSessionButton' })
      expect(startButton.props('disabled')).toBe(true)
    })

    it('should disable start button when continents is empty even with valid mode', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      const vm = wrapper.vm as any
      
      // Set valid mode but empty continents
      vm.selectedMode = 'name-it'
      vm.selectedContinents = []
      
      expect(vm.canStart).toBe(false)
      
      const startButton = wrapper.findComponent({ name: 'StartSessionButton' })
      expect(startButton.props('disabled')).toBe(true)
    })

    it('should enable start button when both mode is set and continents is not empty (Req 2.4)', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      const vm = wrapper.vm as any
      
      // Set valid mode and keep default continents
      vm.selectedMode = 'name-it'
      await wrapper.vm.$nextTick()
      
      expect(vm.selectedContinents.length).toBeGreaterThan(0)
      expect(vm.canStart).toBe(true)
      
      const startButton = wrapper.findComponent({ name: 'StartSessionButton' })
      expect(startButton.props('disabled')).toBe(false)
    })

    it('should enable start button for all valid game modes', async () => {
      const validModes: GameMode[] = ['type-it', 'choose-flag', 'find-on-map', 'name-it']
      
      for (const mode of validModes) {
        const wrapper = mount(SessionSetupPanel, {
          global: {
            plugins: [router]
          }
        })
        const vm = wrapper.vm as any
        
        vm.selectedMode = mode
        await wrapper.vm.$nextTick()
        
        expect(vm.selectedContinents.length).toBeGreaterThan(0)
        expect(vm.canStart).toBe(true)
        
        const startButton = wrapper.findComponent({ name: 'StartSessionButton' })
        expect(startButton.props('disabled')).toBe(false)
      }
    })
  })

  describe('handleStart null guard', () => {
    it('should not proceed if selectedMode is null', () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      const vm = wrapper.vm as any
      
      // Ensure mode is null
      vm.selectedMode = null
      
      // Try to call handleStart directly
      const result = vm.handleStart()
      
      // Function should return early (undefined) and not throw
      expect(result).toBeUndefined()
    })

    it('should proceed when selectedMode is valid', async () => {
      const savedConfig: SessionConfig = {
        continents: ['europe', 'asia'],
        mode: 'name-it',
        count: 25,
        blitz: false
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
      
      // Verify mode is set from saved config
      expect(vm.selectedMode).toBe('name-it')
      expect(vm.canStart).toBe(true)
      
      // handleStart should work without throwing
      expect(() => vm.handleStart()).not.toThrow()
    })
  })

  describe('Mode selection state changes', () => {
    it('should update canStart when mode changes from null to valid', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      const vm = wrapper.vm as any
      
      // Start with null mode
      expect(vm.selectedMode).toBeNull()
      expect(vm.canStart).toBe(false)
      
      // Change to valid mode
      vm.selectedMode = 'type-it'
      await wrapper.vm.$nextTick()
      
      // canStart should now be true
      expect(vm.canStart).toBe(true)
    })

    it('should update canStart when continents change from empty to populated', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [router]
        }
      })
      const vm = wrapper.vm as any
      
      // Set mode but clear continents
      vm.selectedMode = 'name-it'
      vm.selectedContinents = []
      await wrapper.vm.$nextTick()
      expect(vm.canStart).toBe(false)
      
      // Add a continent
      vm.selectedContinents = ['europe']
      await wrapper.vm.$nextTick()
      
      // canStart should now be true
      expect(vm.canStart).toBe(true)
    })
  })
})
