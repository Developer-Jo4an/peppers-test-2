export class InputController {
    enabled = true

    focused = true

    activeAction = ''

    ACTION_ACTIVATED = 'input-controller:action-activated'

    ACTION_DEACTIVATED = 'input-controller:action-deactivated'

    activeKeys = []

    KEY_ADD = 'input-controller:key-added'

    KEY_REMOVE = 'input-controller:key-removed'

     constructor(actionsToBind = {}, target = null) {
            this.actions = actionsToBind
            this.$target = target
    }

    bindActions(actionsToBind) {
        this.actions = { ...this.actions, ...actionsToBind }
        console.log(`bind actions: ${this.actions}`)
    }

    enableAction(actionName) {
        this.actions[actionName] ?
            this.actions[actionName].enabled = true
            :
            null
        console.log(`enable action: ${this.actions}`)
    }

    disableAction(actionName) {
        this.actions[actionName] ?
            this.actions[actionName].enabled = false
            :
            null
        console.log(`disable action: ${this.actions}`)
    }

    enableController() {
        this.enabled = true
        console.log(`enabled controller: ${this.enabled}`)
    }

    disableController() {
        this.enabled = false
        console.log(`enabled controller: ${this.enabled}`)
    }

    isPossibleAction(keyCode) {
        const actionsArray = Object.entries(this.actions)

        const shouldAction = actionsArray.find(( [_, { keys }] ) => keys.includes(keyCode))

        const actionName = shouldAction ? shouldAction[0] : false

        if (
            this.enabled &&
            this.focused &&
            this.$target &&
            this.actions[actionName] &&
            this.actions[actionName].enabled
        ) return actionName
    }

    toggleKey(action, keyCode) {
        const isControllerHaveKey = this.activeKeys.includes(keyCode)

        switch (action) {
            case this.KEY_ADD : {
                !isControllerHaveKey ?
                    this.activeKeys.push(keyCode)
                    :
                    null
                break
            }
            case this.KEY_REMOVE : {
                isControllerHaveKey ?
                    this.activeKeys = this.activeKeys.filter(key => keyCode !== key)
                    :
                    null
                break
            }
        }
    }


    createActionEvent(keyAction, customEventName, keyCode) {
        this.toggleKey(keyAction, keyCode)

        const triggeredAction = this.isPossibleAction(keyCode)

        if (triggeredAction) {
            const customEvent = new CustomEvent(customEventName, { detail: { actionName: triggeredAction } } )
            this.$target.dispatchEvent(customEvent)

            this.activeAction = customEventName === this.ACTION_ACTIVATED ?
                triggeredAction
                :
                ''
        }
    }

    keyDownHandler(e) { this.createActionEvent(this.KEY_ADD, this.ACTION_ACTIVATED, e.keyCode) }

    keyUpHandler(e) { this.createActionEvent(this.KEY_REMOVE, this.ACTION_DEACTIVATED, e.keyCode) }

    attach(target, dontEnabled) {
        if (dontEnabled) return

        this.$target = target

		if (this.$target) {
            this.$target.addEventListener('keydown', this.keyDownHandler.bind(this))
			this.$target.addEventListener('keyup', this.keyUpHandler.bind(this))
            this.$target.addEventListener('focus', this.focusOnEvent.bind(this))
            this.$target.addEventListener('blur', this.focusOffEvent.bind(this))
		}
	}

    detach() {
        this.$target.removeEventListener('keydown', this.keyDownHandler)
        this.$target.removeEventListener('keyup', this.keyUpHandler)
        this.$target.removeEventListener('focus', this.focusOnEvent)
        this.$target.removeEventListener('blur', this.focusOffEvent)

        this.$target = null
        this.enabled = false
    }

    focusOnEvent() { this.focused = true }

    focusOffEvent() { this.focused = false }

    isActionActive(actionName) { return actionName === this.activeAction }

    isKeyPressed(keyCode) { return this.activeKeys.includes(keyCode) }
}
