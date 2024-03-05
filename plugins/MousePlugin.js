export class MousePlugin {
    activeButtons = []

    BUTTON_ADD = 'input-controller:button-added'

    BUTTON_REMOVE = 'input-controller:button-removed'

    PLUGIN_NAME = 'mouse'

    constructor(controller) {
        this.contextMenuOff = this.contextMenuOff.bind(this)
        this.handleEvent = this.handleEvent.bind(this)
        this.controller = controller
    }

    contextMenuOff(e) { e.preventDefault() }

    handleEvent(e) {
        switch (e.type) {
            case 'mousedown' : { this.createActionEvent(this.BUTTON_ADD, this.controller.ACTION_ACTIVATED, e.button) ; break }
            case 'mouseup' : { this.createActionEvent(this.BUTTON_REMOVE, this.controller.ACTION_DEACTIVATED, e.button); break }
        }
    }

    attachPlugin() {
        this.controller.$target.addEventListener('mousedown', this.handleEvent)
        this.controller.$target.addEventListener('mouseup', this.handleEvent)
        this.controller.$target.addEventListener('contextmenu', this.contextMenuOff)
    }

    detachPlugin() {
        this.controller.$target.removeEventListener('mousedown', this.handleEvent)
        this.controller.$target.removeEventListener('mouseup', this.handleEvent)
        this.controller.$target.removeEventListener('contextmenu', this.contextMenuOff)
    }

    toggleButton(mouseAction, button) {
        switch (mouseAction) {
            case this.BUTTON_ADD : { this.activeButtons.push(button); break }
            case this.BUTTON_REMOVE : { this.activeButtons = this.activeButtons.filter(buttonCode => button !== buttonCode); break }
        }
    }

    createActionEvent(mouseAction, customEventName, button) {
        this.toggleButton(mouseAction, button)

        const triggeredActions = this.controller.isTriggeredActions('buttons', button)

        if (!triggeredActions || !triggeredActions.length) return

        if (customEventName === this.controller.ACTION_ACTIVATED) {
            const addedActions = []

            triggeredActions.forEach(currentAction => {
                const isCurrentActionActive = this.controller.isActionActive(currentAction)

                if (isCurrentActionActive) {
                    const anotherBtnPress = this.controller.activeActionsHide[currentAction].includes(this.PLUGIN_NAME)

                    if (!anotherBtnPress) this.controller.activeActionsHide[currentAction].push(this.PLUGIN_NAME)

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
                (acc, [ actionName, { buttons }]) =>
                    buttons.includes(button) ? [ ...acc, actionName ] : acc, [])

            const prevActions = maybePrevActions.filter(action => {
                const { buttons } = this.controller.actions[action]
                return buttons.reduce((acc, button) => this.isButtonPressed(button) ? false : acc, true)
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

    isButtonPressed(button) { return this.activeButtons.includes(button) }
}