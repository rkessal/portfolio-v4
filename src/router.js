import { executeTransition } from './transitions/pageTransitions.js'

const routes = {
  '/': {
    namespace: 'home',
    loader: () => import('./pages/home/home.js')
  },
  '/about': {
    namespace: 'about',
    loader: () => import('./pages/about/about.js')
  },
}

class Router {
  constructor() {
    this.currentNamespace = null
    this.isTransitioning = false
  }

  async loadInitialPage() {
    const path = window.location.pathname
    const route = routes[path]

    console.log(route)
    const pageModule = await route.loader()

    const content = document.querySelector('#page_content')
    content.innerHTML = pageModule.default()


    const container = document.querySelector('[data-transition="container"]')
    container.setAttribute('data-namespace', route.namespace)

    if (pageModule.init) {
      pageModule.init({ container });
    }

    this.currentNamespace = route.namespace
  }

  async navigate(path) {
    if (this.isTransitioning || window.location.pathname === path) return

    window.history.pushState({}, '', path)

    await this.performTransition(path)
  }

  async init() {
    await this.loadInitialPage()

    document.addEventListener('click', e => {
      const link = e.target.closest('a')

      if (!link || !link.href.startsWith(window.location.origin)) return

      e.preventDefault()

      if (this.isTransitioning) return

      const path = new URL(link.href).pathname
      this.navigate(path)
    })

    window.addEventListener('popstate', () => {
      if (!this.isTransitioning) {
        this.performTransition(window.location.pathname)
      }
    })
  }

  async performTransition(path) {
    if (this.isTransitioning) return
    this.isTransitioning = true

    try {
      const route = routes[path]

      if (!route || this.currentNamespace === route.namespace) return

      const pageModule = await route.loader()

      await executeTransition({
        nextHTML: pageModule.default(),
        nextNamespace: route.namespace,
        nextModule: pageModule,
      })

      this.currentNamespace = route.namespace
    } finally {
      this.isTransitioning = false
    }
  }
}

export const router = new Router()