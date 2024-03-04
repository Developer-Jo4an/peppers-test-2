export class InputController {
    enabled = true

    focused = true

    activeActions = []

    ACTION_ACTIVATED = 'input-controller:action-activated'

    ACTION_DEACTIVATED = 'input-controller:action-deactivated'

    activeKeys = []

    KEY_ADD = 'input-controller:key-added'

    KEY_REMOVE = 'input-controller:key-removed'

    constructor(actionsToBind = {}, target = null) {
        this.keyDownHandler = this.keyDownHandler.bind(this)
        this.keyUpHandler = this.keyUpHandler.bind(this)
        this.focusOnHandler = this.focusOnHandler.bind(this)
        this.focusOffHandler = this.focusOffHandler.bind(this)
        this.actions = actionsToBind
        this.$target = target
    }

    enableController() { this.enabled = true }

    disableController() { this.enabled = false }

    enableAction(actionName) { this.actions[actionName] ? this.actions[actionName].enabled = true : null }

    disableAction(actionName) { this.actions[actionName] ? this.actions[actionName].enabled = false : null }

    bindActions(actionsToBind) { this.actions = { ...this.actions, ...actionsToBind } }

    isPossibleActions(keyCode) {
        const actionsArray = Object.entries(this.actions)

        const shouldActions = actionsArray.reduce(( acc, [actionName, { keys }] ) => keys.includes(keyCode) && this.actions[actionName].enabled ? [ ...acc, actionName ] : acc, [])

        if (
            this.enabled &&
            this.focused &&
            this.$target &&
            shouldActions.length
        ) {
            return shouldActions
        }
    }

    toggleKey(action, keyCode) {
        const isControllerHaveKey = this.activeKeys.includes(keyCode)

        switch (action) {
            case this.KEY_ADD : {
                !isControllerHaveKey ? this.activeKeys.push(keyCode) : null
                break
            }
            case this.KEY_REMOVE : {
                isControllerHaveKey ? this.activeKeys = this.activeKeys.filter(key => keyCode !== key) : null
                break
            }
        }
    }

    createActionEvent(keyAction, customEventName, keyCode) {
        const dispatchCustomEvent = customEventName => {
            const customEvent = new CustomEvent(
                customEventName,
                { detail: { actions: this.activeActions } }
            )

            this.$target.dispatchEvent(customEvent)
        }

        this.toggleKey(keyAction, keyCode)

        const triggeredActions = this.isPossibleActions(keyCode)

        if (!triggeredActions) return

        if (customEventName === this.ACTION_ACTIVATED) {
            const newActivatedActions = []
            triggeredActions.forEach(actionName => !this.isActionActive(actionName) ? newActivatedActions.push(actionName) : null)

            if (newActivatedActions.length) {
                this.activeActions = [...this.activeActions, ...newActivatedActions]

                dispatchCustomEvent(customEventName)
            }
        } else {
            const maybePrevActions = Object.entries(this.actions).reduce(
                (acc, [ actionName, { keys } ]) =>
                    keys.includes(keyCode) ? [ ...acc, actionName ] : acc, [])

            const prevActions = maybePrevActions.filter(action => {
                const { keys } = this.actions[action]
                return keys.reduce((acc, key) => this.isKeyPressed(key) ? false : acc, true)
            })

            if (prevActions.length) {
                this.activeActions = this.activeActions.filter(action => !prevActions.includes(action))

                dispatchCustomEvent(customEventName)
            }
        }
    }

    keyDownHandler(e) { this.createActionEvent(this.KEY_ADD, this.ACTION_ACTIVATED, e.keyCode) }

    keyUpHandler(e) { this.createActionEvent(this.KEY_REMOVE, this.ACTION_DEACTIVATED, e.keyCode) }

    focusOnHandler() { this.focused = true }

    focusOffHandler() { this.focused = false }

    attach(target, dontEnabled) {
        if (dontEnabled) return

        this.$target = target

        if (this.$target) {
            this.$target.addEventListener('keydown', this.keyDownHandler)
            this.$target.addEventListener('keyup', this.keyUpHandler)
            this.$target.addEventListener('focus', this.focusOnHandler)
            this.$target.addEventListener('blur', this.focusOffHandler)
        }
    }

    detach() {
        this.$target.removeEventListener('keydown', this.keyDownHandler)
        this.$target.removeEventListener('keyup', this.keyUpHandler)
        this.$target.removeEventListener('focus', this.focusOnHandler)
        this.$target.removeEventListener('blur', this.focusOffHandler)

        this.$target = null
        this.enabled = false
    }

    isActionActive(actionName) { return this.enabled && this.focused ? this.activeActions.includes(actionName) : '' }

    isKeyPressed(keyCode) { return this.enabled && this.focused ? this.activeKeys.includes(keyCode) : '' }
}
