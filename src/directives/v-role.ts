import { Directive } from 'vue'

const vRole: Directive = {
  mounted(el, binding) {
    const userRole = localStorage.getItem('role')
    const allowedRoles = binding.value as string[]
    if (!allowedRoles.includes(userRole)) {
      el.style.display = 'none'
    }
  }
}

export default vRole
