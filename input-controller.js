export class InputController {
    enabled = true

    focused = true

    activeActions = []

    activeActionsHide = {}

    ACTION_ACTIVATED = 'input-controller:action-activated'

    ACTION_DEACTIVATED = 'input-controller:action-deactivated'

    constructor(actionsToBind = {}, target = null, plugins = {}) {
        this.focusOnHandler = this.focusOnHandler.bind(this)
        this.focusOffHandler = this.focusOffHandler.bind(this)

        this.actions = actionsToBind
        this.$target = target
        this.plugins = plugins
    }

    enableController() { this.enabled = true }

    disableController() { this.enabled = false; this.activeActions = [] }

    enableAction(actionName) { this.actions[actionName] ? this.actions[actionName].enabled = true : null }

    disableAction(actionName) { this.actions[actionName] ? this.actions[actionName].enabled = false : null }

    bindActions(actionsToBind) { this.actions = { ...this.actions, ...actionsToBind } }

    focusOnHandler() { this.focused = true }

    focusOffHandler() { this.focused = false }

    registerPlugin(pluginObject) {
        const { type, plugin } = pluginObject

        if (this.plugins[type]) return

        this.plugins[type] = plugin
    }

    removePlugin(pluginType) {
        if (!this.plugins[pluginType]) return

        if (this.$target) this.plugins[pluginType].detachPlugin()

        delete this.plugins[pluginType]
    }

    dispatchCustomEvent(customEventName) {
        const customEvent = new CustomEvent(
            customEventName,
            { detail: { actions: this.activeActions } }
        )

        this.$target.dispatchEvent(customEvent)
    }

    isTriggeredActions(field, code) {
        const actionsArray = Object.entries(this.actions)

        const shouldActions = actionsArray.reduce(
            ( acc, [actionName, action] ) =>
                action[field].includes(code) && this.actions[actionName].enabled ?
                    [ ...acc, actionName ]
                    :
                    acc,
            [])


        if (
            this.enabled &&
            this.focused &&
            shouldActions.length
        ) {
            return shouldActions
        }
    }

    detach() {
        if (this.$target) {
            for (const plugin in this.plugins) { this.plugins[plugin].detachPlugin() }
            this.plugins = {}

            this.$target.removeEventListener('focus', this.focusOnHandler)
            this.$target.removeEventListener('blur', this.focusOffHandler)

            this.$target = null
        }

        this.enabled = false
    }

    attach(target, dontEnabled) {
        if (dontEnabled) return

        if (this.$target !== target) { this.detach(); this.enabled = true }

        this.$target = target

        if (this.$target) {
            for (const plugin in this.plugins) {
                this.plugins[plugin].attachPlugin()
            }

            this.$target.addEventListener('focus', this.focusOnHandler)
            this.$target.addEventListener('blur', this.focusOffHandler)
        }
    }

    isActionActive(actionName) { return this.activeActions.includes(actionName) }
}
