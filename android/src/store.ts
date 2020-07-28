import { reactive, computed } from 'vue'

export interface Store {
  loading: boolean
  agreed: boolean
  disabled: boolean
}

const store: Store =  reactive({
  loading: false,
  agreed: false,
  disabled: computed(() => {
    return store.loading || !store.agreed
  }),
})

export default store
