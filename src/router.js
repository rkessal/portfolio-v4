import { canvas } from './canvas.js'
import { executeTransition } from './transitions/pageTransitions.js'

const routes = [
  {
    pattern: /^\/$/,
    namespace: 'home',
    loader: () => import('./pages/home/home.js'),
  },
  {
    pattern: /^\/about$/,
    namespace: 'about',
    loader: () => import('./pages/about/about.js')
  },
  {
    pattern: /^\/projects\/(?<id>[^/]+)$/,
    namespace: 'project',
    loader: () => import('./pages/projects/projects.js')
  },
  {
    pattern: /^.*$/,
    namespace: '404',
    loader: () => import('./pages/not-found/not-found.js')
  },
]

class Router {
  constructor() {
    this.currentNamespace = null
    this.isTransitioning = false
  }

  matchRoute(path) {
    for (const route of routes) {
      const match = path.match(route.pattern)
      if (match) {
        return { route, params: match.groups ?? {} }
      }
    }
    return null
  }

  async loadInitialPage() {
    const path = window.location.pathname
    const { route, params } = this.matchRoute(path)

    const pageModule = await route.loader()

    const content = document.querySelector('#page_content')
    content.innerHTML = pageModule.default({ params })

    const container = document.querySelector('[data-transition="container"]')
    container.setAttribute('data-namespace', route.namespace)

    if (pageModule.init) {
      await pageModule.init({ container });
      canvas.emit('init', { namespace: route.namespace, params })
    }

    this.currentNamespace = route.namespace
    this.currentModule = pageModule
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

      if (this.isTransitioning || canvas.isTransitioning()) return

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
    if (this.isTransitioning || canvas.isTransitioning()) return
    this.isTransitioning = true

    try {
      const { route, params } = this.matchRoute(path)

      const isDynamic = Object.keys(params).length > 0
      if (!isDynamic && this.currentNamespace === route.namespace) return

      const pageModule = await route.loader()

      await executeTransition({
        nextHTML: pageModule.default({ params }),
        nextNamespace: route.namespace,
        nextModule: pageModule,
        currentModule: this.currentModule,
        params,
      })

      this.currentNamespace = route.namespace
      this.currentModule = pageModule
    } finally {
      this.isTransitioning = false
    }
  }
}

export const router = new Router()