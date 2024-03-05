export class KeyboardPlugin {
    activeKeys = []

    KEY_ADD = 'input-controller:key-added'

    KEY_REMOVE = 'input-controller:key-removed'

    PLUGIN_NAME = 'keyboard'

    constructor(controller) {
        this.handleEvent = this.handleEvent.bind(this)
        this.controller = controller
    }

    handleEvent(e) {
        switch (e.type) {
            case 'keydown' : { this.createActionEvent(this.KEY_ADD, this.controller.ACTION_ACTIVATED, e.keyCode); break }
            case 'keyup' : { this.createActionEvent(this.KEY_REMOVE, this.controller.ACTION_DEACTIVATED, e.keyCode); break }
        }
    }

    attachPlugin() {
        this.controller.$target.addEventListener('keydown', this.handleEvent)
        this.controller.$target.addEventListener('keyup', this.handleEvent)
    }

    detachPlugin() {
        this.controller.$target.removeEventListener('keydown', this.handleEvent)
        this.controller.$target.removeEventListener('keyup', this.handleEvent)
    }

    toggleKey(keyboardAction, keyCode) {
        switch (keyboardAction) {
            case this.KEY_ADD : { this.activeKeys.push(keyCode); break }
            case this.KEY_REMOVE : { this.activeKeys = this.activeKeys.filter(key => keyCode !== key) }
        }
    }

    createActionEvent(keyAction, customEventName, keyCode) {
        this.toggleKey(keyAction, keyCode)

        const triggeredActions = this.controller.isTriggeredActions('keys', keyCode)

        if (!triggeredActions || !triggeredActions.length) return

        if (customEventName === this.controller.ACTION_ACTIVATED) {
            const addedActions = []

            triggeredActions.forEach(currentAction => {
                const isCurrentActionActive = this.controller.isActionActive(currentAction)

                if (isCurrentActionActive) {

                    const anotherKeyPress = this.controller.activeActionsHide[currentAction].includes(this.PLUGIN_NAME)

                    if (!anotherKeyPress) this.controller.activeActionsHide[currentAction].push(this.PLUGIN_NAME)

                    return
                }

                this.controller.activeActionsHide[currentAction] = [this.PLUGIN_NAME]
                addedActions.push(currentAction)
            })

            if (addedActions.length) {
                this.controller.activeActions = [...this.controller.activeActions, ...addedActions]

                this.controller.dispatchCustomEvent(customEventName)
            }
        } else {
            const actionsArray = Object.entries(this.controller.actions)

            const maybePrevActions = actionsArray.reduce(
                (acc, [ actionName, { keys }]) =>
                    keys.includes(keyCode) ? [ ...acc, actionName ] : acc, [])

            const prevActions = maybePrevActions.filter(action => {
                const { keys } = this.controller.actions[action]
                return keys.reduce((acc, key) => this.isKeyPressed(key) ? false : acc, true)
            })

            if (prevActions.length) {
                const deletedActions = []

                prevActions.forEach(prevAction => {
                    this.controller.activeActionsHide[prevAction] = this.controller.activeActionsHide[prevAction].filter(plugin => plugin !== this.PLUGIN_NAME)

                    const isActionActive = this.controller.activeActionsHide[prevAction].length

                    if (!isActionActive) {
                        delete this.controller.activeActionsHide[prevAction]
                        deletedActions.push(prevAction)
                    }
                })

                if (deletedActions.length) {
                    this.controller.activeActions = this.controller.activeActions.filter(action => !deletedActions.includes(action))

                    this.controller.dispatchCustomEvent(customEventName)
                }
            }
        }
    }

    isKeyPressed(keyCode) { return this.activeKeys.includes(keyCode) }
}