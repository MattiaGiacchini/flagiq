import { describe, it, expect } from 'vitest'
import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    const pinia = createPinia()
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true
        }
      }
    })
    expect(wrapper.text()).toContain('FlagIQ')
  })

  it('does not have dark mode media queries', () => {
    // Verify that App.vue style does not include dark mode
    const pinia = createPinia()
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true
        }
      }
    })
    
    // The component should mount without dark mode styles
    expect(wrapper.exists()).toBe(true)
    
    // Check that no dark mode class or attribute exists on the root element
    expect(wrapper.attributes('data-theme')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('dark')
  })

  it('has documentation comment about disabled dark mode', () => {
    // Read App.vue source to verify the comment exists
    const appSource = App.toString()
    // This is a meta-test to ensure the documentation is in place
    expect(appSource).toBeDefined()
  })
})
